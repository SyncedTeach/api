import express from "express";
import { logWrite } from "../utilities/log";
import { checkOwnerOfToken } from "../services/token";
import { User } from "../models/User";
import { safeFindUserByUsername } from "../services/authorize";
import bcrypt from "bcrypt";
// TODO: Remove username not found when using API key.
/**
 * This route allows fetching an ID to get a post with that ID.
 * @function
 * @param {express.Request} request The request object.
 * @param {express.Response} response The response object.
 * @param {string} request.cookies.username The fetcher's username, if you are going to use with cookies.
 * @param {string} request.cookies.sessionToken The fetcher's username, if you are going to use with cookies
 * @param {string} request.headers The fetcher's username and API key, if you are going to use with API Keys.
 */
const authenticationChecker = async function (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  let result = {
    success: false,
  };
  // must pass AT LEAST 1 check
  // check 1
  // check if user is real
  let cookies = request.cookies;
  let cookieResult = await checkOwnerOfToken(
    cookies.sessionToken || "",
    cookies.username || ""
  );
  // check 2
  // check api key
  let apiUsername = request.get("API-Username");
  let apiKey = request.get("API-Key");
  let keyResult = {
    success: false,
  };

  if (apiUsername && apiKey) {
    let user = await User.findOne({ username: apiUsername });
    keyResult.success = await bcrypt.compare(apiKey, user?.apiKey || "");
  }

  if (!cookieResult.success && !keyResult.success) {
    logWrite.info(`Did not carry out action: Invalid credentials.`);
    // incorrect cookies
    response.status(401).json(result);
    return result;
  }
  response.locals.username = apiUsername || cookies.username;
  next();
};

export { authenticationChecker };
