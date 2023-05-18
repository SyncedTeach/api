import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import bodyParser from "body-parser";
import path from "path";
// app
const app: express.Application = express().disable("x-powered-by");

// vars
let files: Array<string> = [];

// routes and folders as sub paths
walk(path.join(__dirname, "routes")).forEach((file: string) => {
    let path = file.substring("./routes".length);
    path = path.substring(0, path.length - 3);
    // app[route.httpMethod as string](
    //     path.replace("_", ":"),
    //     async (req: express.Request, res: express.Response) => {
    //         await route.run(this, req, res);
    //     }
    // );
    app.use(require(file).router);
});

// server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

function walk(dir: string) {
    let results: Array<string> = [];
    let list = fs.readdirSync(path.join(dir));
    list.forEach(function (file) {
        let fileToStat = path.join(dir, file);
        console.log(fileToStat);
        let stat = fs.statSync(fileToStat);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fileToStat));
        } else {
            results.push(fileToStat);
        }
    });
    return results;
}
