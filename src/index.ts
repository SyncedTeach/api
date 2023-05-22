import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { logWrite } from "./utilities/log";

// cors
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
};

// app
const app: express.Application = express().disable("x-powered-by");
app.use(cors(corsOptions));

// db
let db_available = false;

app.use((req, res, next) => {
    if (!db_available) {
        res.status(500).send("Database connection failed!");
    } else {
        next();
    }
});

// routes and folders as sub paths
walk(path.join(__dirname, "routes")).forEach((file: string) => {
    let path = file.substring("./routes".length);
    path = path.substring(0, path.length - 3);

    app.use(require(file).router);
});

// error handling in case route error wont crash the server
app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error(err.stack);
        res.status(500).send("Something broke!");
    }
);

// server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    logWrite.info(`Server listening on port ${port}`);
});

// database
mongoose.connect(process.env.MONGODB_URI as string).catch((err) => {
    logWrite.error(err);
    db_available = false;
});
mongoose.connection.on("connected", async () => {
    logWrite.info("Connected to database!");
    db_available = true;
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
