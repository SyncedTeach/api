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
router.get("/", async (req: express.Request, res: express.Response) => {
  res.status(200).json({
    version: "v1",
    website: "test",
    success: true,
  });
});

export { router };
