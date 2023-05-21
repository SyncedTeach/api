import express from "express";
import { checkOwnerOfToken } from "../../services/token";
import bodyParser from "body-parser";
var jsonParser = bodyParser.json();
var router = express.Router();
router.post(
    "/v1/checkToken",
    jsonParser,
    async (req: express.Request, res: express.Response) => {
        let result = await checkOwnerOfToken(req.body.token, req.body.username);
        res.status(200).json(result);
    }
);
export { router };
