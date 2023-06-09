import express from "express";
import { checkHTML, checkMongoDB } from "../../utilities/sanitize";
import { register } from "../../services/authenticate";
import bodyParser from "body-parser";
import { logWrite } from "../../utilities/log";
import configuration from "../../configuration.json";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
  "/v1/register",
  jsonParser,
  /**
   * This route allows registration of new users.
   * @function
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   * @param {string} req.body.username The target username for the new user.
   * @param {string} req.body.password The target password for the new user. (will be hashed)
   * @param {string} req.body.personal_email The target e-mail for the new user.
   */
  async (req: express.Request, res: express.Response) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.personal_email;

    // filter out bad requests
    if (
      !username ||
      !password ||
      !email ||
      !checkHTML(username) ||
      !checkMongoDB(username) ||
      !checkHTML(password) ||
      !checkMongoDB(password) ||
      !checkHTML(email) ||
      !checkMongoDB(email)
    ) {
      logWrite.info(`Unable to let ${username} log in: Bad Request`);
      return res.status(400).json({
        error: "Bad request!",
      });
    }

    // actually process request
    if (username.length < 3 || username.length > 20) {
      logWrite.info(`Unable to let ${username} register: Invalid username`);
      return res.status(400).json({
        error: "Username must be between 3 and 20 characters!",
      });
    }

    if (password.length < 8 || password.length > 20) {
      logWrite.info(`Unable to let ${username} register: Invalid password`);
      return res.status(400).json({
        error: "Password must be between 8 and 20 characters!",
      });
    }

    if (email.length < 3 || email.length > 50) {
      logWrite.info(`Unable to let ${username} register: Invalid e-mail`);
      return res.status(400).json({
        error: "Email must be between 3 and 50 characters!",
      });
    }

    if (!email.match(configuration.authorization.emailRegEx)) {
      logWrite.info(`Unable to let ${username} register: Bad e-mail`);
      return res.status(400).json({
        error: "Email not authorized!",
      });
    }

    res.cookie("username", username, { httpOnly: true, sameSite: "strict" });

    logWrite.info("register request!");
    res.json(await register(username, password, email));
  }
);

export { router };
