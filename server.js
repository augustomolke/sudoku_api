const express = require("express");
const solver = require("./solver.js");
const cors = require("cors");
const bodyParser = require("body-parser");
const { builtinModules } = require("module");
const api = express();
api.use(bodyParser.json());
api.use(cors());

let solution = [];

// api.use(function (req, res, next) {
//   var allowedOrigins = ["http://127.0.0.1"];
//   var origin = req.headers.origin;
//   if (allowedOrigins.indexOf(origin) > -1) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }
//   //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
//   res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", true);
//   return next();
// });

api.post("/", async (request, response) => {
  let max = request.query.max;
  let init = request.body;
  console.log(init);
  solution = await solver(init, max);
  response.send(solution);
});

api.listen(3000, () => {
  console.log("Servidor de pé");
});
