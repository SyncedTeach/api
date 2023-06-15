import express from "express";
import { checkOwnerOfToken } from "../../../services/token";
import { checkRank, safeFindUserByUsername } from "../../../services/authorize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { addGroup, addToGroup } from "../../../services/group";
import { logWrite } from "../../../utilities/log";
var jsonParser = bodyParser.json();
var router = express.Router();
import { authenticationChecker } from "../../../middlewares/authentication";
interface GroupJoinResult {
  success: boolean;
  groupID?: string | undefined;
}
// TODO: add more conditions
router.post(
  "/v1/groups/join/:joinCode",
  [jsonParser, cookieParser(), authenticationChecker],
  /**
   * This route allows a user to join a group.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {object} req.cookies The cookies of the user.
   * @returns An object with the key `success`.
   */
  async (req: express.Request, res: express.Response) => {
    let result: GroupJoinResult = {
      success: false,
    };

    let cookies = req.cookies;

    let userObject = await safeFindUserByUsername(res.locals.username);
    // we already know username exists because we checked it
    let userID = userObject?._id || "";
    // this one adds to group
    // TODO: add checking consistency (???)
    let joinResult = await addToGroup(req.params.joinCode, userID);
    // TODO: this
    if (!joinResult.success) {
      res.status(403).json(result);
      return result;
    }
    result.success = true;
    result.groupID = joinResult.groupID;
    res.status(200).json(result);
    return result;
  }
);
export { router };
