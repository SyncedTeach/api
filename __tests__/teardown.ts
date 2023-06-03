import mongoose from "mongoose";
import { mongoServerInstance, testServer } from "./universal";
module.exports = async function () {
  //httpTerminator.terminate();
  await mongoServerInstance.stop();
  testServer.close();
};
