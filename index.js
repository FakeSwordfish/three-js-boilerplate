import express from "express";
import path from "path";

const app = express();
const targetFiles = "public";

app.set("port", process.env.PORT || 8080);

app.use(express.static(targetFiles));

app.listen(app.get("port"), function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Running on port: " + app.get("port"));
  }
});
