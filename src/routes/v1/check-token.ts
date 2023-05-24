import express from "express";
import { checkOwnerOfToken } from "../../services/token";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
  "/v1/check-token",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let result = await checkOwnerOfToken(
      req.cookies.token,
      req.cookies.username
    );
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.status(200).json(result);
  }
);
export { router };
