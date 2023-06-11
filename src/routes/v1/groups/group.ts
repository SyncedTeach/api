import express from "express";
import { checkOwnerOfToken } from "../../../services/token";
import { checkRank, safeFindUserByUsername } from "../../../services/authorize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { addGroup, addToGroup } from "../../../services/group";
import { logWrite } from "../../../utilities/log";
var jsonParser = bodyParser.json();
var router = express.Router();
import { sessionTokenChecker } from "../../../middlewares/authorization";
import { Group } from "../../../models/Group";
import { checkHTML, checkMongoDB } from "../../../utilities/sanitize";
interface GroupJoinResult {
  success: boolean;
  groupID?: string | undefined;
}
// TODO: add more conditions
router.get(
  "/v1/groups/:id",
  [jsonParser, cookieParser(), sessionTokenChecker],
  async (req: express.Request, res: express.Response) => {
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
    let group = await Group.findOne({ _id: id });
    if (!group) {
      logWrite.info(`Group ${group} not found.`);
      return result;
    }
    let groupMembers = group.members.map((element) => element.toString());
    if (groupMembers.indexOf(userID.toString()) === -1) {
      logWrite.info(`Action denied due to not being in group.`);
      return result;
    }
    result.success = true;
    result.data = group;
    res.status(200).json(result);
    return result;
  }
);
export { router };
