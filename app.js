const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth");
const orgRoutes = require("./routes/organisations");

const app = express();

app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/api/organisations", orgRoutes);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});

module.exports = app;
