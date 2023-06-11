import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { checkHTML, checkMongoDB } from "../../../utilities/sanitize";
import { addPost, findPost } from "../../../services/post";
import {
  safeFindUserByID,
  safeFindUserByUsername,
} from "../../../services/authorize";
import { sessionTokenChecker } from "../../../middlewares/authorization";
import { Group } from "../../../models/Group";
import { User } from "../../../models/User";
import { logWrite } from "../../../utilities/log";
import { IPost, Post } from "../../../models/Post";
var jsonParser = bodyParser.json();
var router = express.Router();
// TODO: add logging
// TODO: add reasons why post failed
router.get(
  "/v1/posts/post/:id",
  [jsonParser, cookieParser(), sessionTokenChecker],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      content: "",
      owner: "",
    };
    let id = req.params.id;
    if (!/^[0-9a-f]{24}$/.test(id) || !checkHTML(id) || !checkMongoDB(id)) {
      res.status(400).json(result);
      return;
    }
    let post = await findPost(id);
    if (!post) {
      res.status(404).json(result);
      return;
    }
    // get user id
    let queryOwner = await safeFindUserByUsername(req.cookies.username);
    // shouldn't happen
    if (!queryOwner) {
      logWrite.info(
        `Did not carry out action for ${req.cookies.username}: User not found`
      );
      // incorrect cookies
      res.status(401).json(result);
      return result;
    }
    let queryOwnerID = queryOwner._id;
    // check if user is actually in group
    let queryOwnerGroups = await Group.find({ members: queryOwnerID });
    let queryOwnerGroupIDs = queryOwnerGroups.map((element) => element._id);
    let queryOwnerAllowed = queryOwnerGroupIDs.findIndex(
      (element) => element.toString() === (post as IPost).group.toString()
    );
    if (!queryOwnerAllowed) {
      logWrite.info(
        `Did not show post to ${req.cookies.username}: Not in group`
      );
      res.status(403).json(result);
      return result;
    }
    let owner = await safeFindUserByID(result.owner);
    let ownerUsername = owner?.username || "";
    result.success = true;
    result.content = post.content;
    result.owner = ownerUsername;
    res.status(200).json(result);
  }
);

router.get(
  "/v1/posts/group/:id",
  [jsonParser, cookieParser(), sessionTokenChecker],
  async (req: express.Request, res: express.Response) => {
    let result: { [key: string]: any } = {
      success: false,
    };
    let id = req.params.id;
    if (!/^[0-9a-f]{24}$/.test(id) || !checkHTML(id) || !checkMongoDB(id)) {
      res.status(400).json(result);
      return;
    }
    let queryOwner = await safeFindUserByUsername(req.cookies.username);
    if (!queryOwner) {
      logWrite.info(
        `Did not carry out action for ${req.cookies.username}: User not found`
      );
      // incorrect cookies
      res.status(401).json(result);
      return result;
    }
    let queryOwnerID = queryOwner._id;
    let queryOwnerGroups = await Group.find({ members: queryOwnerID });
    let queryOwnerGroupIDs = queryOwnerGroups.map((element) => element._id);
    let queryOwnerAllowed = queryOwnerGroupIDs.findIndex(
      (element) => element.toString() === req.params.id
    );
    if (!queryOwnerAllowed) {
      logWrite.info(
        `Did not show posts to ${req.cookies.username}: Not in group`
      );
      res.status(403).json(result);
      return result;
    }
    let groupPosts = (await Post.find({ group: id })).filter(
      (post) => post.group.toString() === req.params.id
    );
    result.success = true;
    result.posts = groupPosts;
    res.status(200).json(result);
  }
);
export { router };
