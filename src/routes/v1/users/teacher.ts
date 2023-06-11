import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { logWrite } from "../../../utilities/log";
import configuration from "../../../configuration.json";
import { checkRank, safeFindUserByID } from "../../../services/authorize";
import { User } from "../../../models/User";
import { sessionTokenChecker } from "../../../middlewares/authorization";
var jsonParser = bodyParser.json();
var router = express.Router();
router.get(
  "/v1/user/:id/teacher",
  [jsonParser, cookieParser(), sessionTokenChecker, sessionTokenChecker],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      data: {},
    };
    let id = req.params.id;
    // check if self is given
    if (req.params.id === "self") {
      const user = await User.findOne({ username: req.cookies.username });
      id = user ? user._id.toString() : "";
    }
    // get data
    let data = await safeFindUserByID(id);
    if (!data) {
      logWrite.info(
        `Accessing data for ${req.cookies.username} denied: Target not found`
      );
      res.status(404).json(result);
      return result;
    }
    // check rank to see it's really a teacher
    if (!data.membership.isTeacher) {
      logWrite.info(
        `Accessing data for ${req.cookies.username} denied: Wrong role`
      );
      res.status(404).json(result);
      return result;
    }
    // check for permission
    let usernameResult = data.username === req.cookies.username;
    let rankResult = await checkRank(
      req.cookies.username || "",
      configuration.authorization.dataAccess.full
    );
    if (!(usernameResult || rankResult.success)) {
      logWrite.info(
        `Accessing data for ${req.cookies.username} denied: Low rank`
      );
      res.status(403).json(result);
      return result;
    }
    // get data according to context
    let fullUser = await User.findById(id);
    let teacherData = (await fullUser?.getTeacherData()) || {};
    result.success = true;
    result.data = teacherData;
    res.status(200).json(result);
    return result;
  }
);
export { router };
