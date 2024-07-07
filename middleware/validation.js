// middleware/validation.js
const { body, validationResult } = require("express-validator");

const userValidationRules = () => {
  return [
    body("userId")
      .isString()
      .notEmpty()
      .withMessage("UserId must be unique and not empty"),
    body("firstName")
      .isString()
      .notEmpty()
      .withMessage("First name must not be null"),
    body("lastName")
      .isString()
      .notEmpty()
      .withMessage("Last name must not be null"),
    body("email").isEmail().withMessage("Email must be unique and not null"),
    body("password")
      .isString()
      .notEmpty()
      .withMessage("Password must not be null"),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = { userValidationRules, validate };
