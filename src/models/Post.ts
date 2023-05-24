import { ObjectId, Schema, model } from "mongoose";

interface IPost {
  // metadata
  title: string;
  owner: string;
  dateTime: Date;
  lastEditDateTime: Date;
  location: string;
  // data
  content: string;
}

const postSchema = new Schema<IPost>({
  title: String,
  owner: String,
  dateTime: Date,
  location: Schema.Types.ObjectId,
  lastEditDateTime: Date,
  content: String,
});

const Post = model<IPost>("Post", postSchema, "posts");
export { Post, IPost };
