import express from "express";
import { register } from "../../services/authenticate";
import bodyParser from "body-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
    "/v1/register",
    jsonParser,
    async (req: express.Request, res: express.Response) => {
        // filter out bad requests
        if (!req.body.username || !req.body.password || !req.body.personal_email) {
            return res.status(400).json({
                error: "Bad request!",
            });
        }

        if(req.body.username.length < 3 || req.body.username.length > 20) {
            return res.status(400).json({
                error: "Username must be between 3 and 20 characters!",
            });
        }

        if(req.body.password.length < 8 || req.body.password.length > 20) {
            return res.status(400).json({
                error: "Password must be between 8 and 20 characters!",
            });
        }

        if(req.body.personal_email.length < 3 || req.body.personal_email.length > 50) {
            return res.status(400).json({
                error: "Email must be between 3 and 50 characters!",
            });
        }

        console.log("register request!");
        res.json(await register(req.body.username, req.body.password, req.body.personal_email));
    }
);

export { router };
