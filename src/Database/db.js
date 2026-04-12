import mysql from "mysql2";

const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "lending_management_system",
});

export default db;