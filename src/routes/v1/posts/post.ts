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
var jsonParser = bodyParser.json();
var router = express.Router();
// TODO: add logging
// TODO: add reasons why post failed
router.get(
  "/v1/posts/post/:id",
  [jsonParser, cookieParser(), authenticationChecker],
  /**
   * This route allows fetching an ID to get a post with that ID.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.params.id The ID of the post to get.
   * @returns An object with the keys `success` and `data`. `data` will contain said post if `success` is true.
   */
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
  /**
   * This route allows fetching an ID to get all post in the group with that ID.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.params.id The ID of the group to get posts from.
   * @returns An object with the keys `success` and `data`. `data` will contain posts from the group if `success` is true.
   */
  async (req: express.Request, res: express.Response) => {
    let result: { [key: string]: any } = {
      success: false,
      size: {
        announcements: 0,
        assignments: 0,
        exams: 0,
      },
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
    result.size.announcements += groupPosts.filter(
      (v) => v.type === "announcement"
    ).length;
    result.size.assignments += groupPosts.filter(
      (v) => v.type === "assignment"
    ).length;
    result.size.exams += groupPosts.filter((v) => v.type === "exam").length;
    let formattedGroupPosts = await Promise.all(groupPosts.map(formatPost));

    result.success = true;
    result.posts = formattedGroupPosts;
    res.status(200).json(result);
  }
);

router.get(
  "/v1/posts/self",
  /**
   * This route allows to get all posts an user can see.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @returns An object with the keys `success` and `posts`. `posts` will contain all posts the user can see if `success` is true.
   */
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
      let groupName = queryOwnerGroups.find((v) => v._id === groupID);
      let groupPosts = await Post.find({ group: groupID });

      let resolvedGroupPosts = await Promise.all(groupPosts.map(formatPost));
      let formattedGroupPosts = resolvedGroupPosts.map((v) => ({
        ...v.toObject(),
        groupName: groupName?.name || "",
      }));
      result.posts = result.posts.concat(formattedGroupPosts);
    }

    result.success = true;
    res.status(200).json(result);
  }
);

/**
 * This function adds extra data to the post
 * @param post The post to add extra to
 * @returns The post with extra data added.
 */
async function formatPost(post: any) {
  let owner = await safeFindUserByID(post.owner.toString());
  let ownerUsername = owner?.username || "";
  // TODO: Funny hack lol
  let formattedPost = post;
  formattedPost.ownerUsername = ownerUsername;
  return formattedPost;
}
export { router };
