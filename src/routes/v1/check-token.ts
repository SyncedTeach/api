import express from "express";
import { checkOwnerOfToken } from "../../services/token";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.get(
  "/v1/check-token",
  [jsonParser, cookieParser()],
  /**
   * This route allows checking a token to see whether it is valid.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.cookies.token The token of the user.
   * @returns An object with the key `success`.
   */
  async (req: express.Request, res: express.Response) => {
    let result = await checkOwnerOfToken(
      req.cookies.token,
      res.locals.username
    );
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.status(200).json(result);
  }
);
export { router };
