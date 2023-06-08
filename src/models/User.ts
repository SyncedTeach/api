import mongoose, { HydratedDocument, Schema, model } from "mongoose";
import { Group } from "./Group";

interface IUser {
  name: string;
  username: string;
  userID: string;
  password: string;
  personalEmail: string;
  professionalEmail: string;
  membership: {
    isSuperAdministrator: boolean;
    isAdministrator: boolean;
    isNormalUser: boolean;
    isTeacher: boolean;
    isStudent: boolean;
    isParent: boolean;
  };
  statistics: object;
  sessionTokensWithExpiryTime: [string];
  sessionTokens: [string];
  apiKey: string;
  getTeacherData(): object;
}

const userSchema = new Schema<IUser>({
  name: String,
  username: String,
  userID: String,
  password: String,
  personalEmail: String,
  professionalEmail: String,
  membership: {
    isSuperAdministrator: Boolean,
    isAdministrator: Boolean,
    isNormalUser: Boolean,
    isTeacher: Boolean,
    isStudent: Boolean,
    isParent: Boolean,
  },
  statistics: Object,
  sessionTokensWithExpiryTime: [String],
  sessionTokens: [String],
  apiKey: String,
});
userSchema.methods.getTeacherData = async function getTeacherData() {
  let data: { [key: string]: any } = {};
  // groups
  let groupsOwned = await Group.find({ owner: this._id });
  let groupsIn = await Group.find({ members: this._id });
  data.groups = {
    owner: groupsOwned,
    member: groupsIn,
  };
  return data;
};
const User = model<IUser>("User", userSchema, "users");
export { User, IUser };
