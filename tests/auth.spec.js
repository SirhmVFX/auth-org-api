// tests/auth.spec.js
const request = require("supertest");
const app = require("../app");

describe("User Registration and Login", () => {
  it("Should register user successfully with default organisation", async () => {
    const res = await request(app).post("/auth/register").send({
      userId: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      password: "password123",
      phone: "1234567890",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("status", "success");
    expect(res.body.data.user).toHaveProperty("userId", "testuser");
    expect(res.body.data).toHaveProperty("accessToken");
  });

  // Add more test cases here
});
