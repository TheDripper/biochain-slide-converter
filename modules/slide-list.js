const fs = require("fs");
const csv = require("csvtojson");
const path = require("path");
export default async function asyncModule() {
  try {
    const slides = await csv().fromFile("./static/slides.csv");
    let uploads = fs.readdirSync("./content/imports");
    for (let og of slides) {
      og.date = "2020";
    }
    for (let slide of uploads) {
      let file = fs.readFileSync(path.join("./content/imports", slide));
      file = JSON.parse(file);
      let name = path.basename(slide);
      let ext = path.extname(slide);
      name = name.replace(ext, "");
      let date = file.date;
      let slideObj = {
        Name: name,
        slide: name,
        Notes: "",
        date
      };
      slides.push(slideObj);
    }
    fs.writeFileSync("imports.json", JSON.stringify(slides));
  } catch (err) {
    console.log(err);
  }
}
