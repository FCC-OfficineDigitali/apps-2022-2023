require("dotenv").config()
const mysql = require("mysql")
const db = mysql.createPool({
  multipleStatements: true,

  //local
  /*host: "localhost",
  user: "root",
  password: "",
  database: "od_reservations",*/
  //production officinedigitali
  host: "localhost",
  port: "3306",
  user: "od_reservations",
  password: process.env.dbPassword,
  database: "od_reservations",
  ssl: false,
  secureAuth: true
})

module.exports = db;