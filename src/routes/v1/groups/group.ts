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
interface GroupJoinResult {
  success: boolean;
  groupID?: string | undefined;
}
// TODO: add more conditions
router.get(
  "/v1/groups/:id",
  [jsonParser, cookieParser(), authenticationChecker],
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
    };
    let userObject = await safeFindUserByUsername(req.cookies.username);
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
export { router };
