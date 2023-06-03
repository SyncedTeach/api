import mongoose from "mongoose";
import { testApp } from "../universal";
import request from "supertest";

describe("Group system", () => {
  it("should let users w/ permissions create new groups", async () => {
    // TODO: temporary workaround
    const response = await request(testApp)
      .post("/v1/groups/new")
      .set("Cookie", ["username=admin-tester", "sessionToken=sessionToken123"])
      .send({ "group-name": "test 1" });
    expect(response.body.success).toBe(true);
  });
});
