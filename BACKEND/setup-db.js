const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
  const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user'
    );
  `;

  const tasksTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      user_id INT REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  try {
    console.log("Connecting to PostgreSQL...");
    const client = await pool.connect();
    
    console.log("Creating 'task_tracker' schema if not exists...");
    await client.query("CREATE SCHEMA IF NOT EXISTS task_tracker;");
    await client.query("SET search_path TO task_tracker;");
    
    console.log("Creating 'users' table inside task_tracker schema...");
    await client.query(usersTableQuery);
    
    console.log("Creating 'tasks' table inside task_tracker schema...");
    await client.query(tasksTableQuery);
    
    console.log("Database tables initialized successfully!");
    
    // Seed database if empty
    const userCountRes = await client.query("SELECT COUNT(*) FROM users");
    const count = parseInt(userCountRes.rows[0].count, 10);
    if (count === 0) {
      console.log("Seeding default database records...");
      const bcrypt = require("bcryptjs");
      const adminPasswordHash = await bcrypt.hash("admin123", 10);
      const userPasswordHash = await bcrypt.hash("user123", 10);

      // Insert Admin
      await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ["Admin User", "admin@example.com", adminPasswordHash, "admin"]
      );

      // Insert Regular User and get ID
      const userInsertRes = await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
        ["Regular User", "user@example.com", userPasswordHash, "user"]
      );
      const userId = userInsertRes.rows[0].id;

      // Insert Sample Tasks
      await client.query(
        "INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)",
        [
          "Complete Project Setup", "Configure database connection and server routes", "completed", userId,
          "Design Dashboard UI", "Create mockups and layout for the dashboard view", "pending", userId
        ]
      );
      console.log("Seeding completed successfully!");
    } else {
      console.log("Database already has records, skipping seeding.");
    }
    
    client.release();
  } catch (err) {
    console.error("Error setting up database tables:", err);
  } finally {
    await pool.end();
  }
};

createTables();
