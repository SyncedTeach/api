import express from "express";
import { logWrite } from "../utilities/log";
import { checkOwnerOfToken } from "../services/token";

const sessionTokenChecker = async function (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  let result = {
    success: false,
  };
  // check if user is real
  let cookies = request.cookies;
  let cookieResult = await checkOwnerOfToken(
    cookies.sessionToken || "",
    cookies.username || ""
  );
  if (!cookieResult.success) {
    logWrite.info(
      `Did not carry out action for ${cookies.username}: Invalid cookies`
    );
    // incorrect cookies
    response.status(401).json(result);
    return result;
  }
  next();
};

export { sessionTokenChecker };
