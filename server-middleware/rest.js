const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");
const util = require("util");
const csv = require("csvtojson");
const AWS = require("aws-sdk");
const zlib = require("zlib");

const s3 = new AWS.S3({
  accessKeyId: "AKIA4EV32R5KQIFS6VRG",
  secretAccessKey: "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"
});

async function convertDzi(slides) {
  let audit = [];
  if (fs.existsSync(path.join(__dirname, "converted"))) {
    fs.rmdirSync(path.join(__dirname, "converted"), { recursive: true });
  }
  fs.mkdirSync(path.join(__dirname, "converted"), 0o777);
  console.log(slides);
  for (let obj of slides) {
    let filename = obj.Key.slice(0, -4);
    if (fs.existsSync("converted/" + filename)) {
      fs.rmdirSync("converted/" + filename);
    }
    fs.mkdirSync(path.join(__dirname, "converted", filename), 0o777);
    let sharpResult = await sharp("./upload-svs/" + obj.Key, {
      limitInputPixels: false
    })
      .jpeg()
      .tile({
        size: 512
      })
      .toFile(path.join(__dirname, "converted", filename, filename + ".dz"));
    audit.push({
      slide: filename,
      result: sharpResult
    });
  }
  return audit;
}
// const convertSync = util.promisify(convertDzi);
//const uploadSync = util.promisify(uploadDir);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.all("/slides", async (req, res) => {
  const params = {
    Bucket: "biochain-slide-uploads"
  };
  try {
    let uploads = await s3.listObjects(params).promise();
    console.log(uploads);
    res.json({ data: uploads });
  } catch (err) {
    console.log(err);
  }
});
app.post("/download", async (req, res) => {
  let writes = [];
  for (let upload of req.body.uploads) {
    let fileParams = {
      Bucket: "biochain-slide-uploads",
      Key: upload.Key
    };
    try {
      let slide = await s3.getObject(fileParams).promise();
      fs.writeFileSync("upload-svs/" + upload.Key, slide.Body);
      writes.push(upload.Key);
      console.log("loop done");
      console.log(writes);
      res.json({ data: writes });
    } catch (err) {
      console.log(err);
    }
  }
});
app.post("/convert", async (req, res) => {
  let converted = await convertDzi(req.body.slides);
  console.log(converted);
  res.json({ data: converted });
});
app.all("/upload", async (req, res) => {
  let uploads = [];
  const readSync = util.promisify(read);
  async function read(dir, dirPath) {
    console.log("calling read: " + dir + ", " + dirPath);
    // console.log("read:" + dir);
    // console.log("dirPath: " + dirPath);
    let target = path.resolve(dirPath, dir);
    let names = fs.readdirSync(target);
    // console.log("target:" + target);
    // console.log("names:" + names);
    for (let file of names) {
      //console.log("file: "+file);
      //console.log("target: "+target);
      //console.log("dirPath: "+dirPath);
      let name = path.resolve(target, file);
      let key = name.split("server-middleware/")[1];
      //console.log("name: "+name);
      let stat = fs.statSync(name);
      if (stat.isFile()) {
        upload(name, key);
        console.log("after upload ");
      } else {
        read(name, target);
        console.log("after read ");
      }
    }
    console.log("after for");
  }
  let uploadSync = util.promisify(upload);

  function upload(name, key) {
    console.log("calling upload, name: " + name + ", key: " + key);
    // let bucketPath = "converted/" + name.substring(name.length + 1).replace(/\\/g, "/");
    // let body = fs.readFileSync(name);
    let body = fs.createReadStream(name).pipe(zlib.createGzip());
    s3.upload({
      Bucket: "biochain-dev",
      Body: body,
      Key: key
    })
      .on("httpUploadProgress", function(evt) {
        console.log("Progress-> " + key + ":", evt.loaded, "/", evt.total);
      })
      .send(function(err, data) {
        // console.log(err, data);
        let date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
        let uploadResult = {
          name,
          key,
          err,
          data,
          date
        };
        console.log("upload result: " + JSON.stringify(uploadResult));
        if (path.extname(key) == ".dzi") {
          let logname = path.basename(key).slice(0, -4);
          fs.writeFileSync(
            "./server-middleware/upload-logs/" + logname + ".json",
            JSON.stringify(uploadResult)
          );
        }
      });
    console.log("upload return");
  }
  try {
    let logfile = fs.createWriteStream("logfile.json");
    let readCall = readSync("converted", "./server-middleware");
    res.json(readSync);
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
