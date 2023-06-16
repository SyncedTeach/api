import express from "express";
import { checkOwnerOfToken } from "../../../services/token";
import {
  checkRank,
  safeFindUserByID,
  safeFindUserByUsername,
} from "../../../services/authorize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { addGroup, addToGroup } from "../../../services/group";
import { logWrite } from "../../../utilities/log";
var jsonParser = bodyParser.json();
var router = express.Router();
import { authenticationChecker } from "../../../middlewares/authentication";
import { Group } from "../../../models/Group";
import { checkHTML, checkMongoDB } from "../../../utilities/sanitize";
import { addUsernames } from "../../../utilities/add-usernames";
import mongoose, { Types } from "mongoose";
import { Post } from "../../../models/Post";
interface GroupJoinResult {
  success: boolean;
  groupID?: string | undefined;
}
// TODO: add more conditions
router.get(
  "/v1/groups/:id",
  [jsonParser, cookieParser(), authenticationChecker],
  /**
   * This route allows fetching an ID to get the group information with that ID.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.params.id The ID of the group to get.
   * @returns An object with the key `success`.
   */
  async (req: express.Request, res: express.Response) => {
    async function getUsername(ids: Array<string>) {
      let elements = [];

      for (let id of ids) {
        let data = await safeFindUserByID(id);
        elements.push({
          username: data?.username,
          id: id,
        });
      }
      return elements;
    }

    let result: { [key: string]: any } = {
      success: false,
      posts: {
        announcements: 0,
        assignments: 0,
        exams: 0,
      },
    };
    let userObject = await safeFindUserByUsername(res.locals.username);
    // we already know username exists because we checked it
    let userID = userObject?._id || "";
    let id = req.params.id;
    // ...
    if (!/^[0-9a-f]{24}$/.test(id) || !checkHTML(id) || !checkMongoDB(id)) {
      res.status(400).json(result);
      return result;
    }
    // TODO: temporary workaround
    let group: { [key: string]: any } | null = await Group.findOne({
      _id: id,
    }).lean();
    if (!group) {
      logWrite.info(`Group ${group} not found.`);
      return result;
    }
    let groupMembers = group.members.map((element: string) =>
      element.toString()
    );
    if (groupMembers.indexOf(userID.toString()) === -1) {
      logWrite.info(`Action denied due to not being in group.`);
      return result;
    }
    result.success = true;
    // format usernames
    let groupPosts = (await Post.find({ group: id })).filter(
      (post) => post.group.toString() === req.params.id
    );
    result.posts.announcements += groupPosts.filter(
      (v) => v.type === "announcement"
    ).length;
    result.posts.assignments += groupPosts.filter(
      (v) => v.type === "assignment"
    ).length;
    result.posts.exams += groupPosts.filter((v) => v.type === "exam").length;
    let formattedMembers = await getUsername(group.members);
    let formattedOwners = await getUsername(group.owners);
    group.members = formattedMembers;
    group.owners = formattedOwners;
    result.group = group;

    // await addUsernames(result.data, "members", "memberUsernames");
    // await addUsernames(result.data, "owners", "ownerUsernames");

    res.status(200).json(result);
    return result;
  }
);

router.get(
  "/v1/groups/code/:joinCode",
  [jsonParser, cookieParser()],
  /**
   * This route allows fetching a join code to get the group information with that join code.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.params.joinCode The join code of the group to get.
   * @returns An object with the key `success`.
   */
  async (req: express.Request, res: express.Response) => {
    let result: { [key: string]: any } = {
      success: false,
    };

    let joinCode = req.params.joinCode;
    // ...
    if (!checkHTML(joinCode) || !checkMongoDB(joinCode)) {
      res.status(400).json(result);
      return result;
    }
    // TODO: temporary workaround
    let group = await Group.findOne({
      joinCode: req.params.joinCode,
    }).lean();


    if (!group) {
      logWrite.info(`Group ${group} not found.`);
      res.status(404).json(result);
      return result;
    }

    logWrite.info(`Group ${group} found.`);
    let groupMembers = group.members.length;
    result.success = true;
    result.group = {
      members: groupMembers,
      name: group.name,
    };
    res.status(200).json(result);
    return result;
  }
);

export { router };
