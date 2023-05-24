import mongoose from "mongoose";
import { Group, IGroup } from "../models/Group";
import { randomBytes } from "crypto";
// TODO: add title
async function addGroup(
  name: string,
  username: string,
  userID: string | mongoose.Types.ObjectId
) {
  if (typeof userID === "string") {
    userID = new mongoose.Types.ObjectId(userID);
  }
  let bytes = await randomBytes(16);
  let group = new Group({
    owners: [userID],
    members: [userID],
    name: name,
    // TODO: consider the use of randomBytes on whether its necessary.
    joinCode: bytes.toString("hex"),
    private: false,
  });
  await group.save();
}

async function addToGroup(
  joinCode: string,
  userID: string | mongoose.Types.ObjectId
) {
  if (typeof userID === "string") {
    userID = new mongoose.Types.ObjectId(userID);
  }
  await Group.findOneAndUpdate(
    { joinCode: joinCode },
    { $addToSet: { members: userID } }
  );
}

export { addGroup, addToGroup };
