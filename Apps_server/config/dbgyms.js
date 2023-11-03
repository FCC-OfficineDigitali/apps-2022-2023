require("dotenv").config()
const mysql = require("mysql")
const db = mysql.createPool({
  //local
  /*host: "localhost",
  user: "root",
  password: "",
  database: "od_gyms"*/
  //production officinedigitali
  host: "localhost",
  port: "3306",
  user: "od_gyms",
  password: process.env.dbPassword,
  database: "od_gyms",
  ssl: false,
  secureAuth: true
})

module.exports = db;