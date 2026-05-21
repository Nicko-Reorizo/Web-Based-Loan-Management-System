import mysql from "mysql2";

const db = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "root123",
  database: "lending_management_system",
});

export default db;