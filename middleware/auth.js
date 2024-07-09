const jwt = require("jsonwebtoken");
require("dotenv").config();
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
      }

      try {
        const user = await prisma.user.findUnique({
          where: {
            email: decoded.email,
          },
        });

        if (!user) {
          return res.status(400).json({
            status: "Bad request",
            message: "Client error",
            statusCode: 400,
          });
        }

        req.user = user;
        next();
      } catch (err) {
        res.status(500).json({
          status: "Internal server error",
          message: "Server error",
          statusCode: 500,
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "Bad request",
      message: "Client error",
      statusCode: 400,
    });
  }
};

module.exports = authMiddleware;
