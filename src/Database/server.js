import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Buffer } from "buffer";
import db from "./db.js"; 

const app = express();

app.use(cors());
app.use(express.json());
console.log("Borrower backend file loaded");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = String(storedHash || "").split(":");

  if (!salt || !hash) {
    return false;
  }

  const passwordHash = crypto.scryptSync(password, salt, 64);
  const storedPasswordHash = Buffer.from(hash, "hex");

  return (
    storedPasswordHash.length === passwordHash.length &&
    crypto.timingSafeEqual(storedPasswordHash, passwordHash)
  );
};

const createBorrowerTable = `
  CREATE TABLE IF NOT EXISTS BORROWER (
    Client_ID INT AUTO_INCREMENT PRIMARY KEY,
    Client_FullName VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NULL,
    Password_Hash VARCHAR(255) NULL,
    Birth_Date DATE NULL,
    Gender VARCHAR(50) NULL,
    Civil_Status VARCHAR(50) NULL,
    Valid_ID_Type VARCHAR(100) NULL,
    Valid_ID_Number VARCHAR(100) NULL,
    House_Number VARCHAR(100) NULL,
    Street VARCHAR(150) NOT NULL,
    Barangay VARCHAR(150) NULL,
    City VARCHAR(100) NOT NULL,
    Province VARCHAR(100) NOT NULL,
    ZIP VARCHAR(20) NOT NULL,
    Phone_Number VARCHAR(30) NOT NULL,
    Occupation VARCHAR(100) NULL,
    Employment_Status VARCHAR(100) NULL,
    Monthly_Salary DECIMAL(12,2) NULL,
    Employer_Name VARCHAR(150) NULL,
    Source_Of_Income VARCHAR(150) NULL,
    Emergency_Contact_Name VARCHAR(150) NULL,
    Emergency_Contact_Number VARCHAR(30) NULL,
    Relationship_To_Borrower VARCHAR(100) NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const ensureBorrowerProfileColumns = async () => {
  const extraColumns = [
    ["Email", "VARCHAR(150) NULL"],
    ["Password_Hash", "VARCHAR(255) NULL"],
    ["Gender", "VARCHAR(50) NULL"],
    ["Civil_Status", "VARCHAR(50) NULL"],
    ["Valid_ID_Type", "VARCHAR(100) NULL"],
    ["Valid_ID_Number", "VARCHAR(100) NULL"],
    ["House_Number", "VARCHAR(100) NULL"],
    ["Barangay", "VARCHAR(150) NULL"],
    ["Birth_Date", "DATE NULL"],
    ["Occupation", "VARCHAR(100) NULL"],
    ["Employment_Status", "VARCHAR(100) NULL"],
    ["Monthly_Salary", "DECIMAL(12,2) NULL"],
    ["Employer_Name", "VARCHAR(150) NULL"],
    ["Source_Of_Income", "VARCHAR(150) NULL"],
    ["Emergency_Contact_Name", "VARCHAR(150) NULL"],
    ["Emergency_Contact_Number", "VARCHAR(30) NULL"],
    ["Relationship_To_Borrower", "VARCHAR(100) NULL"],
    ["Created_At", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
  ];

  try {
    await db.promise().query(createBorrowerTable);
    const [columns] = await db.promise().query("SHOW COLUMNS FROM BORROWER");
    const existingColumns = new Set(columns.map((column) => column.Field));

    for (const [columnName, columnDefinition] of extraColumns) {
      if (!existingColumns.has(columnName)) {
        await db
          .promise()
          .query(`ALTER TABLE BORROWER ADD COLUMN ${columnName} ${columnDefinition}`);
      }
    }
  } catch (error) {
    console.error("Failed to ensure BORROWER table:", error);
  }
};

ensureBorrowerProfileColumns();


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

app.get("/api/client-dashboard/:clientId", async (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required." });
  }

  try {
    const [borrowers] = await db.promise().query(
      `SELECT Client_ID, Client_FullName
       FROM BORROWER
       WHERE Client_ID = ?
       LIMIT 1`,
      [clientId],
    );

    if (borrowers.length === 0) {
      return res.status(404).json({ message: "Borrower not found." });
    }

    const [loans] = await db.promise().query(
      `SELECT
         l.Loan_ID,
         l.Principal_Amount,
         l.Interest_Amount,
         l.Disbursement_Date,
         l.Date_Approved,
         l.First_Due_Date,
         l.Loan_Status,
         l.Loan_Tenure,
         l.Payment_Frequency,
         lt.Loan_Type_Name,
         lt.Interest_Rate
       FROM LOAN l
       INNER JOIN LOAN_TYPE lt ON l.Loan_Type_ID = lt.Loan_Type_ID
       WHERE l.Client_ID = ?
       ORDER BY l.Loan_ID DESC
       LIMIT 1`,
      [clientId],
    );

    if (loans.length === 0) {
      return res.json({
        borrower: borrowers[0],
        loan: null,
        activities: [],
      });
    }

    const loan = loans[0];

    const [paymentSummaryRows] = await db.promise().query(
      `SELECT
         COALESCE(SUM(Amortization_Amount), 0) AS totalPaid,
         COUNT(*) AS paymentCount
       FROM LOAN_PAYMENT
       WHERE Loan_ID = ?`,
      [loan.Loan_ID],
    );

    const [latestPaymentRows] = await db.promise().query(
      `SELECT Remaining_Balance
       FROM LOAN_PAYMENT
       WHERE Loan_ID = ?
       ORDER BY Payment_Date DESC, Payment_ID DESC
       LIMIT 1`,
      [loan.Loan_ID],
    );

    const [payments] = await db.promise().query(
      `SELECT Payment_Date, Amortization_Amount, Remaining_Balance
       FROM LOAN_PAYMENT
       WHERE Loan_ID = ?
       ORDER BY Payment_Date DESC, Payment_ID DESC
       LIMIT 5`,
      [loan.Loan_ID],
    );

    const principalAmount = Number(loan.Principal_Amount);
    const interestAmount = Number(loan.Interest_Amount);
    const totalLoanAmount = principalAmount + interestAmount;
    const totalPaid = Number(paymentSummaryRows[0].totalPaid);
    const balance =
      latestPaymentRows.length > 0
        ? Number(latestPaymentRows[0].Remaining_Balance)
        : totalLoanAmount;
    const monthlyAmortization =
      Number(loan.Loan_Tenure) > 0 ? totalLoanAmount / Number(loan.Loan_Tenure) : 0;

    const activities = [
      {
        date: loan.Date_Approved || loan.Disbursement_Date || null,
        activity:
          loan.Loan_Status === "Approved"
            ? "Loan Approved"
            : "Loan Application Submitted",
        amount: principalAmount,
        status: loan.Loan_Status,
      },
      ...payments.map((payment) => ({
        date: payment.Payment_Date,
        activity: "Payment Recorded",
        amount: Number(payment.Amortization_Amount),
        status: `Balance: ${Number(payment.Remaining_Balance).toFixed(2)}`,
      })),
    ];

    return res.json({
      borrower: borrowers[0],
      loan: {
        loanId: loan.Loan_ID,
        clientName: borrowers[0].Client_FullName,
        status: loan.Loan_Status,
        principalAmount,
        balance,
        monthlyAmortization,
        interestRate: `${Number(loan.Interest_Rate)}%`,
        loanType: loan.Loan_Type_Name,
        term: `${loan.Loan_Tenure} Months`,
        nextDueDate: loan.First_Due_Date,
        totalPaid,
        paymentCount: paymentSummaryRows[0].paymentCount,
        paymentFrequency: loan.Payment_Frequency,
      },
      activities,
    });
  } catch (error) {
    console.error("Client dashboard error:", error);
    return res.status(500).json({ message: "Failed to load client dashboard." });
  }
});

app.post("/api/borrower-info", async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      birthDate,
      gender,
      civilStatus,
      validIdType,
      validIdNumber,
      houseNumber,
      street,
      barangay,
      city,
      province,
      zip,
      occupation,
      employmentStatus,
      monthlySalary,
      employerName,
      sourceOfIncome,
      emergencyContactName,
      emergencyContactNumber,
      relationshipToBorrower,
    } = req.body;

    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !birthDate ||
      !gender ||
      !civilStatus ||
      !validIdType ||
      !validIdNumber ||
      !houseNumber ||
      !street ||
      !barangay ||
      !city ||
      !province ||
      !zip ||
      !occupation ||
      !employmentStatus ||
      !monthlySalary ||
      !sourceOfIncome ||
      !emergencyContactName ||
      !emergencyContactNumber ||
      !relationshipToBorrower
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const parsedSalary = Number(monthlySalary);

    if (Number.isNaN(parsedSalary) || parsedSalary <= 0) {
      return res.status(400).json({
        message: "Monthly salary must be greater than 0.",
      });
    }

    const [existingBorrowers] = await db.promise().query(
      `SELECT Client_ID
       FROM BORROWER
       WHERE Client_FullName = ? AND Phone_Number = ?
       LIMIT 1`,
      [fullName, phoneNumber],
    );

    if (existingBorrowers.length > 0) {
      const clientId = existingBorrowers[0].Client_ID;

      await db.promise().query(
        `UPDATE BORROWER
         SET Email = ?,
             Birth_Date = ?,
             Gender = ?,
             Civil_Status = ?,
             Valid_ID_Type = ?,
             Valid_ID_Number = ?,
             House_Number = ?,
             Street = ?,
             Barangay = ?,
             City = ?,
             Province = ?,
             ZIP = ?,
             Occupation = ?,
             Employment_Status = ?,
             Monthly_Salary = ?,
             Employer_Name = ?,
             Source_Of_Income = ?,
             Emergency_Contact_Name = ?,
             Emergency_Contact_Number = ?,
             Relationship_To_Borrower = ?
         WHERE Client_ID = ?`,
        [
          email,
          birthDate,
          gender,
          civilStatus,
          validIdType,
          validIdNumber,
          houseNumber,
          street,
          barangay,
          city,
          province,
          zip,
          occupation,
          employmentStatus,
          parsedSalary,
          employerName || null,
          sourceOfIncome,
          emergencyContactName,
          emergencyContactNumber,
          relationshipToBorrower,
          clientId,
        ],
      );

      return res.status(200).json({
        message: "Borrower information updated successfully.",
        clientId,
      });
    }

    const [borrowerResult] = await db.promise().query(
      `INSERT INTO BORROWER
       (
         Client_FullName,
         Email,
         Birth_Date,
         Gender,
         Civil_Status,
         Valid_ID_Type,
         Valid_ID_Number,
         House_Number,
         Street,
         Barangay,
         City,
         Province,
         ZIP,
         Phone_Number,
         Occupation,
         Employment_Status,
         Monthly_Salary,
         Employer_Name,
         Source_Of_Income,
         Emergency_Contact_Name,
         Emergency_Contact_Number,
         Relationship_To_Borrower
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        birthDate,
        gender,
        civilStatus,
        validIdType,
        validIdNumber,
        houseNumber,
        street,
        barangay,
        city,
        province,
        zip,
        phoneNumber,
        occupation,
        employmentStatus,
        parsedSalary,
        employerName || null,
        sourceOfIncome,
        emergencyContactName,
        emergencyContactNumber,
        relationshipToBorrower,
      ],
    );

    return res.status(201).json({
      message: "Borrower information saved successfully.",
      clientId: borrowerResult.insertId,
    });
  } catch (error) {
    console.error("Borrower info error:", error);
    return res.status(500).json({
      message: "Failed to save borrower information.",
    });
  }
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
  const { officerId } = req.body; 

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

  db.query(sql, [id], (err) => {
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

app.post("/borrower-register", (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    birthDate,
    gender,
    civilStatus,
    validIdType,
    validIdNumber,
    houseNumber,
    street,
    barangay,
    city,
    province,
    zip,
    occupation,
    employmentStatus,
    monthlySalary,
    sourceOfIncome,
    employerName,
    emergencyContactName,
    emergencyContactNumber,
    relationshipToBorrower,
  } = req.body;

  if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
    return res.status(400).json({
      message: "Account details are required.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Password and confirm password must match.",
    });
  }

  const checkSql = `
    SELECT Client_ID 
    FROM BORROWER 
    WHERE Email = ? OR Phone_Number = ?
    LIMIT 1
  `;

  db.query(checkSql, [email, phoneNumber], (err, result) => {
    if (err) {
      console.log("Borrower check error:", err);
      return res.status(500).json({ message: "Database error." });
    }

    if (result.length > 0) {
      return res.status(400).json({
        message: "Borrower already registered.",
      });
    }

    const passwordHash = hashPassword(password);

    const insertSql = `
      INSERT INTO BORROWER (
        Client_FullName,
        Email,
        Phone_Number,
        Password_Hash,
        Birth_Date,
        Gender,
        Civil_Status,
        Valid_ID_Type,
        Valid_ID_Number,
        House_Number,
        Street,
        Barangay,
        City,
        Province,
        ZIP,
        Occupation,
        Employment_Status,
        Monthly_Salary,
        Source_Of_Income,
        Employer_Name,
        Emergency_Contact_Name,
        Emergency_Contact_Number,
        Relationship_To_Borrower
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        fullName,
        email,
        phoneNumber,
        passwordHash,
        birthDate,
        gender,
        civilStatus,
        validIdType,
        validIdNumber,
        houseNumber,
        street,
        barangay,
        city,
        province,
        zip,
        occupation,
        employmentStatus,
        monthlySalary,
        sourceOfIncome,
        employerName,
        emergencyContactName,
        emergencyContactNumber,
        relationshipToBorrower,
      ],
      (err, result) => {
        if (err) {
          console.log("Borrower insert error:", err);
          return res.status(500).json({
            message: "Failed to register borrower.",
          });
        }

        return res.status(201).json({
          message: "Borrower registered successfully.",
          clientId: result.insertId,
        });
      }
    );
  });
});
// client login and register
app.post("/client-register", async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    birthDate,
    gender,
    civilStatus,
    validIdType,
    validIdNumber,
    houseNumber,
    street,
    barangay,
    city,
    province,
    zip,
    occupation,
    employmentStatus,
    monthlySalary,
    sourceOfIncome,
    employerName,
    emergencyContactName,
    emergencyContactNumber,
    relationshipToBorrower,
  } = req.body;
  const role = "Borrower";

  if (
    !fullName ||
    !email ||
    !phoneNumber ||
    !password ||
    !confirmPassword ||
    !birthDate ||
    !gender ||
    !civilStatus ||
    !validIdType ||
    !validIdNumber ||
    !houseNumber ||
    !street ||
    !barangay ||
    !city ||
    !province ||
    !zip ||
    !occupation ||
    !employmentStatus ||
    !monthlySalary ||
    !sourceOfIncome ||
    !emergencyContactName ||
    !emergencyContactNumber ||
    !relationshipToBorrower
  ) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Password and confirm password must match.",
    });
  }

  if (!passwordPattern.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
  }

  const parsedSalary = Number(monthlySalary);

  if (Number.isNaN(parsedSalary) || parsedSalary <= 0) {
    return res.status(400).json({
      message: "Monthly salary must be greater than 0.",
    });
  }

  let connection;

  try {
    const [existingBorrowers] = await db.promise().query(
      "SELECT Client_ID FROM BORROWER WHERE Email = ? OR Phone_Number = ? LIMIT 1",
      [email, phoneNumber],
    );

    if (existingBorrowers.length > 0) {
      return res.status(400).json({
        message: "Account already registered. Please log in instead.",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const passwordHash = hashPassword(password);
    const [borrowerResult] = await connection.query(
      `INSERT INTO BORROWER
       (
         Client_FullName,
         Email,
         Password_Hash,
         Phone_Number,
         Birth_Date,
         Gender,
         Civil_Status,
         Valid_ID_Type,
         Valid_ID_Number,
         House_Number,
         Street,
         Barangay,
         City,
         Province,
         ZIP,
         Occupation,
         Employment_Status,
         Monthly_Salary,
         Source_Of_Income,
         Employer_Name,
         Emergency_Contact_Name,
         Emergency_Contact_Number,
         Relationship_To_Borrower
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        passwordHash,
        phoneNumber,
        birthDate,
        gender,
        civilStatus,
        validIdType,
        validIdNumber,
        houseNumber,
        street,
        barangay,
        city,
        province,
        zip,
        occupation,
        employmentStatus,
        parsedSalary,
        sourceOfIncome,
        employerName || null,
        emergencyContactName,
        emergencyContactNumber,
        relationshipToBorrower,
      ],
    );

    await connection.commit();

    return res.status(201).json({
      message: "Account created successfully.",
      clientId: borrowerResult.insertId,
      user: {
        id: borrowerResult.insertId,
        name: fullName,
        email,
        phoneNumber,
        role,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.log("Client register error:", error);
    return res.status(500).json({
      message: "Failed to register.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post("/client-login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT 
      Client_ID,
      Client_FullName,
      Email,
      Phone_Number,
      Password_Hash
    FROM BORROWER
    WHERE Email = ?
    LIMIT 1
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log("Client login error:", err);
      return res.status(500).json({ message: "Database error." });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "No borrower account found.",
      });
    }

    const borrower = result[0];

    if (!verifyPassword(password, borrower.Password_Hash)) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: borrower.Client_ID,
        name: borrower.Client_FullName,
        email: borrower.Email,
        phoneNumber: borrower.Phone_Number,
      },
    });
  });
});

// admin login and register
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

    db.query(insertSql, [fullName, username, password], (err) => {
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
        user: {
          id: result[0].Officer_ID,
          name: result[0].Officer_Name,
          username: result[0].Officer_Username,
        },
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

// Upload Loan Application Form
app.post("/api/loans/apply", async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      street,
      barangay,
      city,
      province,
      zip,
      amount,
      loanTenure,
      loanTypeId,
      paymentFrequency,
    } = req.body;

    if (
      !fullName ||
      !phoneNumber ||
      !street ||
      !barangay ||
      !city ||
      !province ||
      !zip ||
      !amount ||
      !loanTenure ||
      !loanTypeId ||
      !paymentFrequency
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const parsedAmount = Number(amount);
    const parsedLoanTenure = Number(loanTenure);
    const parsedLoanTypeId = Number(loanTypeId);

    if (parsedAmount <= 0 || parsedAmount > 100000) {
      return res.status(400).json({
        message: "Amount must be from 1 to 100,000 only.",
      });
    }

    const allowedFrequencies = [
      "Weekly",
      "Bi-Monthly",
      "Monthly",
      "Quarterly",
      "Semi-Annual",
      "Annual",
    ];

    if (!allowedFrequencies.includes(paymentFrequency)) {
      return res.status(400).json({
        message: "Invalid payment frequency.",
      });
    }

    const [loanTypeRows] = await db.promise().query(
      `
      SELECT Loan_Type_ID, Loan_Type_Name, Interest_Rate
      FROM LOAN_TYPE
      WHERE Loan_Type_ID = ?
      LIMIT 1
      `,
      [parsedLoanTypeId]
    );

    if (loanTypeRows.length === 0) {
      return res.status(400).json({ message: "Invalid loan type selected." });
    }

    const loanType = loanTypeRows[0];
    const interestRate = Number(loanType.Interest_Rate);

    const [existingBorrowers] = await db.promise().query(
      `
      SELECT Client_ID
      FROM BORROWER
      WHERE Client_FullName = ? AND Phone_Number = ?
      LIMIT 1
      `,
      [fullName, phoneNumber]
    );

    let clientId;

    if (existingBorrowers.length > 0) {
      clientId = existingBorrowers[0].Client_ID;
    } else {
      const [borrowerResult] = await db.promise().query(
        `
        INSERT INTO BORROWER
        (Client_FullName, Street, Barangay, City, Province, ZIP, Phone_Number)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [fullName, street, barangay, city, province, zip, phoneNumber]
      );

      clientId = borrowerResult.insertId;
    }

    const today = new Date();
    const firstDueDate = new Date(today);
    const maturityDate = new Date(today);

    const addTermToDate = (date, frequency, term) => {
      if (frequency === "Weekly") date.setDate(date.getDate() + term * 7);
      if (frequency === "Bi-Monthly") date.setDate(date.getDate() + term * 15);
      if (frequency === "Monthly") date.setMonth(date.getMonth() + term);
      if (frequency === "Quarterly") date.setMonth(date.getMonth() + term * 3);
      if (frequency === "Semi-Annual") date.setMonth(date.getMonth() + term * 6);
      if (frequency === "Annual") date.setFullYear(date.getFullYear() + term);
    };

    addTermToDate(firstDueDate, paymentFrequency, 1);
    addTermToDate(maturityDate, paymentFrequency, parsedLoanTenure);

    const formattedToday = today.toISOString().split("T")[0];
    const formattedFirstDueDate = firstDueDate.toISOString().split("T")[0];
    const formattedMaturityDate = maturityDate.toISOString().split("T")[0];

    const interestAmount = parsedAmount * (interestRate / 100) * parsedLoanTenure;
    const totalAmount = parsedAmount + interestAmount;
    const amortization = totalAmount / parsedLoanTenure;

    const [loanResult] = await db.promise().query(
      `
      INSERT INTO LOAN
      (
        Client_ID,
        Loan_Type_ID,
        Officer_ID,
        Principal_Amount,
        Total_Monthly_Amortization,
        Disbursement_Date,
        Maturity_Date,
        Balance,
        Interest_Amount,
        Date_Approved,
        Loan_Status,
        Loan_Tenure,
        Payment_Frequency,
        First_Due_Date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientId,
        parsedLoanTypeId,
        1,
        parsedAmount,
        amortization,
        formattedToday,
        formattedMaturityDate,
        totalAmount,
        interestAmount,
        null,
        "Pending",
        parsedLoanTenure,
        paymentFrequency,
        formattedFirstDueDate,
      ]
    );

    res.status(201).json({
      message: "Loan application submitted successfully.",
      data: {
        loanId: loanResult.insertId,
        borrowerId: clientId,
        interestRate,
        interestAmount,
        totalAmount,
        amortization,
        status: "Pending",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error.",
    });
  }
});

// find loan
app.get("/api/loan-details/loan/:loanId", (req, res) => {
  const { loanId } = req.params;

  console.log("Loan ID received:", loanId);

  const sql = `
    SELECT
      b.Client_ID,
      b.Client_FullName,
      l.Loan_ID,
      l.Loan_Status,
      l.Balance,
      l.Principal_Amount,
      l.Total_Monthly_Amortization
    FROM BORROWER b
    INNER JOIN LOAN l ON b.Client_ID = l.Client_ID
    WHERE l.Loan_ID = ?
  `;

  db.query(sql, [loanId], (err, result) => {
    if (err) {
      console.error("Loan details query error:", err);
      return res.status(500).json({
        message: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Loan not found.",
      });
    }

    return res.status(200).json(result);
  });
});

app.get("/api/loan-types", (req, res) => {
  const sql = `
    SELECT Loan_Type_ID, Loan_Type_Name, Interest_Rate
    FROM LOAN_TYPE
    ORDER BY Loan_Type_Name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch loan types." });
    }

    res.json(results);
  });
});

//loan type table
app.post("/api/loan-types", (req, res) => {
  const { loanTypeName, interestRate } = req.body;
  const parsedRate = Number(interestRate);

  if (!loanTypeName || Number.isNaN(parsedRate) || parsedRate <= 0) {
    return res.status(400).json({
      message: "Loan type name and valid interest rate are required.",
    });
  }

  const sql = `
    INSERT INTO LOAN_TYPE (Loan_Type_Name, Interest_Rate)
    VALUES (?, ?)
  `;

  db.query(sql, [loanTypeName, parsedRate], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Loan type already exists." });
      }

      return res.status(500).json({ message: "Failed to add loan type." });
    }

    res.status(201).json({
      message: "Loan type added successfully.",
      loanTypeId: result.insertId,
    });
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


