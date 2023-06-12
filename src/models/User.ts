import mongoose, { HydratedDocument, Schema, model } from "mongoose";
import { Group, IGroup } from "./Group";
import { Post } from "./Post";

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
  saveAPIKey(key: string): void;
  getTeacherData(): object;
  getStudentData(): object;
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
  function formatGroup(groupData: IGroup) {
    return {
      name: groupData.name,
      members: groupData.members.length,
      owners: groupData.owners,
    };
  }

  let data: { [key: string]: any } = {};
  // groups
  // let groupsOwned = await Group.find({ owners: this._id });
  let groupsIn = await Group.find({ members: this._id });
  data.groups = await Promise.all(
    groupsIn.map(async (group) => {
      let postsMade = await Post.find({
        $and: [{ owner: this._id }, { group: group._id }],
      }).lean();
      // console.log('group:', group);
      const ownerPromises = group.owners.map((owner) =>
        User.findOne({ _id: owner })
      );
      // console.log('ownerPromises:', ownerPromises);
      const ownerResults = await Promise.all(ownerPromises);
      // console.log('ownerResults:', ownerResults);
      const ownerFormat = ownerResults.map((user) => user?.username).join(", ");
      // console.log('ownerFormat:', ownerFormat);

      return {
        name: group.name,
        id: group._id,
        size: group.members.length,
        owner: ownerFormat,
        owned: group.owners.includes(this._id),
        postsMade: postsMade,
      };
    })
  );

  return data;
};

userSchema.methods.getStudentData = async function getStudentData() {
  function formatGroup(groupData: IGroup) {
    return {
      name: groupData.name,
      members: groupData.members.length,
      owners: groupData.owners,
    };
  }

  let data: { [key: string]: any } = {};
  // groups
  // let groupsOwned = await Group.find({ owners: this._id });
  let groupsIn = await Group.find({ members: this._id });

  data.groups = await Promise.all(
    groupsIn.map(async (group) => {
      let postsMade = await Post.find({
        $and: [{ owner: this._id }, { group: group._id }],
      }).lean();
      // console.log('group:', group);
      const ownerPromises = group.owners.map((owner) =>
        User.findOne({ _id: owner })
      );
      // console.log('ownerPromises:', ownerPromises);
      const ownerResults = await Promise.all(ownerPromises);
      // console.log('ownerResults:', ownerResults);
      const ownerFormat = ownerResults.map((user) => user?.username).join(", ");
      // console.log('ownerFormat:', ownerFormat);

      return {
        name: group.name,
        id: group._id,
        size: group.members.length,
        owner: ownerFormat,
        owned: group.owners.includes(this._id),
        postsMade: postsMade,
      };
    })
  );

  return data;
};
userSchema.methods.saveAPIKey = async function saveAPIKey(key: string) {
  this.apiKey = key;
  this.save();
};
const User = model<IUser>("User", userSchema, "users");
export { User, IUser };
