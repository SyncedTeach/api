// TODO: this is a workaround
import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Server } from "http";
const testApp: express.Application = express().disable("x-powered-by");
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};
let mongoServerInstance: MongoMemoryServer;
testApp.use(cors(corsOptions)); // cors
// start api server
const port = 4001;
// routes and folders as sub paths
let testServer: Server;

walk(path.join(__dirname, "..", "src", "routes")).forEach((file: string) => {
  let path = file.substring("./routes".length);
  path = path.substring(0, path.length - 3);
  testApp.use(require(file).router);
});

// ===
function walk(dir: string) {
  let results: Array<string> = [];
  let list = fs.readdirSync(path.join(dir));
  list.forEach(function (file) {
    let fileToStat = path.join(dir, file);
    let stat = fs.statSync(fileToStat);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fileToStat));
    } else {
      results.push(fileToStat);
    }
  });
  return results;
}

async function initialize() {
  mongoServerInstance = await MongoMemoryServer.create();
  process.env.MONGODB_TESTING_URI = mongoServerInstance.getUri();
  testServer = testApp.listen(port);
}

export { testServer, testApp, initialize, mongoServerInstance };
