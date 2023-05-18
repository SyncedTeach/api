import express from "express";
var router = express.Router();
router.post(
    "/v1/login",
    async (req: express.Request, res: express.Response) => {
        console.log("log in request!");
        res.json({
            website: "meow",
        });
    }
);

export { router };
