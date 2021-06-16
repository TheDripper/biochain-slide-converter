const bodyParser = require("body-parser");
const app = require("express")();

app.use(bodyParser.json());
app.all("/getJSON", async (req, res) => {
  let audit = await Promise.all([main()]); 
  console.log(audit);
  console.log("UPLOADS DONE");
  res.json({ data: audit });
});

module.exports = app;