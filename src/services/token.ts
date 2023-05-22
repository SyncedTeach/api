import crypto from "crypto";
import { checkHTML, checkMongoDB } from "../utilities/sanitize";
import { User, IUser } from "../models/User";
import bcrypt from "bcrypt";
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
        return result;
    }
    let owner = User.findOne({ username: username });
    if (!owner) {
        return result;
    }
    // TODO: Change from any to something else.
    let ownerObject: any = owner.lean();
    let tokens = ownerObject.sessionTokens;
    for (let hashedToken in tokens) {
        if (await bcrypt.compare(token, hashedToken)) {
            result.success = true;
            return result;
        }
    }
    return result;
}

export { createToken, checkOwnerOfToken };
