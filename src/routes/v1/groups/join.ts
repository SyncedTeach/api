import express from "express";
import { checkOwnerOfToken } from "../../../services/token";
import { checkRank, safeFindUserByUsername } from "../../../services/authorize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { addGroup, addToGroup } from "../../../services/group";
import { logWrite } from "../../../utilities/log";
var jsonParser = bodyParser.json();
var router = express.Router();
interface GroupJoinResult {
  success: boolean;
  groupID?: string | undefined;
}
// TODO: add more conditions
router.post(
  "/v1/groups/join/:joinCode",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let result: GroupJoinResult = {
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
        `Did not join group for ${cookies.username}: Invalid cookies`
      );
      // incorrect cookies
      res.status(401).json(result);
      return result;
    }
    let userObject = await safeFindUserByUsername(cookies.username);
    // we already know username exists because we checked it
    let userID = userObject?._id || "";
    // this one adds to group
    // TODO: add checking consistency (???)
    let joinResult = addToGroup(req.params.joinCode, userID);
    // TODO: this
    if (!joinResult) {
      res.status(403).json(result);
      return result;
    }
    result.success = true;
    result.groupID = (await joinResult).groupID;
    res.status(200).json(result);
    return result;
  }
);
export { router };
