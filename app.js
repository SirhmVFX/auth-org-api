const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
require("dotenv").config();
const app = express();

app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("HNG backend task");
});
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 3000");
});

module.exports = app;
