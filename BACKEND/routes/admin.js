const router = require("express").Router();
const db = require("../db");
const verify = require("../middleware/auth");

// CHECK ADMIN
function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.json("Not allowed");
  }
  next();
}

// STATS
router.get("/stats", verify, isAdmin, (req, res) => {
  db.query("SELECT COUNT(*) AS users FROM users", (err, u) => {
    if (err) return res.json(err);
    db.query("SELECT COUNT(*) AS tasks FROM tasks", (err, t) => {
      if (err) return res.json(err);
      res.json({
        users: parseInt(u.rows[0].users, 10),
        tasks: parseInt(t.rows[0].tasks, 10)
      });
    });
  });
});

// USERS
router.get("/users", verify, isAdmin, (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) return res.json(err);
    res.json(results ? results.rows : []);
  });
});

// DELETE USER
router.delete("/users/:id", verify, isAdmin, (req, res) => {
  db.query("DELETE FROM users WHERE id=$1", [req.params.id], (err) => {
    if (err) return res.json(err);
    res.json("User deleted");
  });
});

// ALL TASKS
router.get("/tasks", verify, isAdmin, (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.json(err);
    res.json(results ? results.rows : []);
  });
});

// DELETE TASK
router.delete("/tasks/:id", verify, isAdmin, (req, res) => {
  db.query("DELETE FROM tasks WHERE id=$1", [req.params.id], (err) => {
    if (err) return res.json(err);
    res.json("Task deleted");
  });
});

module.exports = router;