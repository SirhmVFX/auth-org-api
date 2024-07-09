// tests/auth.spec.js
const request = require("supertest");
const app = require("../app");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
require("dotenv").config();

describe("Token Generation", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.userOrganisation.deleteMany({});
    await prisma.organisation.deleteMany({});
    await prisma.user.deleteMany({});
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Generate token that expires at the correct time", async () => {
    const loginResponse = await request(app).post("/auth/register").send({
      firstName: "Alice",
      lastName: "Smith",
      email: "alicesmith@example.com",
      password: "Password!234",
      phone: "9876543210",
    });

    const token = loginResponse.body.data.accessToken;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    let jwtExpiry;
    if (process.env.SECRET_EXP === "1d") {
      jwtExpiry = 86400;
    }

    expect(decoded.exp).toBeDefined();
    expect(decoded.exp - decoded.iat).toBe(jwtExpiry);
  }, 60000);

  it("Validate user details in the token", async () => {
    const loginResponse = await request(app).post("/auth/login").send({
      email: "alicesmith@example.com",
      password: "Password!234",
    });

    const token = loginResponse.body.data.accessToken;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    expect(decoded.email).toBe("alicesmith@example.com");
  }, 60000);
});

describe("Organisation test", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.userOrganisation.deleteMany({});
    await prisma.organisation.deleteMany({});
    await prisma.user.deleteMany({});
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let bobToken;
  let bobOrgId;
  let charlieToken;

  it("Create user", async () => {
    const bobResponse = await request(app).post("/auth/register").send({
      firstName: "Bob",
      lastName: "Johnson",
      email: "bobjohnson@example.com",
      password: "Password!234",
      phone: "9876543211",
    });

    bobToken = bobResponse.body.data.accessToken;
    jwt.verify(bobToken, process.env.SECRET_KEY);
  }, 60000);

  it("User to access user organisation", async () => {
    const response = await request(app)
      .get(`/api/organisations`)
      .set("Authorization", `Bearer ${bobToken}`);

    bobOrgId = response.body.data.organisations[0].orgId;

    expect(response.status).toBe(200);
    expect(response.body.data.organisations[0].name).toBe("Bob's Organisation");
  }, 60000);

  it("Create user2", async () => {
    const charlieResponse = await request(app).post("/auth/register").send({
      firstName: "Charlie",
      lastName: "Williams",
      email: "charliewilliams@example.com",
      password: "Password!234",
      phone: "9876543212",
    });

    charlieToken = charlieResponse.body.data.accessToken;
    jwt.verify(charlieToken, process.env.SECRET_KEY);
  }, 60000);

  it("Should deny access to a user who is not a member of the organization", async () => {
    const response = await request(app)
      .get(`/api/organisations/${bobOrgId}`)
      .set("Authorization", `Bearer ${charlieToken}`);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Access denied");
  }, 60000);
});

describe("End-End tests", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.userOrganisation.deleteMany({});
    await prisma.organisation.deleteMany({});
    await prisma.user.deleteMany({});
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Register User Successfully with User Organisation", async () => {
    const response = await request(app).post("/auth/register").send({
      firstName: "David",
      lastName: "Brown",
      email: "davidbrown@example.com",
      password: "Password!234",
      phone: "9876543213",
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Registration successful");
    expect(response.body.data.user.firstName).toBe("David");
    expect(response.body.data.user.email).toBe("davidbrown@example.com");
    expect(response.body.data.accessToken).toBeDefined();
  }, 60000);

  it("Fail If Required Fields Are Missing and check status code", async () => {
    const response = await request(app).post("/auth/register").send({
      lastName: "Brown",
      email: "davidbrown@example.com",
      password: "Password!234",
    });

    expect(response.status).toBe(422);
    expect(response.body.errors).toContainEqual({
      field: "firstName",
      message: "First name is required",
    });
  }, 60000);

  it("Fail if Duplicate User Info and check status code", async () => {
    await request(app).post("/auth/register").send({
      firstName: "Eve",
      lastName: "Davis",
      email: "evedavis@example.com",
      password: "Password!234",
      phone: "9876543214",
    });

    const response = await request(app).post("/auth/register").send({
      firstName: "Eve",
      lastName: "Davis",
      email: "evedavis@example.com",
      password: "Password!234",
      phone: "9876543214",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("Bad request");
    expect(response.body.message).toBe("Registration unsuccessful");
  }, 60000);

  it("Login User and Check response", async () => {
    await request(app).post("/auth/register").send({
      firstName: "Frank",
      lastName: "Evans",
      email: "frankevans@example.com",
      password: "Password!234",
      phone: "9876543215",
    });

    const response = await request(app).post("/auth/login").send({
      email: "frankevans@example.com",
      password: "Password!234",
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Login successful");
    expect(response.body.data.user.firstName).toBe("Frank");
    expect(response.body.data.user.email).toBe("frankevans@example.com");
    expect(response.body.data.accessToken).toBeDefined();
  }, 60000);

  it("Check Incorrect login details", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("Bad request");
    expect(response.body.message).toBe("Authentication failed");
  }, 60000);
});
