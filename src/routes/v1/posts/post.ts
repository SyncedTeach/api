import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { checkHTML, checkMongoDB } from "../../../utilities/sanitize";
import { addPost, findPost } from "../../../services/post";
var jsonParser = bodyParser.json();
var router = express.Router();
// TODO: add logging
// TODO: add reasons why post failed
router.get(
  "/v1/posts/post/:id",
  [jsonParser, cookieParser()],
  async (req: express.Request, res: express.Response) => {
    let result = {
      success: false,
      content: "",
      owner: "",
    };
    let id = req.params.id;
    if (!/^[0-9a-f]{24}$/.test(id) || !checkHTML(id) || !checkMongoDB(id)) {
      res.json(result);
      return;
    }
    let post = await findPost(req.params.id);
    if (!post) {
      res.json(result);
      return;
    }
    result.content = post.content;
    result.owner = post.owner;
    res.json(result);
  }
);
export { router };
