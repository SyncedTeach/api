import mongoose from "mongoose";
import { Group, IGroup } from "../models/Group";
// TODO: add title
async function addGroup(
  name: string,
  username: string,
  userID: string | mongoose.Types.ObjectId
) {
  if (typeof userID === "string") {
    userID = new mongoose.Types.ObjectId(userID);
  }
  let group = new Group({
    owners: [userID],
    members: [userID],
    name: name,
  });
  await group.save();
}

export { addGroup };
