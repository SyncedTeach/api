import { User } from "../models/User";

// NOTE: The fields with Username are only meant to be SHOWN TO THE USER, and not to be used internally.
// This is pass by reference maybe
async function addUsernames(target: any, targetKey: string, toAddTo: string) {
  let userIDs = target[targetKey];
  let usernames = [];
  for (let id of userIDs) {
    let user = await User.findOne({ _id: id });
    let username = user?.username || "";
    usernames.push(username);
  }
  target[toAddTo] = usernames;
  return target;
}

export { addUsernames };
