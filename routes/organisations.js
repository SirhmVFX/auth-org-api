// routes/organisations.js
const express = require("express");
const { Organisation, User } = require("../models");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "Bad request",
        message: "Authentication failed",
        statusCode: 401,
      });
    }
    req.userId = decoded.userId;
    next();
  });
};

router.post(
  "/",
  authMiddleware,
  [
    check("name")
      .isString()
      .notEmpty()
      .withMessage("Name is required and cannot be null"),
    check("description").isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "Bad request",
        message: "Client error",
        statusCode: 400,
      });
    }

    const { name, description } = req.body;

    try {
      const org = await Organisation.create({ name, description });

      const user = await User.findByPk(req.userId);
      await user.addOrganisation(org);

      res.status(201).json({
        status: "success",
        message: "Organisation created successfully",
        data: {
          orgId: org.orgId,
          name: org.name,
          description: org.description,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: "Bad request",
        message: "Client error",
        statusCode: 400,
      });
    }
  },
);

module.exports = router;
