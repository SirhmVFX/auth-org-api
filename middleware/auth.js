// middleware/auth.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
    }
    req.userId = decoded.userId;
    next();
  });
};

module.exports = authMiddleware;
