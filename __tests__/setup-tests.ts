import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../src/models/User";
import { mongoServerInstance } from "./universal";
const highRankTestUser = new User({
  username: "admin-tester",
  membership: {
    isSuperAdministrator: true,
    isAdministrator: true,
    isTeacher: true,
  },
  // TODO: Is this really the best way to do it? Am I doing something wrong here?
  // "password123" hashed 8 times
  password: "$2b$08$lwX/04KYf544kpVkIAXUOedfeH9HXUQJRE8h9sqYgLlgoRK0JeggW",
  // "sessionToken123" hashed 8 times
  sessionTokens: [
    "$2b$08$ZkQRUTQhGf5NCmtOEfYVce1si.eyY2ufc0npcV7jveSj9DqR.tG3O",
  ],
});
const lowRankTestUser = new User({
  username: "normal-tester",
  membership: {
    isSuperAdministrator: false,
    isAdministrator: false,
    isTeacher: false,
  },
  // TODO: Is this really the best way to do it? Am I doing something wrong here?
  // "password123" hashed 8 times
  password: "$2b$08$lwX/04KYf544kpVkIAXUOedfeH9HXUQJRE8h9sqYgLlgoRK0JeggW",
  // "sessionToken456" hashed 8 times
  sessionTokens: [
    "$2b$08$W80OpuOJshfLsq7lYDIGqutkut9s3gOBpCNyD45D8arJuz1bQvIZ.",
  ],
});
beforeAll(async () => {
  // start mongo server

  await mongoose.connect(process.env.MONGODB_TESTING_URI as string);
  // create test users
  highRankTestUser.save();
  lowRankTestUser.save();
});

afterAll(async () => {
  await mongoose.disconnect();
});
