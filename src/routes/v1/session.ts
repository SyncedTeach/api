import express from "express";
import { checkOwnerOfToken, getSessionInfo } from "../../services/token";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { logWrite } from "../../utilities/log";
import configuration from "../../configuration.json";
import { checkRank, safeFindUserByID } from "../../services/authorize";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
  "/v1/user",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      data: {},
    };
    // check if user is real
    let cookies = req.cookies;
    logWrite.info(`Accessing data for ${cookies.username}`);
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
    // get data
    const sessionInfo = await getSessionInfo(
      cookies.sessionToken || "",
      cookies.username || ""
    );
    if (!sessionInfo) {
      logWrite.info(
        `Accessing data for ${cookies.username} denied: Invalid session token`
      );
      res.status(401).json(result);
      return result;
    }

    result.success = true;
    result = sessionInfo;
    res.status(200).json(result);
    return result;
  }
);
export { router };
