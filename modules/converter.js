var AWS = require("aws-sdk");
const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const rimraf = require("rimraf");
const util = require("util");
const csv = require("csvtojson");


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
  let errors = [];
  for (let obj of slides) {
    let filename = obj.slice(0, -4);
    console.log(filename);
    fs.mkdir(filename);
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
          errors.push({
            error: err,
            slide: filename
          });
        } else {
          console.log(info);
          uploadDir(filename, "biochain", filename);
        }
      });
  }
  return errors;
}

async function main() {
  let slides = fs
    .readdirSync("./upload-svs")
    .filter(slide => slide.endsWith(".svs"));
  let errors = await convertDzi(slides);
  const master = await csv().fromFile("./static/slides.csv");

  let masterFiles = [];
  for (let i of master) {
    masterFiles.push({
      slide: i.slide,
      product: i.Notes,
      name: i.Name,
      date: "",
      status: "unknown"
    });
  }
  let latest = [];
  for (let k of slides) {
    latest.push({
      slide: k.replace(".svs", ""),
      product: "",
      name: "",
      date: Date.now(),
      status: "unknown"
    });
  }
  fs.writeFileSync("./errors.json", JSON.stringify(errors));
  fs.writeFileSync("./latest-slides.json", JSON.stringify(latest));
  fs.writeFileSync("./master.json", JSON.stringify(masterFiles));
  let live = masterFiles.concat(latest);
  let slideCount = 1;
  let slideTotal = live.length;
  for (let slide of live) {
    let key = "converted/" + slide.slide + ".dzi";
    slide.url = "http://biochain.com/slides/?id=" + slide.slide;
    slide.s3uri = "/aws/converted/" + slide.slide + ".dzi";
    slide.product = slide.product;
    slide.name = slide.name;
    const params = {
      Bucket: "biochain",
      Key: key
    };
    try {
      const fileTest = await s3.getObject(params).promise();
      slide.status = "success";
    } catch (err) {
      const fileTest = "Error: " + err.toString();
      slide.status = fileTest;
    }
    console.log("Checking slide "+slideCount+" of "+slideTotal+": "+slide.name);
    slideCount++;
  }
  fs.writeFileSync("./live.json", JSON.stringify(live));
  let params = {
    Bucket: "biochain",
    Key: "slides.json",
    Body: fs.readFileSync("./live.json")
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      console.log(err);
      fs.writeFileSync("error.json", JSON.stringify(err));
    } else {
      console.log("Successfully uploaded JSON");
    }
  });
  // var bucketParams = {
  //   Bucket : 'biochain',
  //   Prefix: 'converted/'
  // };

  // Call S3 to obtain a list of the objects in the bucket
  // s3.listObjects(bucketParams, function(err, data) {
  //   if (err) {
  //     console.log("Error", err);
  //   } else {
  //     console.log("Success", data);
  //     fs.writeFileSync("s3.json", JSON.stringify(data));
  //   }
  // });
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
