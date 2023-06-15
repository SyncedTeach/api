import bcrypt from "bcrypt";
import { User } from "../models/User";
import { checkHTML, checkMongoDB } from "../utilities/sanitize";
import { createToken } from "./token";
import { logWrite } from "../utilities/log";

// TODO: VALIDATE DATA!!!!!!!!!!!!!!!!!!!
/**
 * Allows the user to login.
 * @param username The username of the user attempting to login.
 * @param password The password of the user attempting to login.
 * @returns An object with the keys `info`.
 */
async function login(username: string, password: string) {
  let info = {
    token: "",
    message: "",
    uid: "",
    success: false,
  };

  if (!checkHTML(username) || !checkMongoDB(username)) {
    logWrite.info(`Unable to let ${username} log in: Invalid Username`);
    info.message = "Invalid username!";
    return info;
  }

  if (!checkHTML(password) || !checkMongoDB(password)) {
    logWrite.info(`Unable to let ${username} log in: Invalid Password`);
    info.message = "Invalid password!";
    return info;
  }
  let user = await User.findOne({ username: username });
  let email = await User.findOne({ personalEmail: username });

  if (!user && !email) {
    logWrite.info(`Unable to let ${username} log in: Can't find user`);
    info.message = "User/Email not found!";
    return info;
  }
  let userResult = user ? user : email;
  if (!userResult) {
    logWrite.info(`Unable to let ${username} log in: Can't find user`);
    info.message = "User/Email not found!";
    return info;
  }

  let passwordResult = await bcrypt.compare(password, userResult.password);
  if (!passwordResult) {
    logWrite.info(`Unable to let ${username} log in: Incorrect password`);
    info.message = "Incorrect Password!";
    return info;
  }
  let token = await createToken(32);
  let hashedToken = await bcrypt.hash(token, 8);
  let currentToken = userResult.sessionTokens;
  currentToken.push(hashedToken);
  userResult.sessionTokens = currentToken;
  await userResult.save();
  info.token = token;
  info.uid = userResult._id.toString();
  info.success = true;
  info.message = "User logged in!";
  logWrite.info(`User ${username} logged in.`);
  return info;
}

// TODO: Create a user and return a token
/**
 * Allows the user to login.
 * @param username The username of the new user.
 * @param password The password of the new user.
 * @param personal_email The email of the new user.
 * @returns An object with the keys `info`.
 */
async function register(
  username: string,
  password: string,
  personal_email: string
) {
  let info = {
    token: "",
    message: "",
    success: false,
  };

  if (!checkHTML(username) || !checkMongoDB(username)) {
    info.message = "Invalid username!";
    return info;
  }

  if (!checkHTML(password) || !checkMongoDB(password)) {
    info.message = "Invalid password!";
    return info;
  }
  if (!checkHTML(personal_email) || !checkMongoDB(personal_email)) {
    info.message = "Invalid personal e-mail!";
    return info;
  }

  let alrUsername = await User.findOne({ username: username });
  let alrPersonalEmail = await User.findOne({
    personalEmail: personal_email,
  });
  if (alrUsername || alrPersonalEmail) {
    info.message = "Username or personal email already exists!";
    return info;
  }

  let token = await createToken(32);
  let hashedToken = await bcrypt.hash(token, 8);
  // create user with a default structure
  let user = new User({
    username: username,
    password: await bcrypt.hash(password, 10),
    personalEmail: personal_email,
    sessionTokens: [hashedToken],
  });

  await user.save();

  info.token = token;
  info.success = true;
  info.message = "User created!";
  return info;
}

export { login, register };
