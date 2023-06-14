import express from "express";
import { checkOwnerOfToken } from "../../services/token";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { logWrite } from "../../utilities/log";
import configuration from "../../configuration.json";
import { checkRank, safeFindUserByID } from "../../services/authorize";
var jsonParser = bodyParser.json();
var router = express.Router();
import { authenticationChecker } from "../../middlewares/authentication";
import { User } from "../../models/User";
router.get(
  "/v1/user/:id",
  [jsonParser, cookieParser(), authenticationChecker],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      data: {},
    };
    let id = req.params.id;
    // check if self is given
    if (req.params.id === "self") {
      const user = await User.findOne({ username: res.locals.username });
      id = user ? user._id.toString() : "";
    }
    // get data
    let data = await safeFindUserByID(id);
    if (!data) {
      logWrite.info(
        `Accessing data for ${res.locals.username} denied: Target not found`
      );
      res.status(404).json(result);
      return result;
    }
    // check for permission
    let usernameResult = data.username === res.locals.username;
    let rankResult = await checkRank(
      res.locals.username || "",
      configuration.authorization.dataAccess.full
    );
    if (!(usernameResult || rankResult.success)) {
      logWrite.info(
        `Accessing data for ${res.locals.username} denied: Low rank`
      );
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
