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
    password: "o_21H#-_21H8lk18lk1",
    database: "od_loginsystem",
    ssl: false,
  	secureAuth: true
})

module.exports = db;