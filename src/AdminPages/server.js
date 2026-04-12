import express from "express";
import cors from "cors";
import db from "../Database/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => {
  const { fullName, username, password } = req.body;

  if (!fullName || !username || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  const checkUserSql =
    "SELECT * FROM LOAN_OFFICER WHERE Officer_Username = ?";

  db.query(checkUserSql, [username], (err, result) => {
    if (err) {
      console.log("Register check error:", err);
      return res.status(500).json({
        message: "Database error.",
      });
    }

    if (result.length > 0) {
      return res.status(400).json({
        message: "Username already exists.",
      });
    }

    const insertSql =
      "INSERT INTO LOAN_OFFICER (Officer_Name, Officer_Username, Officer_Password) VALUES (?, ?, ?)";

    db.query(insertSql, [fullName, username, password], (err, result) => {
      if (err) {
        console.log("Register insert error:", err);
        return res.status(500).json({
          message: "Failed to register.",
        });
      }

      return res.status(201).json({
        message: "Registration successful.",
      });
    });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  const sql =
    "SELECT * FROM LOAN_OFFICER WHERE Officer_Username = ? AND Officer_Password = ?";

  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.log("Login error:", err);
      return res.status(500).json({
        message: "Database error.",
      });
    }

    if (result.length > 0) {
      return res.status(200).json({
        message: "Login successful.",
        user: result[0],
      });
    }

    return res.status(401).json({
      message: "Invalid username or password.",
    });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});