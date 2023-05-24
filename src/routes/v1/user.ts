import express from "express";
import { checkOwnerOfToken } from "../../services/token";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { logWrite } from "../../utilities/log";
import configuration from "../../configuration.json";
import { checkRank, safeFindUserByID } from "../../services/authorize";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
  "/v1/user/:id",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      data: {},
    };
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
      res.json(result);
      return result;
    }
    // get data
    let data = await safeFindUserByID(req.params.id);
    if (!data) {
      logWrite.info(
        `Accessing data for ${cookies.username} denied: Target not found`
      );
      res.json(result);
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
      res.json(result);
      return result;
    }
    result.success = true;
    result.data = data;
    res.json(result);
    return result;
  }
);
export { router };
