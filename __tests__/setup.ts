import mongoose from "mongoose";
import { User } from "../src/models/User";
import { initialize } from "./universal";

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
    isSuperAdministrator: true,
    isAdministrator: true,
    isTeacher: true,
  },
  // TODO: Is this really the best way to do it? Am I doing something wrong here?
  // "password123" hashed 8 times
  password: "$2b$08$lwX/04KYf544kpVkIAXUOedfeH9HXUQJRE8h9sqYgLlgoRK0JeggW",
  // "sessionToken456" hashed 8 times
  sessionTokens: [
    "$2b$08$W80OpuOJshfLsq7lYDIGqutkut9s3gOBpCNyD45D8arJuz1bQvIZ.",
  ],
});
// walk(path.join(__dirname, "..", "src", "routes")).forEach((file: string) => {
//   let path = file.substring("./routes".length);
//   path = path.substring(0, path.length - 3);
//   testApp.use(require(file).router);
// });

// // ===
// function walk(dir: string) {
//   let results: Array<string> = [];
//   let list = fs.readdirSync(path.join(dir));
//   list.forEach(function (file) {
//     let fileToStat = path.join(dir, file);
//     let stat = fs.statSync(fileToStat);
//     if (stat && stat.isDirectory()) {
//       results = results.concat(walk(fileToStat));
//     } else {
//       results.push(fileToStat);
//     }
//   });
//   return results;
// }

module.exports = async function setup() {
  await initialize();
};
