import { Post, IPost } from "../models/Post";
// TODO: add title
async function addPost(content: string, username: string) {
  let dateTime = Date.now();
  let post = new Post({
    owner: username,
    content: content,
    dateTime: dateTime,
    lastEditDateTime: dateTime,
  });
  await post.save();
}

async function findPost(id: string) {
  // id is already validated, but it might be a good idea to validate it once more:
  let post = await Post.findOne({ _id: id });
  return post;
}

export { addPost, findPost };
