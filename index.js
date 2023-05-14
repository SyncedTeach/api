const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const bodyParser = require('body-parser');
// app
const app = express().disable('x-powered-by');

// vars
let files = []

// routes and folders as sub paths
walk('./routes').forEach((file) => {
    let path = file.substring("./routes".length);

    path = path.substring(0, path.length - 3);
    files.push("./routes" + path + ".js")
    const route = require("./routes" + path + ".js")
    path = path.replace(".", ":")
    path = path.replace("_", "")
    if(path == "/index"){
        path = "/"
    }
    app[route.httpMethod](path.replace("_", ":"), async (req, res) => {
        await route.run(this, req, res);
    });    
});

// server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    }
);

function walk(dir) {
    var results = [];
    var list = fs.readdirSync(dir);    
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}