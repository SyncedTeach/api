import express from "express";
import { checkOwnerOfToken } from "../../../services/token";
import { checkRank, safeFindUserByUsername } from "../../../services/authorize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { checkHTML, checkMongoDB } from "../../../utilities/sanitize";
import { addPost } from "../../../services/post";
import { logWrite } from "../../../utilities/log";
import configuration from "../../../configuration.json";
var jsonParser = bodyParser.json();
var router = express.Router();
import { sessionTokenChecker } from "../../../middlewares/authorization";
// TODO: add logging
router.post(
  "/v1/posts/new",
  [jsonParser, cookieParser(), sessionTokenChecker],
  async (req: express.Request, res: express.Response) => {
    let content = req.body["post-content"];
    let targetGroupID = req.body["target-group"];
    let result = {
      success: false,
    };
    // check if user has permissions
    let username = req.cookies.username;
    let rankResult = await checkRank(
      username,
      configuration.authorization.posting.regular
    );
    if (!rankResult.success) {
      logWrite.info(
        `Did not create post for ${req.cookies.username}: Low rank`
      );
      res.status(403).json(result);
      return result;
    }
    // sanitize/validate data
    if (!checkHTML(content) || !checkMongoDB(content)) {
      logWrite.info(
        `Did not create post for ${req.cookies.username}: Illegal post`
      );
      res.status(400).json(result);
      return result;
    }
    let userObject = await safeFindUserByUsername(username);
    // we already know username exists because we checked it
    let userID = userObject?._id || "";
    addPost(content, username, userID, targetGroupID);
    logWrite.info(`Successfully created new post for ${req.cookies.username}`);
    result.success = true;
    res.status(200).json(result);
    return result;
  }
);
export { router };
