import mongoose from "mongoose";
import { testApp } from "../universal";
import request from "supertest";

describe("Group system", () => {
  it("should let users w/ permissions create new groups", async () => {
    // TODO: temporary workaround
    const response = await request(testApp)
      .post("/v1/groups/new")
      .set("Cookie", ["username=admin-tester", "sessionToken=sessionToken123"])
      .send({ "group-name": "test 1 good" });
    expect(response.body.success).toBe(true);
  });

  it("should not let users w/o permissions create new groups", async () => {
    const response = await request(testApp)
      .post("/v1/groups/new")
      .set("Cookie", ["username=normal-tester", "sessionToken=sessionToken456"])
      .send({ "group-name": "test 2 bad" });
    expect(response.body.success).toBe(false);
  });

  it("should not let users w/ incorrect credentials create new groups", async () => {
    const response = await request(testApp)
      .post("/v1/groups/new")
      .set("Cookie", ["username=admin-tester", "sessionToken=badSessionToken"])
      .send({ "group-name": "test 3 bad" });
    expect(response.body.success).toBe(false);
  });
});
