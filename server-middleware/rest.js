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
  for (let obj of slides) {
    console.log("slides",slides);
    let filename = obj.Key.slice(0, -4);
    console.log("filename",filename);
    if (fs.existsSync("converted/" + filename)) {
      fs.rmdirSync("converted/" + filename);
    }
    fs.mkdirSync(path.join(__dirname, "converted", filename), 0o777);
    console.log("mkdir");
    await sharp("./upload-svs/" + obj.Key, {
      limitInputPixels: false
    })
      .jpeg()
      .tile({
        size: 512
      })
      .toFile(path.join(__dirname, "converted", filename, filename + ".dz"));
    console.log("after sharp");
  }
}
const convertSync = util.promisify(convertDzi);
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
    } catch (err) {
      console.log(err);
    }
  }
  res.json({data:writes});
});
app.post("/convert", async (req, res) => {
  try {
    console.log('convert rest');
    convertDzi(req.body.slides);
    res.json({ data: "converting..." });
  } catch (err) {
    console.log(err);
  }
});
app.all("/upload", async (req, res) => {
  const readSync = util.promisify(read);
  async function read(dir, dirPath, uploads) {
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
        let uploadResult = await upload(name, key, uploads);
      } else {
        read(name, target, uploads);
      }
    }
    return uploads;
  }
  function upload(name, key) {
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
        let date = new Date()
          .toJSON()
          .slice(0, 10)
          .replace(/-/g, "/");
        let uploadResult = {
          name,
          key,
          err,
          data,
          date
        };
        if (path.extname(key) == ".dzi") {
          let logname = path.basename(key).slice(0, -4);
          fs.writeFileSync(
            "./content/" + logname + ".json",
            JSON.stringify(uploadResult)
          );
        }
        return uploads;
      });
  }
  try {
    res.json({ data: "uploading" });
    let uploads = [];
    let imports = await readSync("converted", "./server-middleware",uploads);
    fs.writeFileSync("./content/imports.json",JSON.stringify(imports));
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
