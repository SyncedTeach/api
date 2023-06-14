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
import { authenticationChecker } from "../../../middlewares/authentication";

// TODO: add logging
router.post(
  "/v1/posts/new",
  [jsonParser, cookieParser(), authenticationChecker],
  async (req: express.Request, res: express.Response) => {
    let content = req.body["content"];
    let targetGroupID = req.body["targetgroup"];
    let result = {
      success: false,
    };
    if (!/^[0-9a-f]{24}$/.test(targetGroupID) || !checkMongoDB(targetGroupID)) {
      logWrite.info(
        `Did not create post for ${res.locals.username}: Invalid group id`
      );
      res.status(400).json(result);
      return;
    }
    let type = req.body["type"];
    let data = req.body["data"];

    if (!(type == "announcement" || type == "assignment" || type == "exam")) {
      logWrite.info(
        `Did not create post for ${res.locals.username}: Invalid type`
      );
      return res.status(400).json(result);
    }

    if (type == "announcement") {
      let title = data["title"];
      let description = data["description"];
      if (!title || !description) {
        logWrite.info(
          `Did not create post for ${res.locals.username}: Invalid data for announcement`
        );
        return res.status(400).json(result);
      }
    }

    if (type == "assignment") {
      let dueDate = data["dueDate"];
      let maxScore = data["maxScore"];
      let score = "?";
      let title = data["title"];
      let description = data["description"];
      if (!dueDate || !maxScore || !title || !description) {
        logWrite.info(
          `Did not create post for ${res.locals.username}: Invalid data`
        );
        return res.status(400).json(result);
      }
    }

    if (type == "exam") {
      let dueDate = data["dueDate"];
      let maxScore = data["maxScore"];
      let score = "?";
      let title = data["title"];
      let description = data["description"];
      if (!dueDate || !maxScore || !title || !description) {
        logWrite.info(
          `Did not create post for ${res.locals.username}: Invalid data`
        );
        return res.status(400).json(result);
      }
    }

    // check if user has permissions
    let username = res.locals.username;
    let rankResult = await checkRank(
      username,
      configuration.authorization.posting.regular
    );
    if (!rankResult.success) {
      logWrite.info(`Did not create post for ${res.locals.username}: Low rank`);
      res.status(403).json(result);
      return result;
    }
    // sanitize/validate data
    if (!checkHTML(content) || !checkMongoDB(content)) {
      logWrite.info(
        `Did not create post for ${res.locals.username}: Illegal post`
      );
      res.status(400).json(result);
      return result;
    }
    let userObject = await safeFindUserByUsername(username);
    // we already know username exists because we checked it
    let userID = userObject?._id || "";
    // addPost(content, username, userID, targetGroupID);
    addPost(content, username, userID, targetGroupID, type, data);
    logWrite.info(`Successfully created new post for ${res.locals.username}`);
    result.success = true;
    res.status(200).json(result);
    return result;
  }
);
export { router };
