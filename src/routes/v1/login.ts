import express from "express";
import { login } from "../../services/authenticate";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
  "/v1/login",
  [jsonParser, cookieParser()],
  /**
   * This route allows logging in of users.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.body.username The username of the user attempting to log in.
   * @param {string} req.body.password The password of the user attempting to log in.
   * @returns An object with the key `success`. It will also send 2 cookies if `success` is `true`.
   */
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
