import express from "express";
import { authenticate } from "../../services/authenticate";
import bodyParser from "body-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
    "/v1/login",
    jsonParser,
    async (req: express.Request, res: express.Response) => {
        console.log("log in request!");
        res.json({
            username: req.body.username,
            success: await authenticate(req.body.username, req.body.password),
        });
    }
);

export { router };
