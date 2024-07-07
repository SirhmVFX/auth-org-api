// jest.setup.js
const sequelize = require("./config/database");
const { User, Organisation } = require("./models");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
