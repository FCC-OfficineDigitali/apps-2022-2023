require("dotenv").config()
const mysql = require("mysql")
const db = mysql.createPool({
    //local
    /*host: "localhost",
    user: "root",
    password: "",
    database: "od_loginsystem"*/
    //production officinedigitali
    host: "localhost",
	  port: "3306",
    user: "od_loginsystem",
    password: process.env.dbPassword,
    database: "od_loginsystem",
    ssl: false,
  	secureAuth: true
})

module.exports = db;