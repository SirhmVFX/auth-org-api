// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { body, validationResult } = require("express-validator");
const router = express.Router();
require("dotenv").config();
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email").notEmpty(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.errors.length > 0) {
      const errArray = errors.errors.map((error) => {
        const { path, msg } = error;
        return { path, msg };
      });

      if (errArray.length > 0) {
        const err = errArray.map((error) => ({
          field: error.path,
          message: error.msg,
        }));

        return res.status(422).json({
          errors: err,
        });
      }
    }

    try {
      const { firstName, lastName, email, password, phone } = req.body;

      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({
          status: "Bad request",
          message: "Registration unsuccessful",
          statusCode: 400,
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          organisations: {
            create: {
              organisation: {
                create: {
                  name: `${firstName}'s Organisation`,
                  description: "",
                },
              },
            },
          },
        },
      });

      const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
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
      res.status(400).json({
        status: "Bad request",
        message: "Registration unsuccessful",
        statusCode: 400,
      });
    }
  },
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email").notEmpty(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.errors.length > 0) {
      const errArray = errors.errors.map((error) => {
        const { path, msg } = error;
        return { path, msg };
      });

      if (errArray.length > 0) {
        const err = errArray.map((error) => ({
          field: error.path,
          message: error.msg,
        }));

        return res.status(422).json({
          errors: err,
        });
      }
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
      }

      const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
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
      res.status(400).json({
        status: "Bad request",
        message: "Authentication failed",
        statusCode: 400,
      });
    }
  },
);

module.exports = router;
