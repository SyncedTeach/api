import express from "express";
import { checkOwnerOfToken, createToken } from "../../../services/token";
import { checkRank, safeFindUserByUsername } from "../../../services/authorize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { logWrite } from "../../../utilities/log";
import configuration from "../../../configuration.json";
import { User } from "../../../models/User";
var jsonParser = bodyParser.json();
var router = express.Router();
import { sessionTokenChecker } from "../../../middlewares/authorization";
// TODO: add logging
interface KeyCreationResult {
  success: boolean;
  newKey?: string;
}
router.post(
  "/v1/keys/new",
  [jsonParser, cookieParser(), sessionTokenChecker],
  async (req: express.Request, res: express.Response) => {
    let result: KeyCreationResult = {
      success: false,
    };
    // check if user has permissions
    let username = req.cookies.username;
    let rankResult = await checkRank(
      username,
      configuration.authorization.keys.create
    );
    if (!rankResult.success) {
      logWrite.info(
        `Did not create API key for ${req.cookies.username}: Low rank`
      );
      res.status(403).json(result);
      return result;
    }
    const key = await createToken(32);
    const hashedKey = await bcrypt.hash(key, 10);
    const user = await User.findOne({ username: username });
    if (user) {
      user.saveAPIKey(hashedKey);
      result.newKey = key;
    }
    logWrite.info(
      `Successfully created new API Key for ${req.cookies.username}`
    );
    result.success = true;
    res.status(200).json(result);
    return result;
  }
);
export { router };