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

// showing borrowers
app.get("/api/borrowers", (req, res) => {
  const sql = `
    SELECT DISTINCT
      b.Client_ID,
      b.Client_FullName,
      b.Email,
      b.Phone_Number,
      b.Birth_Date,
      b.Gender,
      b.Civil_Status,
      b.Created_At,

      a.House_Number,
      a.Street,
      a.Barangay,
      a.City,
      a.Province,
      a.ZIP,

      i.Valid_ID_Type,
      i.Valid_ID_Number,

      e.Occupation,
      e.Employment_Status,
      e.Monthly_Salary,
      e.Employer_Name,
      e.Source_Of_Income,

      ec.Emergency_Contact_Name,
      ec.Emergency_Contact_Number,
      ec.Relationship_To_Borrower
    FROM BORROWER b
    LEFT JOIN BORROWER_ADDRESS a ON b.Client_ID = a.Client_ID
    LEFT JOIN BORROWER_IDENTIFICATION i ON b.Client_ID = i.Client_ID
    LEFT JOIN BORROWER_EMPLOYMENT e ON b.Client_ID = e.Client_ID
    LEFT JOIN BORROWER_EMERGENCY_CONTACT ec ON b.Client_ID = ec.Client_ID
    INNER JOIN LOAN l ON b.Client_ID = l.Client_ID
    WHERE l.Loan_Status = 'Approved'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Borrowers query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

//SHOWING DETAILS OF BORROWERS AND EDIT DELETE
app.get("/api/borrowers/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.promise().query(
      `
      SELECT
        b.Client_ID,
        b.Client_FullName,
        b.Email,
        b.Phone_Number,
        b.Birth_Date,
        b.Gender,
        b.Civil_Status,
        b.Created_At,

        a.House_Number,
        a.Street,
        a.Barangay,
        a.City,
        a.Province,
        a.ZIP,

        i.Valid_ID_Type,
        i.Valid_ID_Number,

        e.Occupation,
        e.Employment_Status,
        e.Monthly_Salary,
        e.Employer_Name,
        e.Source_Of_Income,

        ec.Emergency_Contact_Name,
        ec.Emergency_Contact_Number,
        ec.Relationship_To_Borrower
      FROM BORROWER b
      LEFT JOIN BORROWER_ADDRESS a ON b.Client_ID = a.Client_ID
      LEFT JOIN BORROWER_IDENTIFICATION i ON b.Client_ID = i.Client_ID
      LEFT JOIN BORROWER_EMPLOYMENT e ON b.Client_ID = e.Client_ID
      LEFT JOIN BORROWER_EMERGENCY_CONTACT ec ON b.Client_ID = ec.Client_ID
      WHERE b.Client_ID = ?
      LIMIT 1
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Borrower not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log("Get borrower error:", error);
    res.status(500).json({ message: "Failed to get borrower info." });
  }
});

app.put("/api/borrowers/:id", async (req, res) => {
  const { id } = req.params;

  const {
    Client_FullName,
    Email,
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
    Relationship_To_Borrower,
  } = req.body;

  if (
    !Client_FullName ||
    !Email ||
    !Phone_Number ||
    !Birth_Date ||
    !Gender ||
    !Civil_Status ||
    !Valid_ID_Type ||
    !Valid_ID_Number ||
    !House_Number ||
    !Street ||
    !Barangay ||
    !City ||
    !Province ||
    !ZIP ||
    !Occupation ||
    !Employment_Status ||
    !Monthly_Salary ||
    !Source_Of_Income ||
    !Emergency_Contact_Name ||
    !Emergency_Contact_Number ||
    !Relationship_To_Borrower
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let connection;

  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [borrowerCheck] = await connection.query(
      `SELECT Client_ID FROM BORROWER WHERE Client_ID = ? LIMIT 1`,
      [id],
    );

    if (borrowerCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Borrower not found." });
    }

    await connection.query(
      `
      UPDATE BORROWER
      SET
        Client_FullName = ?,
        Email = ?,
        Phone_Number = ?,
        Birth_Date = ?,
        Gender = ?,
        Civil_Status = ?
      WHERE Client_ID = ?
      `,
      [
        Client_FullName,
        Email,
        Phone_Number,
        Birth_Date,
        Gender,
        Civil_Status,
        id,
      ],
    );

    await connection.query(
      `
      UPDATE BORROWER_ADDRESS
      SET
        House_Number = ?,
        Street = ?,
        Barangay = ?,
        City = ?,
        Province = ?,
        ZIP = ?
      WHERE Client_ID = ?
      `,
      [House_Number, Street, Barangay, City, Province, ZIP, id],
    );

    await connection.query(
      `
      UPDATE BORROWER_IDENTIFICATION
      SET
        Valid_ID_Type = ?,
        Valid_ID_Number = ?
      WHERE Client_ID = ?
      `,
      [Valid_ID_Type, Valid_ID_Number, id],
    );

    await connection.query(
      `
      UPDATE BORROWER_EMPLOYMENT
      SET
        Occupation = ?,
        Employment_Status = ?,
        Monthly_Salary = ?,
        Employer_Name = ?,
        Source_Of_Income = ?
      WHERE Client_ID = ?
      `,
      [
        Occupation,
        Employment_Status,
        Monthly_Salary,
        Employer_Name || null,
        Source_Of_Income,
        id,
      ],
    );

    await connection.query(
      `
      UPDATE BORROWER_EMERGENCY_CONTACT
      SET
        Emergency_Contact_Name = ?,
        Emergency_Contact_Number = ?,
        Relationship_To_Borrower = ?
      WHERE Client_ID = ?
      `,
      [
        Emergency_Contact_Name,
        Emergency_Contact_Number,
        Relationship_To_Borrower,
        id,
      ],
    );

    await connection.commit();

    res.json({ message: "Borrower updated successfully." });
  } catch (error) {
    if (connection) await connection.rollback();

    console.log("Update borrower error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Email or phone number already exists.",
      });
    }

    res.status(500).json({ message: "Failed to update borrower." });
  } finally {
    if (connection) connection.release();
  }
});

//add borrower
app.post("/api/admin/borrowers", async (req, res) => {
  const {
    Client_FullName,
    Email,
    Phone_Number,
    Password,
    ConfirmPassword,
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
    Employer_Name,
    Source_Of_Income,
    Emergency_Contact_Name,
    Emergency_Contact_Number,
    Relationship_To_Borrower,
  } = req.body;

  if (
    !Client_FullName ||
    !Email ||
    !Phone_Number ||
    !Password ||
    !ConfirmPassword ||
    !Birth_Date ||
    !Gender ||
    !Civil_Status ||
    !Valid_ID_Type ||
    !Valid_ID_Number ||
    !House_Number ||
    !Street ||
    !Barangay ||
    !City ||
    !Province ||
    !ZIP ||
    !Occupation ||
    !Employment_Status ||
    !Monthly_Salary ||
    !Source_Of_Income ||
    !Emergency_Contact_Name ||
    !Emergency_Contact_Number ||
    !Relationship_To_Borrower
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!emailPattern.test(Email)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid email address." });
  }

  if (Password !== ConfirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and confirm password must match." });
  }

  if (!passwordPattern.test(Password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
    });
  }

  const parsedSalary = Number(Monthly_Salary);

  if (Number.isNaN(parsedSalary) || parsedSalary <= 0) {
    return res
      .status(400)
      .json({ message: "Monthly salary must be greater than 0." });
  }

  let connection;

  try {
    const [existingBorrowers] = await db.promise().query(
      `
      SELECT Client_ID
      FROM BORROWER
      WHERE Email = ? OR Phone_Number = ?
      LIMIT 1
      `,
      [Email, Phone_Number],
    );

    if (existingBorrowers.length > 0) {
      return res.status(400).json({
        message: "Email or phone number already exists.",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const passwordHash = hashPassword(Password);

    const [borrowerResult] = await connection.query(
      `
      INSERT INTO BORROWER
      (
        Client_FullName,
        Email,
        Password_Hash,
        Birth_Date,
        Gender,
        Civil_Status,
        Phone_Number
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Client_FullName,
        Email,
        passwordHash,
        Birth_Date,
        Gender,
        Civil_Status,
        Phone_Number,
      ],
    );

    const clientId = borrowerResult.insertId;

    await connection.query(
      `
      INSERT INTO BORROWER_ADDRESS
      (
        Client_ID,
        House_Number,
        Street,
        Barangay,
        City,
        Province,
        ZIP
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [clientId, House_Number, Street, Barangay, City, Province, ZIP],
    );

    await connection.query(
      `
      INSERT INTO BORROWER_IDENTIFICATION
      (
        Client_ID,
        Valid_ID_Type,
        Valid_ID_Number
      )
      VALUES (?, ?, ?)
      `,
      [clientId, Valid_ID_Type, Valid_ID_Number],
    );

    await connection.query(
      `
      INSERT INTO BORROWER_EMPLOYMENT
      (
        Client_ID,
        Occupation,
        Employment_Status,
        Monthly_Salary,
        Employer_Name,
        Source_Of_Income
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        clientId,
        Occupation,
        Employment_Status,
        parsedSalary,
        Employer_Name || null,
        Source_Of_Income,
      ],
    );

    await connection.query(
      `
      INSERT INTO BORROWER_EMERGENCY_CONTACT
      (
        Client_ID,
        Emergency_Contact_Name,
        Emergency_Contact_Number,
        Relationship_To_Borrower
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        clientId,
        Emergency_Contact_Name,
        Emergency_Contact_Number,
        Relationship_To_Borrower,
      ],
    );

    await connection.commit();

    res.status(201).json({
      message: "Borrower added successfully.",
      clientId,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.log("Admin add borrower error:", error);

    res.status(500).json({ message: "Failed to add borrower." });
  } finally {
    if (connection) connection.release();
  }
});
//delete borrower
app.delete("/api/borrowers/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [loans] = await connection.query(
      `SELECT Loan_ID FROM LOAN WHERE Client_ID = ?`,
      [id],
    );

    const loanIds = loans.map((loan) => loan.Loan_ID);

    if (loanIds.length > 0) {
      await connection.query(`DELETE FROM LOAN_PAYMENT WHERE Loan_ID IN (?)`, [
        loanIds,
      ]);

      await connection.query(`DELETE FROM LOAN WHERE Client_ID = ?`, [id]);
    }

    const [deleteResult] = await connection.query(
      `DELETE FROM BORROWER WHERE Client_ID = ?`,
      [id],
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Borrower not found." });
    }

    await connection.commit();

    res.json({ message: "Borrower deleted successfully." });
  } catch (error) {
    if (connection) await connection.rollback();

    console.log("Delete borrower error:", error);
    res.status(500).json({ message: "Failed to delete borrower." });
  } finally {
    if (connection) connection.release();
  }
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
      Number(loan.Loan_Tenure) > 0
        ? totalLoanAmount / Number(loan.Loan_Tenure)
        : 0;

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
        term: `${loan.Loan_Tenure} ${loan.Payment_Frequency}`,
        nextDueDate: loan.First_Due_Date,
        totalPaid,
        paymentCount: paymentSummaryRows[0].paymentCount,
        paymentFrequency: loan.Payment_Frequency,
      },
      activities,
    });
  } catch (error) {
    console.error("Client dashboard error:", error);
    return res
      .status(500)
      .json({ message: "Failed to load client dashboard." });
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
      l.Principal_Amount,
      l.Interest_Amount,
      l.Disbursement_Date,
      l.Date_Approved,
      l.First_Due_Date,
      l.Loan_Status,
      l.Loan_Tenure,
      l.Payment_Frequency,
      b.Client_FullName,
      b.Phone_Number,
      a.Street,
      a.Barangay,
      a.City,
      a.Province,
      a.ZIP
    FROM LOAN l
    INNER JOIN BORROWER b ON l.Client_ID = b.Client_ID
    LEFT JOIN BORROWER_ADDRESS a ON b.Client_ID = a.Client_ID
    WHERE l.Loan_Status = 'Pending'
    ORDER BY l.Loan_ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Pending loans error:", err);
      return res.status(500).json({ error: "Failed to fetch pending loans" });
    }

    res.json(results);
  });
});

// for approving
app.put("/api/loans/:id/approve", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE LOAN
    SET Loan_Status = 'Approved',
        Date_Approved = CURDATE()
    WHERE Loan_ID = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to approve loan" });
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
       FROM LOAN_PAYMENT) AS collected
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
      },
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
    const [existingBorrowers] = await db
      .promise()
      .query(
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
      `
  INSERT INTO BORROWER
  (
    Client_FullName,
    Email,
    Password_Hash,
    Birth_Date,
    Gender,
    Civil_Status,
    Phone_Number
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
      [
        fullName,
        email,
        passwordHash,
        birthDate,
        gender,
        civilStatus,
        phoneNumber,
      ],
    );

    const clientId = borrowerResult.insertId;

    await connection.query(
      `
  INSERT INTO BORROWER_ADDRESS
  (
    Client_ID,
    House_Number,
    Street,
    Barangay,
    City,
    Province,
    ZIP
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
      [clientId, houseNumber, street, barangay, city, province, zip],
    );

    await connection.query(
      `
  INSERT INTO BORROWER_IDENTIFICATION
  (
    Client_ID,
    Valid_ID_Type,
    Valid_ID_Number
  )
  VALUES (?, ?, ?)
  `,
      [clientId, validIdType, validIdNumber],
    );

    await connection.query(
      `
  INSERT INTO BORROWER_EMPLOYMENT
  (
    Client_ID,
    Occupation,
    Employment_Status,
    Monthly_Salary,
    Employer_Name,
    Source_Of_Income
  )
  VALUES (?, ?, ?, ?, ?, ?)
  `,
      [
        clientId,
        occupation,
        employmentStatus,
        parsedSalary,
        employerName || null,
        sourceOfIncome,
      ],
    );

    await connection.query(
      `
  INSERT INTO BORROWER_EMERGENCY_CONTACT
  (
    Client_ID,
    Emergency_Contact_Name,
    Emergency_Contact_Number,
    Relationship_To_Borrower
  )
  VALUES (?, ?, ?, ?)
  `,
      [
        clientId,
        emergencyContactName,
        emergencyContactNumber,
        relationshipToBorrower,
      ],
    );

    await connection.commit();

    return res.status(201).json({
      message: "Account created successfully.",
      clientId,
      user: {
        id: clientId,
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
// admin register
app.post("/register", (req, res) => {
  const { fullName, username, password } = req.body;

  if (!fullName || !username || !password) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  const checkUserSql = `
    SELECT * 
    FROM ADMIN_USER 
    WHERE Username = ?
  `;

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

    const insertSql = `
      INSERT INTO ADMIN_USER 
      (Admin_Name, Username, Password) 
      VALUES (?, ?, ?)
    `;

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

// admin login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  const sql = `
    SELECT * 
    FROM ADMIN_USER 
    WHERE Username = ? AND Password = ?
    LIMIT 1
  `;

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
          id: result[0].Admin_ID,
          name: result[0].Admin_Name,
          username: result[0].Username,
          role: "admin",
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
      l.Interest_Amount,
      l.Disbursement_Date,
      l.Date_Approved,
      l.First_Due_Date,
      l.Loan_Tenure,
      l.Payment_Frequency,
      l.Loan_Status,
      COALESCE(
        (
          SELECT lp.Remaining_Balance
          FROM LOAN_PAYMENT lp
          WHERE lp.Loan_ID = l.Loan_ID
          ORDER BY lp.Payment_Date DESC, lp.Payment_ID DESC
          LIMIT 1
        ),
        l.Principal_Amount + l.Interest_Amount
      ) AS Balance,
      ROUND((l.Principal_Amount + l.Interest_Amount) / l.Loan_Tenure, 2) AS Amortization_Amount
    FROM LOAN l
    INNER JOIN BORROWER b ON l.Client_ID = b.Client_ID
    WHERE l.Loan_Status = 'Approved'
    ORDER BY l.Loan_ID ASC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch loans" });
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
      p.Payment_Date,
      p.Remaining_Balance
    FROM LOAN_PAYMENT p
    INNER JOIN LOAN l ON p.Loan_ID = l.Loan_ID
    INNER JOIN BORROWER b ON l.Client_ID = b.Client_ID
    ORDER BY p.Payment_Date DESC, p.Payment_ID DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch payments" });
    res.json(results);
  });
});

app.post("/api/payments", (req, res) => {
  const { loanId, amount } = req.body;

  if (!loanId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "Invalid payment data" });
  }

  const getBalanceSql = `
    SELECT
      COALESCE(
        (
          SELECT lp.Remaining_Balance
          FROM LOAN_PAYMENT lp
          WHERE lp.Loan_ID = l.Loan_ID
          ORDER BY lp.Payment_Date DESC, lp.Payment_ID DESC
          LIMIT 1
        ),
        l.Principal_Amount + l.Interest_Amount
      ) AS Current_Balance
    FROM LOAN l
    WHERE l.Loan_ID = ?
  `;

  db.query(getBalanceSql, [loanId], (err, loanResults) => {
    if (err) return res.status(500).json({ error: "Failed to get loan" });

    if (loanResults.length === 0) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const currentBalance = Number(loanResults[0].Current_Balance);
    const paymentAmount = Number(amount);
    const newBalance = Math.max(currentBalance - paymentAmount, 0);

    const insertPaymentSql = `
      INSERT INTO LOAN_PAYMENT
      (Loan_ID, Amortization_Amount, Payment_Date, Remaining_Balance)
      VALUES (?, ?, CURDATE(), ?)
    `;

    db.query(insertPaymentSql, [loanId, paymentAmount, newBalance], (err) => {
      if (err)
        return res.status(500).json({ error: "Failed to insert payment" });

      res.json({
        message: "Payment recorded successfully",
        newBalance,
      });
    });
  });
});

// Upload Loan Application Form
app.post("/api/loans/apply", async (req, res) => {
  try {
    const { clientId, amount, loanTypeId, paymentFrequency, loanTenure } =
      req.body;

    if (
      !clientId ||
      !amount ||
      !loanTypeId ||
      !paymentFrequency ||
      !loanTenure
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const parsedAmount = Number(amount);
    const parsedLoanTerm = Number(loanTenure);
    const parsedLoanTypeId = Number(loanTypeId);
    const parsedClientId = Number(clientId);

    if (parsedAmount <= 0 || parsedAmount > 100000) {
      return res.status(400).json({
        message: "Amount must be from 1 to 100,000 only.",
      });
    }

    const allowedFrequencies = ["Daily", "Weekly", "Semi-monthly", "Monthly"];

    if (!allowedFrequencies.includes(paymentFrequency)) {
      return res.status(400).json({
        message: "Invalid payment frequency.",
      });
    }

    const [borrowerRows] = await db.promise().query(
      `
      SELECT Client_ID
      FROM BORROWER
      WHERE Client_ID = ?
      LIMIT 1
      `,
      [parsedClientId],
    );

    if (borrowerRows.length === 0) {
      return res.status(400).json({ message: "Borrower account not found." });
    }

    const [existingLoanRows] = await db.promise().query(
      `
      SELECT Loan_ID, Loan_Status
      FROM LOAN
      WHERE Client_ID = ?
      LIMIT 1
      `,
      [parsedClientId],
    );

    if (existingLoanRows.length > 0) {
      return res.status(400).json({
        message:
          "You already have a loan. Only one loan is allowed per borrower.",
      });
    }

    const [loanTypeRows] = await db.promise().query(
      `
      SELECT Loan_Type_ID, Loan_Type_Name, Interest_Rate
      FROM LOAN_TYPE
      WHERE Loan_Type_ID = ?
      LIMIT 1
      `,
      [parsedLoanTypeId],
    );

    if (loanTypeRows.length === 0) {
      return res.status(400).json({ message: "Invalid loan type selected." });
    }

    const loanType = loanTypeRows[0];
    const interestRate = Number(loanType.Interest_Rate);

    const today = new Date();
    const firstDueDate = new Date(today);

    const addTermToDate = (date, frequency, term) => {
      if (frequency === "Daily") date.setDate(date.getDate() + term);
      if (frequency === "Weekly") date.setDate(date.getDate() + term * 7);
      if (frequency === "Semi-monthly")
        date.setDate(date.getDate() + term * 15);
      if (frequency === "Monthly") date.setMonth(date.getMonth() + term);
    };

    addTermToDate(firstDueDate, paymentFrequency, 1);

    const formattedToday = today.toISOString().split("T")[0];
    const formattedFirstDueDate = firstDueDate.toISOString().split("T")[0];

    const interestAmount = parsedAmount * (interestRate / 100);
    const totalAmount = parsedAmount + interestAmount;
    const amortization = totalAmount / parsedLoanTerm;

    const [loanResult] = await db.promise().query(
      `
      INSERT INTO LOAN
      (
        Client_ID,
        Loan_Type_ID,
        Principal_Amount,
        Disbursement_Date,
        Interest_Amount,
        Date_Approved,
        First_Due_Date,
        Loan_Status,
        Loan_Tenure,
        Payment_Frequency
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        parsedClientId,
        parsedLoanTypeId,
        parsedAmount,
        formattedToday,
        interestAmount,
        null,
        formattedFirstDueDate,
        "Pending",
        parsedLoanTerm,
        paymentFrequency,
      ],
    );

    res.status(201).json({
      message: "Loan application submitted successfully.",
      data: {
        loanId: loanResult.insertId,
        borrowerId: parsedClientId,
        interestRate,
        interestAmount,
        totalAmount,
        amortization,
        status: "Pending",
      },
    });
  } catch (error) {
    console.log("Apply loan error:", error);

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
      l.Principal_Amount,
      l.Interest_Amount,
      COALESCE(
        (
          SELECT lp.Remaining_Balance
          FROM LOAN_PAYMENT lp
          WHERE lp.Loan_ID = l.Loan_ID
          ORDER BY lp.Payment_Date DESC, lp.Payment_ID DESC
          LIMIT 1
        ),
        l.Principal_Amount + l.Interest_Amount
      ) AS Balance,
      ROUND((l.Principal_Amount + l.Interest_Amount) / l.Loan_Tenure, 2) AS Amortization_Amount
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

// loan type crud
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

app.put("/api/loan-types/:id", (req, res) => {
  const { id } = req.params;
  const { loanTypeName, interestRate } = req.body;
  const parsedRate = Number(interestRate);

  if (!loanTypeName || Number.isNaN(parsedRate) || parsedRate <= 0) {
    return res.status(400).json({
      message: "Loan type name and valid interest rate are required.",
    });
  }

  const sql = `
    UPDATE LOAN_TYPE
    SET Loan_Type_Name = ?,
        Interest_Rate = ?
    WHERE Loan_Type_ID = ?
  `;

  db.query(sql, [loanTypeName, parsedRate, id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Loan type already exists." });
      }

      return res.status(500).json({ message: "Failed to update loan type." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Loan type not found." });
    }

    res.json({ message: "Loan type updated successfully." });
  });
});

app.delete("/api/loan-types/:id", (req, res) => {
  const { id } = req.params;

  const checkSql = `
    SELECT COUNT(*) AS total
    FROM LOAN
    WHERE Loan_Type_ID = ?
  `;

  db.query(checkSql, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to check loan type." });
    }

    if (Number(rows[0].total) > 0) {
      return res.status(400).json({
        message: "Cannot delete this loan type because it is already used by a loan.",
      });
    }

    const deleteSql = `
      DELETE FROM LOAN_TYPE
      WHERE Loan_Type_ID = ?
    `;

    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Failed to delete loan type." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Loan type not found." });
      }

      res.json({ message: "Loan type deleted successfully." });
    });
  });
});
//
//business logic 50% loan
app.get("/api/client-loans/:clientId", (req, res) => {
  const { clientId } = req.params;

  const sql = `
    SELECT 
      l.Loan_ID,
      l.Client_ID,
      l.Loan_Type_ID,
      l.Principal_Amount,
      l.Disbursement_Date,
      l.Interest_Amount,
      l.Date_Approved,
      l.First_Due_Date,
      l.Loan_Status,
      l.Loan_Tenure,
      l.Payment_Frequency,
      lt.Loan_Type_Name,
      lt.Interest_Rate
    FROM loan l
    LEFT JOIN loan_type lt ON l.Loan_Type_ID = lt.Loan_Type_ID
    WHERE l.Client_ID = ?
    ORDER BY l.Loan_ID DESC
  `;

  db.query(sql, [clientId], (err, loans) => {
    if (err) {
      console.log("CLIENT LOANS ERROR:", err.sqlMessage);
      return res.status(500).json({ message: err.sqlMessage });
    }

    const result = loans.map((loan) => {
      const totalAmount =
        Number(loan.Principal_Amount) + Number(loan.Interest_Amount);

      const amortization = totalAmount / Number(loan.Loan_Tenure);

      const schedules = [];

      for (let i = 1; i <= loan.Loan_Tenure; i++) {
        const dueDate = new Date(loan.Disbursement_Date);

        if (loan.Payment_Frequency === "Daily") {
          dueDate.setDate(dueDate.getDate() + i);
        }

        if (loan.Payment_Frequency === "Weekly") {
          dueDate.setDate(dueDate.getDate() + i * 7);
        }

        if (loan.Payment_Frequency === "Semi-monthly") {
          dueDate.setDate(dueDate.getDate() + i * 15);
        }

        if (loan.Payment_Frequency === "Monthly") {
          dueDate.setMonth(dueDate.getMonth() + i);
        }

        schedules.push({
          paymentNumber: i,
          dueDate,
          amount: amortization,
        });
      }

      return {
        ...loan,
        Total_Amount: totalAmount,
        schedules,
      };
    });

    res.json(result);
  });
});

app.get("/api/client-loan-details/:loanId", (req, res) => {
  const { loanId } = req.params;

  const sql = `
    SELECT 
      l.*,
      lt.Loan_Type_Name,
      lt.Interest_Rate
    FROM loan l
    LEFT JOIN loan_type lt ON l.Loan_Type_ID = lt.Loan_Type_ID
    WHERE l.Loan_ID = ?
  `;

  db.query(sql, [loanId], (err, loans) => {
    if (err) {
      console.log("Loan details error:", err);
      return res.status(500).json({ error: err });
    }

    if (loans.length === 0) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const paymentSql = `
      SELECT *
      FROM loan_payment
      WHERE Loan_ID = ?
      ORDER BY Payment_Date ASC
    `;

    db.query(paymentSql, [loanId], (err, payments) => {
      if (err) {
        console.log("Payment details error:", err);
        return res.status(500).json({ error: err });
      }

      res.json({
        ...loans[0],
        payments,
      });
    });
  });
});
//loan eligibility
app.get("/api/client-loan-eligibility/:clientId", async (req, res) => {
  const { clientId } = req.params;

  try {
    const [loans] = await db.promise().query(
      `
      SELECT
        l.*,
        lt.Interest_Rate,
        lt.Loan_Type_Name
      FROM LOAN l
      INNER JOIN LOAN_TYPE lt ON l.Loan_Type_ID = lt.Loan_Type_ID
      WHERE l.Client_ID = ?
      ORDER BY l.Loan_ID DESC
      LIMIT 1
      `,
      [clientId],
    );

    if (loans.length === 0) {
      return res.json({
        canLoan: true,
        isReloan: false,
        reason: "You can apply for a loan.",
      });
    }

    const loan = loans[0];

    if (String(loan.Loan_Status).toLowerCase() === "pending") {
      return res.json({
        canLoan: false,
        isReloan: false,
        reason: "You already have a pending loan application.",
      });
    }

    const [paymentRows] = await db.promise().query(
      `
      SELECT COALESCE(SUM(Amortization_Amount), 0) AS totalPaid
      FROM LOAN_PAYMENT
      WHERE Loan_ID = ?
      `,
      [loan.Loan_ID],
    );

    const totalPaid = Number(paymentRows[0].totalPaid || 0);
    const totalLoanAmount =
      Number(loan.Principal_Amount || 0) + Number(loan.Interest_Amount || 0);

    const paidPercentage =
      totalLoanAmount > 0 ? (totalPaid / totalLoanAmount) * 100 : 0;

    if (paidPercentage >= 50) {
      return res.json({
        canLoan: true,
        isReloan: true,
        reason: "You can reloan up to the amount you have already paid.",
        loanId: loan.Loan_ID,
        maxReloanAmount: totalPaid,
        paidPercentage,
        loanTypeId: loan.Loan_Type_ID,
        loanTypeName: loan.Loan_Type_Name,
        interestRate: Number(loan.Interest_Rate),
        paymentFrequency: loan.Payment_Frequency,
        loanTenure: loan.Loan_Tenure,
      });
    }

    return res.json({
      canLoan: false,
      isReloan: false,
      reason: "You can reloan once you have paid at least 50%.",
      paidPercentage,
    });
  } catch (error) {
    console.log("Eligibility error:", error);
    res.status(500).json({ message: "Failed to check loan eligibility." });
  }
});

//reloan
app.post("/api/loans/reloan", async (req, res) => {
  const { clientId, amount } = req.body;

  if (!clientId || !amount || Number(amount) <= 0) {
    return res
      .status(400)
      .json({ message: "Valid reloan amount is required." });
  }

  const parsedAmount = Number(amount);
  let connection;

  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [loans] = await connection.query(
      `
      SELECT
        l.*,
        lt.Interest_Rate
      FROM LOAN l
      INNER JOIN LOAN_TYPE lt ON l.Loan_Type_ID = lt.Loan_Type_ID
      WHERE l.Client_ID = ?
      ORDER BY l.Loan_ID DESC
      LIMIT 1
      `,
      [clientId],
    );

    if (loans.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Existing loan not found." });
    }

    const loan = loans[0];

    if (String(loan.Loan_Status).toLowerCase() === "pending") {
      await connection.rollback();
      return res.status(400).json({
        message: "You still have a pending loan application.",
      });
    }

    const [paymentRows] = await connection.query(
      `
      SELECT COALESCE(SUM(Amortization_Amount), 0) AS totalPaid
      FROM LOAN_PAYMENT
      WHERE Loan_ID = ?
      `,
      [loan.Loan_ID],
    );

    const totalPaid = Number(paymentRows[0].totalPaid || 0);
    const totalLoanAmount =
      Number(loan.Principal_Amount || 0) + Number(loan.Interest_Amount || 0);

    const paidPercentage =
      totalLoanAmount > 0 ? (totalPaid / totalLoanAmount) * 100 : 0;

    if (paidPercentage < 50) {
      await connection.rollback();
      return res.status(400).json({
        message: "You can reloan once you have paid at least 50%.",
      });
    }

    if (parsedAmount > totalPaid) {
      await connection.rollback();
      return res.status(400).json({
        message: `Your maximum reloan amount is ₱${totalPaid.toFixed(2)}.`,
      });
    }

    const interestRate = Number(loan.Interest_Rate || 0);
    const newInterestAmount = parsedAmount * (interestRate / 100);

    const today = new Date();
    const firstDueDate = new Date(today);

    if (loan.Payment_Frequency === "Daily") {
      firstDueDate.setDate(firstDueDate.getDate() + 1);
    }

    if (loan.Payment_Frequency === "Weekly") {
      firstDueDate.setDate(firstDueDate.getDate() + 7);
    }

    if (loan.Payment_Frequency === "Semi-monthly") {
      firstDueDate.setDate(firstDueDate.getDate() + 15);
    }

    if (loan.Payment_Frequency === "Monthly") {
      firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    }

    const formattedToday = today.toISOString().split("T")[0];
    const formattedFirstDueDate = firstDueDate.toISOString().split("T")[0];

    await connection.query(
      `
      UPDATE LOAN
      SET
        Principal_Amount = Principal_Amount + ?,
        Interest_Amount = Interest_Amount + ?,
        Disbursement_Date = ?,
        First_Due_Date = ?,
        Date_Approved = NULL,
        Loan_Status = 'Pending'
      WHERE Loan_ID = ?
      `,
      [
        parsedAmount,
        newInterestAmount,
        formattedToday,
        formattedFirstDueDate,
        loan.Loan_ID,
      ],
    );
    const [latestBalanceRows] = await connection.query(
      `
  SELECT Remaining_Balance
  FROM LOAN_PAYMENT
  WHERE Loan_ID = ?
  ORDER BY Payment_Date DESC, Payment_ID DESC
  LIMIT 1
  `,
      [loan.Loan_ID],
    );

    const oldBalance =
      latestBalanceRows.length > 0
        ? Number(latestBalanceRows[0].Remaining_Balance)
        : Number(loan.Principal_Amount) +
          Number(loan.Interest_Amount) -
          totalPaid;

    const newBalance = oldBalance + parsedAmount + newInterestAmount;

    await connection.query(
      `
  INSERT INTO LOAN_PAYMENT
  (Loan_ID, Amortization_Amount, Payment_Date, Remaining_Balance)
  VALUES (?, ?, CURDATE(), ?)
  `,
      [loan.Loan_ID, 0, newBalance],
    );
    await connection.commit();

    res.json({
      message: "Reloan request submitted successfully.",
      data: {
        loanId: loan.Loan_ID,
        reloanAmount: parsedAmount,
        interestAmount: newInterestAmount,
        maxReloanAmount: totalPaid,
        status: "Pending",
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.log("Reloan error:", error);
    res.status(500).json({ message: "Failed to submit reloan request." });
  } finally {
    if (connection) connection.release();
  }
});

// payment history
app.get("/api/client-payment-history/:clientId", async (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required." });
  }

  try {
    const [payments] = await db.promise().query(
      `
      SELECT
        p.Payment_ID,
        p.Loan_ID,
        p.Amortization_Amount,
        p.Payment_Date,
        p.Remaining_Balance,
        l.Principal_Amount,
        l.Interest_Amount,
        l.Loan_Status,
        b.Client_FullName
      FROM LOAN_PAYMENT p
      INNER JOIN LOAN l ON p.Loan_ID = l.Loan_ID
      INNER JOIN BORROWER b ON l.Client_ID = b.Client_ID
      WHERE l.Client_ID = ?
        AND p.Amortization_Amount > 0
      ORDER BY p.Payment_Date DESC, p.Payment_ID DESC
      `,
      [clientId]
    );

    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.Amortization_Amount || 0),
      0
    );

    res.json({
      totalPaid,
      payments,
    });
  } catch (error) {
    console.log("Client payment history error:", error);
    res.status(500).json({
      message: "Failed to load payment history.",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
