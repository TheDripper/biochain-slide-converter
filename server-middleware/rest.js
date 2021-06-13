const bodyParser = require("body-parser");
const app = require("express")();

var AWS = require("aws-sdk");
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");
const util = require("util");
const csv = require("csvtojson");

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
    let filename = obj.slice(0, -4);
    if (fs.existsSync("converted/" + filename)) {
      fs.rmdirSync("converted/" + filename);
    }
    fs.mkdirSync(path.join(__dirname, "converted", filename), 0o777);
    let sharpResult = await sharp("./upload-svs/" + obj, {
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
const convertSync = util.promisify(convertDzi);
//const uploadSync = util.promisify(uploadDir);

function read(dir,dirPath) {
  // console.log("read:"+dir);
  // console.log("dirPath: "+dirPath);
  let target = path.resolve(dirPath,dir);
  let names = fs.readdirSync(target);
  // console.log("target:"+target);
  // console.log("names:"+names);
  for (let file of names) {
    console.log("file: "+file);
    console.log("target: "+target);
    console.log("dirPath: "+dirPath);
    let name = path.resolve(target, file);
    console.log("name: "+name);
    try {
      let stat = fs.statSync(name);
      if (stat.isFile()) {
        upload(name);
      } else {
        read(name,target);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
async function upload(filePath) {
  let bucketPath =
    "converted/" + filePath.substring(filePath.length + 1).replace(/\\/g, "/");
  let body = fs.readFileSync(filePath);
  let params = {
    Bucket: "biochain-dev",
    Key: bucketPath,
    Body: body
  };
  let filePush = await s3.putObject(params).promise();
  return filePush;
}

async function main() {
  // let params = {
  //   Bucket: "biochain-slide-uploads"
  // };
  // let uploads = await s3.listObjects(params).promise();
  // for (let upload of uploads.Contents) {
  //   let fileParams = {
  //     Bucket: "biochain-slide-uploads",
  //     Key: upload.Key
  //   };
  //   try {
  //     let slide = await s3.getObject(fileParams).promise();
  //     fs.writeFileSync("upload-svs/" + upload.Key, slide.Body);
  //   } catch (err) {
  //   }
  // }
  // let slides = fs
  //   .readdirSync("./upload-svs")
  //   .filter(slide => slide.endsWith(".svs"));
  // let auditResult = await convertDzi(slides);
  // fs.writeFileSync("./audit.json", JSON.stringify(auditResult));
  try {
    // let awsLog = await uploadSync(
    //   path.join(__dirname,"converted"),
    //   "biochain-dev",
    //   "converted"
    // );
    read("converted",__dirname);
  } catch (err) {
    // fs.writeFileSync("./awsLog.json", JSON.stringify(awsLog));
  }
  return "return";
  //
  // return auditResult;
}
app.use(bodyParser.json());
app.all("/getJSON", async (req, res) => {
  let audit = await main();
  console.log("UPLOADS DONE");
  console.log(audit);
  res.json({ data: audit });
});

module.exports = app;
