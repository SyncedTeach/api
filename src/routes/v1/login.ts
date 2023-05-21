import express from "express";
import { login } from "../../services/authenticate";
import bodyParser from "body-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
    "/v1/login",
    jsonParser,
    async (req: express.Request, res: express.Response) => {
        let result = await login(req.body.username, req.body.password);
        res.status(200).json(result);
    }
);

export { router };
