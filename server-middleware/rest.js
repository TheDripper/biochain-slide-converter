const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const util = require("util");
const csv = require("csvtojson");
const AWS = require("aws-sdk");
const zlib = require("zlib");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './server-middleware/uploads')
  },
  filename: function(req, file, cb) {
    console.log(file.mimetype);
    eb(null, file.fieldname + "-" + Date.now());
  }
});

var upload = multer({
  storage: storage
});

//server.js

// SET STORAGE

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
    let filename = obj.Key.slice(0, -4);
    console.log(filename);
    if (fs.existsSync("converted/" + filename)) {
      fs.rmdirSync("converted/" + filename);
    }
    fs.mkdirSync(path.join(__dirname, "converted", filename), 0o777);
    await sharp("./upload-svs/" + obj.Key, {
      limitInputPixels: false
    })
      .jpeg()
      .tile({
        size: 512
      })
      .toFile(path.join(__dirname, "converted", filename, filename + ".dz"));
  }
  console.log('convert done');
}
const convertSync = util.promisify(convertDzi);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.all("/slides", async (req, res) => {
  const params = {
    Bucket: "biochain-slide-uploads"
  };
  try {
    let uploads = await s3.listObjects(params).promise();
    res.json({ data: uploads });
  } catch (err) {
    console.log(err);
  }
});
app.post("/download", async (req, res) => {
  let writes = [];
  console.log("download", req.body);
  for (let upload of req.body.uploads) {
    let fileParams = {
      Bucket: "biochain-slide-uploads",
      Key: upload.Key
    };
    try {
      console.log("file params", fileParams);
      let slide = await s3.getObject(fileParams).promise();
      console.log("slide done", slide);
      fs.writeFileSync("upload-svs/" + upload.Key, slide.Body);
      writes.push(upload.Key);
    } catch (err) {
      console.log(err);
    }
  }
  res.json({ data: writes });
});
app.post("/convert", async (req, res) => {
  try {
    console.log('convert',req.body.slides);
    convertDzi(req.body.slides);
    res.json({ data: "converting..." });
  } catch (err) {
    console.log(err);
  }
});
app.all("/upload", async (req, res) => {
  const uploadSync = util.promisify(upload);
  const readSync = util.promisify(read);
  let thread = [];
  async function readdirSync(dir, dirPath, uploads) {
    let target = path.resolve(dirPath, dir);
    let names = fs.readdir(target);
    for (let file of names) {
      let name = path.resolve(target, file);
      let key = name.split("server-middleware/")[1];
      let stat = fs.statSync(name);
      if (stat.isFile()) {
        upload(name, key, uploads);
      } else {
        read(name, target, uploads);
      }
    }
    console.log("return uploads");
    return uploads;
  }
  async function upload(name, key, uploads) {
    console.log("Upload", key);
    // let bucketPath = "converted/" + name.substring(name.length + 1).replace(/\\/g, "/");
    // let body = fs.readFileSync(name);
    try {
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
            "./content/imports/" + logname + ".json",
            JSON.stringify(uploadResult)
          );
          uploads.push(uploadResult);
        }
        return uploads;
      });
    } catch(err) {
      console.log(err);
    }
  }
  try {
    res.json({ data: "uploading" });
    let uploads = [];
    read("converted", "./server-middleware", uploads);
    console.log("uploading");
    // fs.writeFileSync("./content/imports/imports.json",JSON.stringify(imports));
  } catch (err) {
    console.log(err);
  }
});

app.post("/files", upload.array("files"), function(req, res, err) {
  if(err) {
    console.log(err);
  }
  console.log("files!");
  res.json({ files: req.body.files });
});

module.exports = app;
