import express from "express";
import { checkOwnerOfToken } from "../../../services/token";
import { checkRank, safeFindUserByUsername } from "../../../services/authorize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { checkHTML, checkMongoDB } from "../../../utilities/sanitize";
import { addGroup } from "../../../services/group";
import { logWrite } from "../../../utilities/log";
import configuration from "../../../configuration.json";
import { authenticationChecker } from "../../../middlewares/authentication";
var jsonParser = bodyParser.json();
var router = express.Router();
// TODO: add logging
router.post(
  "/v1/groups/new",
  /**
   * This route allows an authorized user to create a new group.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.body.name The name of the new group.
   * @returns An object with the key `success`.
   */
  [jsonParser, cookieParser(), authenticationChecker],
  async (req: express.Request, res: express.Response) => {
    let name = req.body["name"];
    let result = {
      success: false,
      id: "",
    };
    // check if user has permissions
    let username = res.locals.username;
    let rankResult = await checkRank(
      username,
      configuration.authorization.groups.create
    );
    if (!rankResult.success) {
      logWrite.info(
        `Did not create group for ${res.locals.username}: Low rank`
      );
      res.status(403).json(result);
      return result;
    }
    // sanitize/validate data
    if (!checkHTML(name) || !checkMongoDB(name)) {
      logWrite.info(
        `Did not create group for ${res.locals.username}: Illegal group name "${name}"`
      );
      res.status(400).json(result);
      return result;
    }
    let userObject = await safeFindUserByUsername(username);
    // we already know username exists because we checked it
    let userID = userObject?._id || "";
    let newGroup = await addGroup(name, username, userID);
    logWrite.info(`Successfully created new group for ${res.locals.username}`);
    result.success = true;
    result.id = newGroup;
    res.status(200).json(result);
    return result;
  }
);
export { router };
