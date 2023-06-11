import { ObjectId, Schema, model } from "mongoose";

interface IPost {
  // metadata
  title: string;
  owner: Schema.Types.ObjectId;
  dateTime: Date;
  lastEditDateTime: Date;
  location: string;
  group: Schema.Types.ObjectId;
  // data
  content: string;
}

const postSchema = new Schema<IPost>({
  title: String,
  owner: Schema.Types.ObjectId,
  dateTime: Date,
  location: Schema.Types.ObjectId,
  lastEditDateTime: Date,
  content: String,
  group: Schema.Types.ObjectId,
});

const Post = model<IPost>("Post", postSchema, "posts");
export { Post, IPost };
