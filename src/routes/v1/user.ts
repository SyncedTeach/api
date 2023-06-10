import express from "express";
import { checkOwnerOfToken } from "../../services/token";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { logWrite } from "../../utilities/log";
import configuration from "../../configuration.json";
import { checkRank, safeFindUserByID } from "../../services/authorize";
var jsonParser = bodyParser.json();
var router = express.Router();
router.get(
  "/v1/user/:id",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      data: {},
    };
    let id = req.params.id;
    // check if user is real
    let cookies = req.cookies;
    let cookieResult = await checkOwnerOfToken(
      cookies.sessionToken || "",
      cookies.username || ""
    );
    if (!cookieResult.success) {
      logWrite.info(
        `Accessing data for ${cookies.username} denied: Invalid cookies`
      );
      res.status(401).json(result);
      return result;
    }
    // check if self is given
    if (req.params.id === "self") {
      id = cookieResult.userID as string;
    }
    // get data
    let data = await safeFindUserByID(id);
    if (!data) {
      logWrite.info(
        `Accessing data for ${cookies.username} denied: Target not found`
      );
      res.status(404).json(result);
      return result;
    }
    // check for permission
    let usernameResult = data.username === cookies.username;
    let rankResult = await checkRank(
      cookies.username || "",
      configuration.authorization.dataAccess.full
    );
    if (!(usernameResult || rankResult.success)) {
      logWrite.info(`Accessing data for ${cookies.username} denied: Low rank`);
      res.status(403).json(result);
      return result;
    }
    result.success = true;
    result.data = data;
    res.status(200).json(result);
    return result;
  }
);
export { router };
