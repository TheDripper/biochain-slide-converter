var AWS = require("aws-sdk");
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");
const util = require("util");

const s3 = new AWS.S3({
  accessKeyId: "AKIA4EV32R5KYPYOXCXF",
  secretAccessKey: "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"
});
const uploadDir = function(s3Path, bucketName, filename) {
  //    let s3 = new AWS.S3();

  function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function(name) {
      var filePath = path.join(currentDirPath, name);
      console.log(filePath);
      var stat = fs.statSync(filePath);
      if (stat.isFile()) {
        callback(filePath, stat);
      } else if (stat.isDirectory()) {
        walkSync(filePath, callback);
      }
    });
  }

  walkSync(s3Path, function(filePath, stat) {
    let bucketPath =
      "converted/" + filePath.substring(s3Path.length + 1).replace(/\\/g, "/");
    let params = {
      Bucket: bucketName,
      Key: bucketPath,
      Body: fs.readFileSync(filePath)
    };
    s3.putObject(params, function(err, data) {
      if (err) {
        console.log(err);
        fs.writeFileSync("error.json", JSON.stringify(err));
      } else {
        console.log(
          "Successfully uploaded " + bucketPath + " to " + bucketName
        );
        fs.unlinkSync(filePath);
        console.log("deleted" + filePath);
      }
    });
  });
  console.log("walkdone");
};
// const s3uploadDir = util.promisify(uploadDir);
async function convertDzi(slides) {
  for (let obj of slides) {
    let filename = obj.slice(0, -4);
    console.log(filename);
    fs.mkdir(filename);
    console.log(obj);
    await sharp("./upload-svs/" + obj, {
      limitInputPixels: false
    })
      .jpeg()
      .tile({
        size: 512
      })
      .toFile(filename + "/" + filename + ".dz", function(err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
          uploadDir(filename, "biochain", filename);
          // const fileContent = fs.readFileSync(filename+"/"+filename+".dzi");
          // s3.upload({
          //   Bucket: "biochain",
          //   Body: fileContent,
          //   Key: "converted/"+filename+".dzi"
          // }, async function (err, data) {
          //   if (err) {
          //     throw err;
          //   }
          //   console.log(`File uploaded successfully. ${data.Location}`);
          //   console.log('done');
          // });
        }
        // output.dzi is the Deep Zoom XML definition
        // output_files contains 512x512 tiles grouped by zoom level
      });
  }
}

function main() {
  let slides = fs
    .readdirSync("./upload-svs")
    .filter(slide => slide.endsWith(".svs"));
  convertDzi(slides);
  // const filename = "T853448-A604429";
  // uploadDir(filename, "biochain",filename);
  // console.log('next');
}
export default async function asyncModule() {
  try {
    main();
    // uploadDir("converted/"+filename+"_files", "biochain",filename);
  } catch (err) {
    console.log(err);
    fs.writeFileSync("error.txt", JSON.stringify(err));
  }
}
