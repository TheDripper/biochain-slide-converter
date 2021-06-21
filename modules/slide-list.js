const slides = '~/slide-list.csv'
const fs = require("fs");
export default async function asyncModule() {
    try {
      let imports = [];
     let importlogs = fs.readdirSync("./server-middleware/upload-logs");     
     for (let importlog of importlogs) {
       let logdata = fs.readFileSync("./server-middleware/upload-logs/"+importlog,"utf8");
      imports.push(JSON.parse(logdata));
     }
     fs.writeFileSync("imports.json",JSON.stringify(imports));
    } catch (err) {
      console.log(err);
    }
  }