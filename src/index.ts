import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";

// cors
const corsOptions = {
    origin: "http://localhost:3000",
};

// app
const app: express.Application = express().disable("x-powered-by");
app.use(cors(corsOptions));
// routes and folders as sub paths
walk(path.join(__dirname, "routes")).forEach((file: string) => {
    let path = file.substring("./routes".length);
    path = path.substring(0, path.length - 3);
    app.use(require(file).router);
});

// server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
// database
mongoose
    .connect(process.env.MONGODB_URI as string)
    .catch((error) => console.log(error.stack));
mongoose.connection.on("connected", async () => {
    console.log("Connected to database!");
});

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
