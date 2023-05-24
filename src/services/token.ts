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

export { createToken, checkOwnerOfToken };
