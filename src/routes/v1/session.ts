import express from "express";
import { checkOwnerOfToken, getSessionInfo } from "../../services/token";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { logWrite } from "../../utilities/log";
import configuration from "../../configuration.json";
import { checkRank, safeFindUserByID } from "../../services/authorize";
var jsonParser = bodyParser.json();
var router = express.Router();
import { authenticationChecker } from "../../middlewares/authentication";
router.get(
  "/v1/user",
  [jsonParser, cookieParser(), authenticationChecker],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      data: {},
    };
    // get data
    const sessionInfo = await getSessionInfo(
      req.cookies.sessionToken || "",
      res.locals.username || ""
    );
    if (!sessionInfo) {
      logWrite.info(
        `Accessing data for ${res.locals.username} denied: Invalid session token`
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
