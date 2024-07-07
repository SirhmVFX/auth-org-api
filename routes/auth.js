// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Organisation } = require("../models");
const { userValidationRules, validate } = require("../middleware/validation");
const router = express.Router();

router.post("/register", userValidationRules(), validate, async (req, res) => {
  try {
    const { userId, firstName, lastName, email, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    const org = await Organisation.create({
      orgId: `${userId}_org`,
      name: `${firstName}'s Organisation`,
    });

    await user.addOrganisation(org);

    const token = jwt.sign({ userId: user.userId }, "secretKey", {
      expiresIn: "1h",
    });

    res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    res
      .status(400)
      .json({
        status: "Bad request",
        message: "Registration unsuccessful",
        statusCode: 400,
      });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
    }

    const token = jwt.sign({ userId: user.userId }, "secretKey", {
      expiresIn: "1h",
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    res
      .status(400)
      .json({
        status: "Bad request",
        message: "Authentication failed",
        statusCode: 400,
      });
  }
});

module.exports = router;
