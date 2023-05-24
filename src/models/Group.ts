import { Schema, model } from "mongoose";

interface IGroup {
  name: string;
  members: Array<Schema.Types.ObjectId>[];
  owners: Array<Schema.Types.ObjectId>[];
  joinCode: string;
  private: boolean;
}

const groupSchema = new Schema<IGroup>({
  name: String,
  members: Array<Schema.Types.ObjectId>,
  owners: Array<Schema.Types.ObjectId>,
  joinCode: String,
  private: Boolean,
});

const Group = model<IGroup>("Group", groupSchema, "groups");
export { Group, IGroup };
