require("dotenv").config()
const mysql = require("mysql")
const db = mysql.createPool({
  //local
  /*host: "localhost",
  user: "root",
  password: "",
  database: "od_reports"*/
  //production officinedigitali
  host: "localhost",
  port: "3306",
  user: "od_reports",
  password: process.env.dbPassword,
  database: "od_reports",
  ssl: false,
  secureAuth: true
})

module.exports = db;