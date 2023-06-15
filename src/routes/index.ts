import express from "express";
var router = express.Router();

router.get(
  "/",
  /**
   * This route is the index route.
   * Nothing actually happens here.
   * @param {express.Request} req The request object.
   * @param {express.Response} res The response object.
   */
  async (req: express.Request, res: express.Response) => {
    res.status(200).json({
      success: true,
    });
  }
);

export { router };
