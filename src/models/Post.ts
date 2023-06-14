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
  scores: object;
  description: string;
  // TODO: funny hack lol
  ownerUsername?: string;
  groupName?: string;
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
  scores: Object,
  description: String,
  // TODO: funny hack lol
  ownerUsername: String,
});

const Post = model<IPost>("Post", postSchema, "posts");

export { Post, IPost };
