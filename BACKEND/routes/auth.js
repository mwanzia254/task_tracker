const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
    [name, email, hashed],
    (err) => {
      if (err) return res.json(err);
      res.json("User created");
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = $1", [email], async (err, results) => {
    if (err) return res.json(err);
    if (!results || results.rows.length === 0) return res.json("User not found");

    const user = results.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json("Wrong password");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secretkey"
    );

    res.json({
      token,
      role: user.role
    });
  });
});

module.exports = router;