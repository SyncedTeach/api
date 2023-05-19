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

        console.log("register request!");
        res.json(await register(req.body.username, req.body.password, req.body.personal_email));
    }
);

export { router };
