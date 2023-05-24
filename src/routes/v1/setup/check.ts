import express from "express";
import setup from "../../../utilities/setup";
var router = express.Router();
router.get(
  "/v1/setup/check",
  async (req: express.Request, res: express.Response) => {
    const result = await setup.check();
    res.status(200).json({
      result,
    });
  }
);

export { router };
