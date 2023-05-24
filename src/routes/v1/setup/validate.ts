import express from "express";
import setup from "../../../utilities/setup";
var router = express.Router();
import bodyParser from "body-parser";
var jsonParser = bodyParser.json();

router.post(
  "/v1/setup/validate",
  jsonParser,
  async (req: express.Request, res: express.Response) => {
    const key = req.body.secretKey;
    if (!key) {
      return res.status(400).json({
        error: "Bad request!",
      });
    }
    const result = await setup.validate(key);

    res.status(200).json({
      result,
    });
  }
);

export { router };
