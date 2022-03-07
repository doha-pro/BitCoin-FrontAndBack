const express = require("express");
const app = express();
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser")
const path = require("path");
dotenv.config({ path: './.env' })
const request = require('request');
const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});
const publicDirectory = path.join(__dirname, './public')


db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MYSQL Connected  ...")
    }
})
app.use(express.static(publicDirectory))
app.set('view engine', 'hbs')
    // setting urlencoded to false to get JSON
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


// cookies


app.use(cookieParser())
    // Routes


app.use('/', require('./routes/pages')) //main pages   
app.use('/auth', require('./routes/auth')) ///pages for authentication for user 
app.use('/investment', require('./routes/investments')) //investmensts pages 






// LISTENING
app.listen(5000, () => {
    console.log("Server is started on port 5000")
})