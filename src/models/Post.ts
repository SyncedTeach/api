import { ObjectId, Schema, model } from "mongoose";

interface IPost {
  // metadata
  title: string;
  owner: Schema.Types.ObjectId;
  dateTime: Date;
  lastEditDateTime: Date;
  location: string;
  // type of post (announcement, assignment, exam, etc.)
  group: Schema.Types.ObjectId;
  // data
  content: string;
  data: any;
  type: string;
  dueDate: Date;
  maxScore: number;
  score: number;
  description: string;
}

const postSchema = new Schema<IPost>({
  title: String,
  owner: Schema.Types.ObjectId,
  dateTime: Date,
  location: Schema.Types.ObjectId,
  lastEditDateTime: Date,
  type: String,
  content: String,
  group: Schema.Types.ObjectId,
  data: Object,
  dueDate: Date,
  maxScore: Number,
  score: Number,
  description: String,
});

const Post = model<IPost>("Post", postSchema, "posts");

export { Post, IPost };
