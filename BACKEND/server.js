const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../FRONTEND")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/admin", require("./routes/admin"));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});