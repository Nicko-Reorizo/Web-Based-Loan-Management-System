import http from "http";
import db from "./db.js";

const PORT = 5000;

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
};

const readBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", reject);
  });
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (req.method === "GET" && req.url === "/") {
    return sendJson(res, 200, {
      success: true,
      message: "Backend is running.",
    });
  }

  if (req.method === "POST" && req.url === "/api/loans/apply") {
    try {
      const body = await readBody(req);

      const {
        fullName,
        phoneNumber,
        street,
        city,
        province,
        zip,
        amount,
        loanTenure,
        loanType,
      } = body;

      if (
        !fullName ||
        !phoneNumber ||
        !street ||
        !city ||
        !province ||
        !zip ||
        !amount ||
        !loanTenure ||
        !loanType
      ) {
        return sendJson(res, 400, {
          success: false,
          message: "All fields are required.",
        });
      }

      const parsedAmount = Number(amount);
      const parsedLoanTenure = Number(loanTenure);
      const parsedLoanType = Number(loanType);

      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return sendJson(res, 400, {
          success: false,
          message: "Amount must be greater than 0.",
        });
      }

      if (Number.isNaN(parsedLoanTenure) || parsedLoanTenure <= 0) {
        return sendJson(res, 400, {
          success: false,
          message: "Loan tenure must be greater than 0.",
        });
      }

      let loanTypeId;
      let interestRate;

      if (parsedLoanType === 3) {
        loanTypeId = 1;
        interestRate = 3;
      } else if (parsedLoanType === 5) {
        loanTypeId = 2;
        interestRate = 5;
      } else {
        return sendJson(res, 400, {
          success: false,
          message: "Invalid loan type selected.",
        });
      }

      const [existingBorrowers] = await db.promise().query(
        `SELECT Client_ID
         FROM BORROWER
         WHERE Client_FullName = ? AND Phone_Number = ?
         LIMIT 1`,
        [fullName, phoneNumber]
      );

      let clientId;

      if (existingBorrowers.length > 0) {
        clientId = existingBorrowers[0].Client_ID;
      } else {
        const [borrowerResult] = await db.promise().query(
          `INSERT INTO BORROWER
           (Client_FullName, Street, City, Province, ZIP, Phone_Number)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [fullName, street, city, province, zip, phoneNumber]
        );

        clientId = borrowerResult.insertId;
      }

      const today = new Date();
      const maturityDate = addMonths(today, parsedLoanTenure);

      const interestAmount =
        parsedAmount * (interestRate / 100) * parsedLoanTenure;

      const totalAmount = parsedAmount + interestAmount;
      const totalMonthlyAmortization = totalAmount / parsedLoanTenure;

      const [loanResult] = await db.promise().query(
        `INSERT INTO LOAN
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
           Loan_Tenure
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          loanTypeId,
          null,
          parsedAmount,
          totalMonthlyAmortization,
          null,
          formatDate(maturityDate),
          totalAmount,
          interestAmount,
          null,
          "Pending",
          parsedLoanTenure,
        ]
      );

      return sendJson(res, 201, {
        success: true,
        message: "Loan application submitted successfully.",
        data: {
          borrowerId: clientId,
          loanId: loanResult.insertId,
          loanTypeId,
          interestRate,
          interestAmount,
          totalAmount,
          totalMonthlyAmortization,
          status: "Pending",
        },
      });
    } catch (error) {
      console.error("BACKEND ERROR:", error);

      return sendJson(res, 500, {
        success: false,
        message: error.message || "Server error.",
        error: error.message,
      });
    }
  }

  return sendJson(res, 404, {
    success: false,
    message: "Route not found.",
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});