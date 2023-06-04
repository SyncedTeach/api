import mongoose from "mongoose";
import { testApp } from "../universal";
import request from "supertest";
import { Group } from "../../src/models/Group";
describe("Group system", () => {
  // add groups as testing
  beforeAll(async () => {
    const publicGroup = new Group({
      private: false,
      joinCode: "testing-public",
      name: "testing public",
    });
    const privateGroup = new Group({
      private: true,
      joinCode: "testing-private",
      name: "testing private",
    });
    publicGroup.save();
    privateGroup.save();
  });

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

  it("should let users join public groups", async () => {
    const response = await request(testApp)
      .post("/v1/groups/join/testing-public")
      .set("Cookie", [
        "username=normal-tester",
        "sessionToken=sessionToken456",
      ]);
    expect(response.body.success).toBe(true);
  });

  it("should not let users join private groups", async () => {
    const response = await request(testApp)
      .post("/v1/groups/join/testing-private")
      .set("Cookie", [
        "username=normal-tester",
        "sessionToken=sessionToken456",
      ]);
    expect(response.body.success).toBe(false);
  });

  it("should not let users join groups if credentials are incorrect", async () => {
    const response = await request(testApp)
      .post("/v1/groups/join/testing-public")
      .set("Cookie", [
        "username=normal-tester",
        "sessionToken=badSessionToken",
      ]);
    expect(response.body.success).toBe(false);
  });
});
