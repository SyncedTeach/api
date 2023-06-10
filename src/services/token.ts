import crypto from "crypto";
import { checkHTML, checkMongoDB } from "../utilities/sanitize";
import { User, IUser } from "../models/User";
import bcrypt from "bcrypt";
import { logWrite } from "../utilities/log";
async function createToken(size: number, encoding?: "hex" | "utf8") {
  let buffer = crypto.randomBytes(size);
  return buffer.toString(encoding || "hex");
}

async function checkOwnerOfToken(token: string, username: string) {
  let result = {
    username: username,
    success: false,
  };
  if (!checkHTML(username) || !checkMongoDB(username)) {
    logWrite.info(`Checked token for ${username}: Invalid username`);
    return result;
  }
  let owner = await User.findOne({ username: username });
  if (!owner) {
    logWrite.info(`Checked token for ${username}: Username not found.`);
    return result;
  }
  // TODO: Change from any to something else.
  let ownerObject = owner;
  let tokens = ownerObject.sessionTokens;
  for (let hashedToken of tokens) {
    if (await bcrypt.compare(token, hashedToken)) {
      result.success = true;
      break;
    }
  }
  let part = result.success ? "" : "n't";
  logWrite.info(`Checked token for ${username}: tokens are${part} valid.`);
  return result;
}

async function getSessionInfo(token: string, username: string) {
  let result = {
    success: false,
    data: {},
  };
  const data = await User.findOne({ username: username });
  // const dataCencored = select(
  //   "-_id -__v -password -sessionTokens"
  // );

  const dataCensored = await User.findOne(
    { username: username },
    { password: 0, sessionTokens: 0, _id: 0, __v: 0 }
  );

  if (!data || !dataCensored) {
    return result;
  }
  // let tokens = ownerObject.sessionTokens;
  // for (let hashedToken of tokens) {
  //   if (await bcrypt.compare(token, hashedToken)) {
  //     result.success = true;
  //     break;
  //   }
  // }

  let tokens = data.sessionTokens;
  for (let hashedToken of tokens) {
    if (await bcrypt.compare(token, hashedToken)) {
      result.success = true;
      result.data = dataCensored;
      break;
    }
  }
  return result;
}

export { createToken, checkOwnerOfToken, getSessionInfo };
