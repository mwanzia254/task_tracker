const router = require("express").Router();
const db = require("../db");
const verify = require("../middleware/auth");

// CREATE TASK
router.post("/", verify, (req, res) => {
  const { title, description } = req.body;

  db.query(
    "INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3)",
    [title, description, req.user.id],
    (err) => {
      if (err) return res.json(err);
      res.json("Task created");
    }
  );
});

// GET USER TASKS
router.get("/", verify, (req, res) => {
  db.query(
    "SELECT * FROM tasks WHERE user_id = $1",
    [req.user.id],
    (err, results) => {
      if (err) return res.json(err);
      res.json(results ? results.rows : []);
    }
  );
});

// UPDATE TASK
router.put("/:id", verify, (req, res) => {
  db.query(
    "UPDATE tasks SET title=$1, description=$2, status=$3 WHERE id=$4",
    [req.body.title, req.body.description, req.body.status, req.params.id],
    (err) => {
      if (err) return res.json(err);
      res.json("Task updated");
    }
  );
});

// DELETE TASK
router.delete("/:id", verify, (req, res) => {
  db.query(
    "DELETE FROM tasks WHERE id=$1",
    [req.params.id],
    (err) => {
      if (err) return res.json(err);
      res.json("Task deleted");
    }
  );
});

module.exports = router;