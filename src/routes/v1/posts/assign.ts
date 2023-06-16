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
import { Post } from "../../../models/Post";

// TODO: add logging
router.post(
  "/v1/posts/assign/:postID/:studentID",
  [jsonParser, cookieParser(), authenticationChecker],
  /**
   * This route allows fetching an ID to get a post with that ID.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.params.postID The ID of the post to assign to.
   * @param {string} req.params.studentID The ID of the student to assign to.
   * @param {number} req.body.assignment What to assign to the student.
   * @returns An object with the key `success`.
   */
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
    };
    let postID = req.params.postID;
    let assigneeID = req.params.studentID;
    // FIXME: VALIDATE DATA!!!!!
    let assignment = req.body.assignment;
    if (
      !/^[0-9a-f]{24}$/.test(postID) ||
      !checkHTML(postID) ||
      !checkMongoDB(postID)
    ) {
      res.status(400).json(result);
      return;
    }
    if (
      !/^[0-9a-f]{24}$/.test(assigneeID) ||
      !checkHTML(assigneeID) ||
      !checkMongoDB(assigneeID)
    ) {
      res.status(400).json(result);
      return;
    }
    let post = await Post.findOne({ _id: postID });
    // check post type
    if (!post) {
      res.status(404).json(result);
      return;
    }
    if (post.type !== "assignment" && post.type !== "exam") {
      console.log(
        `Did not assign to post for ${res.locals.username}: Invalid type`
      );
      res.status(403).json(result);
      return;
    }
    // actually update post
    let update: { [key: string]: any } = {};
    update[assigneeID] = assignment;
    await Post.findOneAndUpdate({ _id: postID }, { $set: { scores: update } });
    logWrite.info(`Successfully modified new post for ${res.locals.username}`);
    result.success = true;
    res.status(200).json(result);
    return result;
  }
);
export { router };
