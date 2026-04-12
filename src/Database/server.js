import express from "express";
import cors from "cors";
import db from "./db.js"; 

const app = express();

app.use(cors());
app.use(express.json());
console.log("Borrower backend file loaded");


// showing borrowers
app.get("/api/borrowers", (req, res) => {
  const sql = `
    SELECT DISTINCT b.*
    FROM BORROWER b
    INNER JOIN LOAN l ON b.Client_ID = l.Client_ID
    WHERE l.Loan_Status = 'Approved'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});



app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/hello", (req, res) => {
  res.send("hello route works");
});


// showing pending
app.get("/api/pending-loans", (req, res) => {
  const sql = `
    SELECT 
      l.Loan_ID,
      l.Client_ID,
      l.Loan_Type_ID,
      l.Officer_ID,
      l.Principal_Amount,
      l.Total_Monthly_Amortization,
      l.Disbursement_Date,
      l.Maturity_Date,
      l.Balance,
      l.Interest_Amount,
      l.Date_Approved,
      l.Loan_Status,
      l.Loan_Tenure,
      b.Client_FullName,
      b.Street,
      b.City,
      b.Province,
      b.ZIP,
      b.Phone_Number
    FROM LOAN l
    INNER JOIN BORROWER b ON l.Client_ID = b.Client_ID
    WHERE l.Loan_Status = 'Pending'
    ORDER BY l.Loan_ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch pending loans" });
    }
    res.json(results);
  });
});

// for approving
app.put("/api/loans/:id/approve", (req, res) => {
  const { id } = req.params;
  const { officerId } = req.body; // 👈 NEW

  if (!officerId) {
    return res.status(400).json({ error: "Officer ID is required" });
  }

  const sql = `
    UPDATE LOAN
    SET Loan_Status = 'Approved',
        Date_Approved = CURDATE(),
        Officer_ID = ?
    WHERE Loan_ID = ?
  `;

  db.query(sql, [officerId, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to approve loan" });
    }

    res.json({ message: "Loan approved successfully" });
  });
});

app.put("/api/loans/:id/reject", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE LOAN
    SET Loan_Status = 'Rejected'
    WHERE Loan_ID = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to reject loan" });
    }
    res.json({ message: "Loan rejected successfully" });
  });
});



// dashboard stats
app.get("/api/dashboard-stats", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*)
       FROM LOAN
       WHERE Loan_Status = 'Approved') AS activeLoans,

      (SELECT COALESCE(SUM(Principal_Amount), 0)
       FROM LOAN
       WHERE Loan_Status = 'Approved') AS disbursed,

      (SELECT COUNT(*)
       FROM LOAN
       WHERE Loan_Status = 'Pending') AS pending,

      (SELECT COALESCE(SUM(Amortization_Amount), 0)
       FROM PAYMENT) AS collected
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Dashboard stats error:", err);
      return res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }

    res.json(results[0]);
  });
});


// login and register
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

// Get all approved loans with borrower name
app.get("/api/loans", (req, res) => {
  const sql = `
    SELECT
      l.Loan_ID,
      l.Client_ID,
      b.Client_FullName,
      l.Principal_Amount,
      l.Total_Monthly_Amortization,
      l.Maturity_Date,
      l.Balance,
      l.Loan_Tenure,
      l.Interest_Amount,
      l.Loan_Status
    FROM LOAN l
    INNER JOIN BORROWER b ON l.Client_ID = b.Client_ID
    WHERE l.Loan_Status = 'Approved'
    ORDER BY l.Loan_ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to fetch loans:", err);
      return res.status(500).json({ error: "Failed to fetch loans" });
    }
    res.json(results);
  });
});

// Add payment and update loan balance
app.get("/api/payments", (req, res) => {
  const sql = `
    SELECT
      p.Payment_ID,
      p.Loan_ID,
      b.Client_FullName,
      p.Amortization_Amount,
      p.Date
    FROM PAYMENT p
    INNER JOIN LOAN l ON p.Loan_ID = l.Loan_ID
    INNER JOIN BORROWER b ON l.Client_ID = b.Client_ID
    ORDER BY p.Date DESC, p.Payment_ID DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to fetch payments:", err);
      return res.status(500).json({ error: "Failed to fetch payments" });
    }
    res.json(results);
  });
});

app.post("/api/payments", (req, res) => {
  const { loanId, amount } = req.body;

  if (!loanId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "Invalid payment data" });
  }

  const getLoanSql = `
    SELECT Balance
    FROM LOAN
    WHERE Loan_ID = ?
  `;

  db.query(getLoanSql, [loanId], (err, loanResults) => {
    if (err) {
      console.error("Failed to get loan:", err);
      return res.status(500).json({ error: "Failed to get loan" });
    }

    if (loanResults.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const currentBalance = Number(loanResults[0].Balance);
    const paymentAmount = Number(amount);
    const newBalance = Math.max(currentBalance - paymentAmount, 0);

    const insertPaymentSql = `
      INSERT INTO PAYMENT (Loan_ID, Amortization_Amount, Date)
      VALUES (?, ?, CURDATE())
    `;

    db.query(insertPaymentSql, [loanId, paymentAmount], (err) => {
      if (err) {
        console.error("Failed to insert payment:", err);
        return res.status(500).json({ error: "Failed to insert payment" });
      }

      const updateLoanSql = `
        UPDATE LOAN
        SET Balance = ?
        WHERE Loan_ID = ?
      `;

      db.query(updateLoanSql, [newBalance, loanId], (err) => {
        if (err) {
          console.error("Failed to update balance:", err);
          return res.status(500).json({ error: "Failed to update loan balance" });
        }

        res.json({
          message: "Payment recorded successfully",
          newBalance,
        });
      });
    });
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


