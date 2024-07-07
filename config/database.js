// config/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "postgres://postgres:Sirhmvfx123@@localhost:5432/users",
  {
    dialect: "postgres",
  },
);

module.exports = sequelize;
