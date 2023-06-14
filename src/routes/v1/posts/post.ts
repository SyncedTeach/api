import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { checkHTML, checkMongoDB } from "../../../utilities/sanitize";
import { addPost, findPost } from "../../../services/post";
import {
  safeFindUserByID,
  safeFindUserByUsername,
} from "../../../services/authorize";
import { authenticationChecker } from "../../../middlewares/authentication";
import { Group } from "../../../models/Group";
import { User } from "../../../models/User";
import { logWrite } from "../../../utilities/log";
import { IPost, Post } from "../../../models/Post";
import { getTypeParameterOwner } from "typescript";
var jsonParser = bodyParser.json();
var router = express.Router();
// TODO: add logging
// TODO: add reasons why post failed
router.get(
  "/v1/posts/post/:id",
  [jsonParser, cookieParser(), authenticationChecker],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      data: {} as any,
      type: "",
      owner: "",
      post: {} as any,
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
    let queryOwner = await safeFindUserByUsername(res.locals.username);
    // shouldn't happen
    if (!queryOwner) {
      logWrite.info(
        `Did not carry out action for ${res.locals.username}: User not found`
      );
      // incorrect cookies
      res.status(401).json(result);
      return result;
    }
    let queryOwnerID = queryOwner._id;
    // check if user is actually in group
    let queryOwnerGroups = await Group.find({ members: queryOwnerID });
    let queryOwnerGroupIDs = queryOwnerGroups.map((element) => element._id);
    let queryOwnerAllowed =
      queryOwnerGroupIDs.findIndex(
        (element) => element.toString() === post?.group.toString()
      ) > -1;
    if (!queryOwnerAllowed) {
      logWrite.info(
        `Did not show post to ${res.locals.username}: Not in group`
      );
      res.status(403).json(result);
      return result;
    }
    let owner = await safeFindUserByID(result.owner);
    let ownerUsername = owner?.username || "";
    result.success = true;
    result.post = await formatPost(post);
    res.status(200).json(result);
  }
);

router.get(
  "/v1/posts/group/:id",
  [jsonParser, cookieParser(), authenticationChecker],
  async (req: express.Request, res: express.Response) => {
    let result: { [key: string]: any } = {
      success: false,
    };
    let id = req.params.id;
    if (!/^[0-9a-f]{24}$/.test(id) || !checkHTML(id) || !checkMongoDB(id)) {
      res.status(400).json(result);
      return;
    }
    let queryOwner = await safeFindUserByUsername(res.locals.username);
    if (!queryOwner) {
      logWrite.info(
        `Did not carry out action for ${res.locals.username}: User not found`
      );
      // incorrect cookies
      res.status(401).json(result);
      return result;
    }
    let queryOwnerID = queryOwner._id;
    let queryOwnerGroups = await Group.find({ members: queryOwnerID });
    let queryOwnerGroupIDs = queryOwnerGroups.map((element) => element._id);
    let queryOwnerAllowed =
      queryOwnerGroupIDs.findIndex(
        (element) => element.toString() === req.params.id
      ) > -1;
    if (!queryOwnerAllowed) {
      logWrite.info(
        `Did not show posts to ${res.locals.username}: Not in group`
      );
      res.status(403).json(result);
      return result;
    }
    let groupPosts = (await Post.find({ group: id })).filter(
      (post) => post.group.toString() === req.params.id
    );
    let formattedGroupPosts = await Promise.all(groupPosts.map(formatPost));
    result.success = true;
    result.posts = formattedGroupPosts;
    res.status(200).json(result);
  }
);

router.get(
  "/v1/posts/self",
  [jsonParser, cookieParser(), authenticationChecker],
  async (req: express.Request, res: express.Response) => {
    let result: { [key: string]: any } = {
      success: false,
      posts: [],
    };
    let id = req.params.id;
    let queryOwner = await safeFindUserByUsername(res.locals.username);
    if (!queryOwner) {
      logWrite.info(
        `Did not carry out action for ${res.locals.username}: User not found`
      );
      // incorrect cookies
      res.status(401).json(result);
      return result;
    }
    let queryOwnerID = queryOwner._id;
    let queryOwnerGroups = await Group.find({ members: queryOwnerID });
    let queryOwnerGroupIDs = queryOwnerGroups.map((element) => element._id);

    for (let groupID of queryOwnerGroupIDs) {
      let groupPosts = await Post.find({ group: groupID });
      let formattedGroupPosts = await Promise.all(groupPosts.map(formatPost));
      result.posts = result.posts.concat(formattedGroupPosts);
    }

    result.success = true;
    res.status(200).json(result);
  }
);

async function formatPost(post: IPost) {
  let owner = await safeFindUserByID(post.owner.toString());
  let ownerUsername = owner?.username || "";
  // TODO: Funny hack lol
  let formattedPost = post as IPost;
  formattedPost.ownerUsername = ownerUsername;

  return formattedPost;
}
export { router };
