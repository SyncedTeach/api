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
// TODO: add logging
router.post(
  "/v1/posts/new",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let content = req.body["post-content"];
    let result = {
      success: false,
    };
    // check if user is real
    let cookies = req.cookies;
    let cookieResult = await checkOwnerOfToken(
      cookies.sessionToken || "",
      cookies.username || ""
    );
    if (!cookieResult.success) {
      logWrite.info(
        `Did not create post for ${cookies.username}: Invalid cookies`
      );
      res.json(result);
      return result;
    }
    // check if user has permissions
    let username = cookies.username;
    let rankResult = await checkRank(
      username,
      configuration.authorization.posting.regular
    );
    if (!rankResult.success) {
      logWrite.info(`Did not create post for ${cookies.username}: Low rank`);
      res.json(result);
      return result;
    }
    // sanitize/validate data
    if (!checkHTML(content) || !checkMongoDB(content)) {
      logWrite.info(
        `Did not create post for ${cookies.username}: Illegal post`
      );
      res.json(result);
      return result;
    }
    let userObject = await safeFindUserByUsername(username);
    // we already know username exists because we checked it
    let userID = userObject?._id || "";
    addPost(content, username, userID);
    logWrite.info(`Successfully created new post for ${cookies.username}`);
    result.success = true;
    res.json(result);
    return result;
  }
);
export { router };