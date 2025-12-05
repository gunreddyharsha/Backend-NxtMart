const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());
app.use(cors());

// --------------------------------------
// 1. MySQL Connection
// --------------------------------------
let db;

const initializeDBAndServer = async () => {
  try {
    db = await mysql.createConnection({
      host: "localhost",     // change if needed
      user: "user",          // your MySQL user
      password: "123654",  // your MySQL password
      database: "myapp"   // your DB name
    });

    console.log("MySQL Connected");

    // Create table if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS USER (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL
      )
    `);

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });

  } catch (err) {
    console.log("DB Error:", err.message);
    process.exit(1);
  }
};

initializeDBAndServer();

// --------------------------------------
// REGISTER API
// --------------------------------------
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({
      status: "400",
      message: "All fields are required"
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM USER WHERE email = ?`,
      [email]
    );

    if (rows.length > 0) {
      return res.json({
        status: "failure",
        message: "User already registered"
      });
    }

    await db.execute(
      `INSERT INTO USER (username, email, password) VALUES (?, ?, ?)`,
      [username, email, password]
    );

    res.json({
      status: "success",
      message: "Register successful"
    });

  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: err.message
    });
  }
});

// --------------------------------------
// LOGIN API
// --------------------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)
  if (email===undefined || password===undefined) {
    return res.json({
      status: "400",
      message: "All fields are required"
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM USER WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.json({
        status: "200",
        message: "No user found"
      });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.json({
        status: "200",
        message: "Password incorrect"
      });
    }

    const token = jwt.sign({ email: user.email }, "my_security_key");

    res.json({
      status: "200",
      message: "Login successful",
      token: token,
      ok: true
    });

  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: err.message
    });
  }
});
