import express from "express";
import { checkHTML, checkMongoDB } from "../../utilities/sanitize";
import { register } from "../../services/authenticate";
import bodyParser from "body-parser";
import { logWrite } from "../../utilities/log";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
    "/v1/register",
    jsonParser,
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
            return res.status(400).json({
                error: "Bad request!",
            });
        }

        // actually process request
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                error: "Username must be between 3 and 20 characters!",
            });
        }

        if (password.length < 8 || password.length > 20) {
            return res.status(400).json({
                error: "Password must be between 8 and 20 characters!",
            });
        }

        if (email.length < 3 || email.length > 50) {
            return res.status(400).json({
                error: "Email must be between 3 and 50 characters!",
            });
        }

        logWrite.info("register request!");
        res.json(await register(username, password, email));
    }
);

export { router };
