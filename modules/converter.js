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
async function uploadDir(s3Path, bucketName) {
  let logout = [];
  console.log('dir');
  function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function(name) {
      console.log(name);
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      if (stat.isFile()) {
        callback(filePath, stat);
      } else if (stat.isDirectory()) {
        walkSync(filePath, callback);
      }
    });
  }
  walkSync(s3Path, async function(filePath, stat) {
    let bucketPath =
      "converted/" + filePath.substring(s3Path.length + 1).replace(/\\/g, "/");
      console.log(bucketPath);
    let body = fs.readFileSync(filePath);
    let params = {
      Bucket: bucketName,
      Key: bucketPath,
      Body: body
    };
    let filePush = await s3.putObject(params).promise();
    console.log("push");
    console.log(filePush);
  });
  console.log('done');
  return logout;
};

async function convertDzi(slides) {
  console.log(path.join(__dirname, "converted"));
  let audit = {
    error: [],
    success: []
  };
  try {
    if (fs.existsSync(path.join(__dirname, "converted"))) {
      fs.rmdirSync(path.join(__dirname, "converted"), { recursive: true });
    }
    fs.mkdirSync(path.join(__dirname, "converted"), 0o777);
    for (let obj of slides) {
      let filename = obj.slice(0, -4);
      console.log(filename);
      if (fs.existsSync(path.join(__dirname, "converted/" + filename))) {
        fs.rmdirSync(path.join(__dirname, "converted/" + filename));
      }
      fs.mkdirSync(path.join(__dirname, "converted/" + filename), 0o777);
      await sharp("./upload-svs/" + obj, {
        limitInputPixels: false
      })
        .jpeg()
        .tile({
          size: 512
        })
        .toFile(path.join(__dirname, "converted/" + filename) + ".dz", function(
          err,
          info
        ) {
          if (err) {
            console.log(err);
            audit.error.push({
              error: err,
              slide: filename
            });
          } else {
            console.log(info);
            audit.success.push({
              info,
              slide: filename
            });
          }
        });
    }
  } catch (err) {
    console.log(err);
  }
  return audit;
}
const dziSync = util.promisify(convertDzi);
const uploadSync = util.promisify(uploadDir);

export default async function asyncModule() {
  let slides = fs
    .readdirSync("./upload-svs")
    .filter(slide => slide.endsWith(".svs"));
  // let auditResult = await dziSync(slides);
  let awsLog = await uploadSync(
    path.join(__dirname, "converted"),
    "biochain-dev",
    "converted"
  );
  console.log(awsLog);
  // fs.writeFileSync("./audit.json", JSON.stringify(auditResult));
  fs.writeFileSync("./awsLog.json", JSON.stringify(awsLog));
}
