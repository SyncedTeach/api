import { Schema, model } from "mongoose";

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

const User = model<IUser>("User", userSchema, "users");
export { User, IUser };
