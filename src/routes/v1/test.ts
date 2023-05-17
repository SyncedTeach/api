import express from "express";
var router = express.Router();
// module.exports = {
//     httpMethod: "get",
//     async run(
//         app: express.Application,
//         req: express.Request,
//         res: express.Response
//     ) {
//         res.json({
//             version: "v1",
//             website: "test",
//         });
//     },
// };
router.get("/v1/test", async (req: express.Request, res: express.Response) => {
    res.json({
        website: "meow",
    });
});

export { router };
