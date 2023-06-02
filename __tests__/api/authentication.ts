import { User } from "../../src/models/User";
import { register } from "../../src/services/authenticate";

describe("Authentication service", () => {
  it("should be able to add users", async () => {
    const testUser = new User({
      username: "testUser0001A",
      personalEmail: "testUser@made.up.school.mistertfy64.com",
      password: "password12345678",
    });
    const insertResult = await register(
      testUser.username,
      testUser.password,
      testUser.personalEmail
    );
    expect(insertResult.success).toBe(true);
  });

  it("should not be successful if username already exists", async () => {
    const testUser = new User({
      username: "testUser0001A",
      personalEmail: "testUser0001A@made.up.school.mistertfy64.com",
      password: "password87654321",
    });
    const insertResult = await register(
      testUser.username,
      testUser.password,
      testUser.personalEmail
    );
    expect(insertResult.success).toBe(false);
  });

  it("should not be successful if email already exists", async () => {
    const testUser = new User({
      username: "testUser0001B",
      personalEmail: "testUser@made.up.school.mistertfy64.com",
      password: "password8888888",
    });
    const insertResult = await register(
      testUser.username,
      testUser.password,
      testUser.personalEmail
    );
    expect(insertResult.success).toBe(false);
  });

  it("should not be successful if username is invalid", async () => {
    const testUser = new User({
      username: "<script>alert(1)</script>",
      personalEmail: "testUser@made.up.school.mistertfy64.com",
      password: "password8888888",
    });
    const insertResult = await register(
      testUser.username,
      testUser.password,
      testUser.personalEmail
    );
    expect(insertResult.success).toBe(false);
  });

  it("should not be successful if email is invalid", async () => {
    const testUser = new User({
      username: "testUser0002A",
      personalEmail: "<script>alert(1)</script>",
      password: "password8888888",
    });
    const insertResult = await register(
      testUser.username,
      testUser.password,
      testUser.personalEmail
    );
    expect(insertResult.success).toBe(false);
  });
});
