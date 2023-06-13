import express from "express";
import { login } from "../../services/authenticate";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
  "/v1/login",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let result = await login(req.body.username, req.body.password);
    if (result.success) {
      // positive result: send cookie
      res.cookie("username", req.body.username, {
        httpOnly: true,
        sameSite: "strict",
      });
      res.cookie("sessionToken", result.token, {
        httpOnly: true,
        sameSite: "strict",
      });
      return res.status(200).send(result);
    }
    // negative result: send error
    return res.status(401).send(result);
  }
);

export { router };
