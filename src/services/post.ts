import mongoose from "mongoose";
import { Post, IPost } from "../models/Post";
// TODO: add title
async function addPost(
  content: string,
  username: string,
  userID: string | mongoose.Types.ObjectId,
  targetGroupID: string | mongoose.Types.ObjectId
) {
  let dateTime = Date.now();
  if (typeof userID === "string") {
    userID = new mongoose.Types.ObjectId(userID);
  }
  let post = new Post({
    owner: userID,
    content: content,
    dateTime: dateTime,
    lastEditDateTime: dateTime,
    group: targetGroupID,
  });
  await post.save();
}

async function findPost(id: string) {
  // id is already validated, but it might be a good idea to validate it once more:
  let post = await Post.findOne({ _id: id });
  return post;
}

export { addPost, findPost };
