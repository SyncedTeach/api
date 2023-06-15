import dotenv from "dotenv";
import crypto from "crypto";
import * as envfile from "envfile";
import { resolve } from "path";
import { readFile, writeFileSync, existsSync } from "fs";

const check = async () => {
  dotenv.config();

  let result = {
    setup: true,
    database: true,
  };

  if (process.env.MONGODB_URI == undefined || process.env.MONGODB_URI == "") {
    result.database = false;
    result.setup = false;
  }

  // write a private key to the .env file
  if (process.env.PRIVATE_KEY == undefined || process.env.PRIVATE_KEY == "") {
    let privateKey = crypto.randomBytes(256).toString("hex");
    writeEnvToFile([{ key: "PRIVATE_KEY", value: privateKey }]);

    console.log("Private key generated!");
  }
  return result;
};

const validate = async (key: string) => {
  dotenv.config();

  let result = {
    isValid: true,
  };
  if (key != process.env.PRIVATE_KEY) {
    result.isValid = false;
    console.log("Invalid key!");
  }

  return result;
};

const start = async (key: string, mongouri: string) => {
  dotenv.config();

  let result = {
    success: true,
    message: "Setup complete!",
  };

  if (key != process.env.PRIVATE_KEY) {
    result.success = false;
    result.message = "Invalid key!";
    console.log("Invalid key!");
  }

  if (mongouri == undefined || mongouri == "") {
    result.success = false;
    result.message = "Invalid mongo uri!";
    console.log("Invalid mongo uri!");
  }

  // alr has a database uri
  if (process.env.MONGODB_URI != undefined && process.env.MONGODB_URI != "") {
    result.success = false;
    result.message = "Database uri already set!";
    console.log("Database uri already set!");
  }

  if (result.success) {
    writeEnvToFile([{ key: "MONGODB_URI", value: mongouri }]);
    console.log("Database uri set!");
  }

  return result;
};

export const writeEnvToFile = (
  envVariables: { key: string; value: any }[]
): void => {

  // get `.env` from path of current directory
  const path = resolve(__dirname, "../../.env");
    // create if not exist
  if (!existsSync(path)) {
    // create file
    writeFileSync(path, "");
  }

  readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const parsedFile = envfile.parse(data);
    envVariables.forEach((envVar: { key: string; value: any }) => {
      if (envVar.key && envVar.value) {
        parsedFile[envVar.key] = envVar.value;
      }
    });
    writeFileSync(path, envfile.stringify(parsedFile));

    // NB: You should now be able to see your .env with the new values,
    // also note that any comments or newlines will be stripped from
    // your .env after the writeFileSync, but all your pre-existing
    // vars should still appear the .env.

    console.log("Updated .env: ", parsedFile);
  });
};
export default { check, validate, start };
