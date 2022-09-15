const mysql = require("mysql")
const db = mysql.createPool({
    //local
    /*host: "localhost",
    user: "root",
    password: "",
    database: "od_libropassaggi"*/
    //production officinedigitali
    host: "localhost",
	  port: "3306",
    user: "od_libropassaggi",
    password: "o_21H#-_21H8lk18lk1",
    database: "od_libropassaggi",
    ssl: false,
  	secureAuth: true
})

module.exports = db;