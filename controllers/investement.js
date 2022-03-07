const { promisify } = require('util')
const mysql = require("mysql2");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")
dotenv.config({ path: './.env' })
const superagent = require('superagent');

const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

exports.getAllInvestments = async(req, res, next) => {
    try {
        if (req.cookies.jwt) {
            let getAllData = { uid: "", investments: "" }
            const decodedJwt = await promisify(jwt.verify)(req.cookies.jwt, process.env.jwtSecret)
            console.log(decodedJwt);
            getAllData.uid = decodedJwt;
            db.query('SELECT * FROM Investments where uid =?', [decodedJwt.id], (error, results) => {
                if (!results) {

                    return next();
                }
                getAllData.investments = results;
                req.investments = getAllData
                console.log(req.investments)
                return next();
            })

        } else {
            next()
        }

    } catch (error) {
        console.log(error)

    }



}
exports.delete = (req, res, next) => {
    const id = +req.params.id
    if (!req.cookies.jwt || req.cookies.jwt == "logout") {
        res.status(400).redirect("/login")
    } else {
        try {
            db.query("SELECT * FROM Investments where id=? ", [id], (error, results) => {
                if (results.length == 1) {
                    db.query('DELETE FROM Investments WHERE id=?', [id], (error, results) => {
                        if (results) {
                            return res.status(200).redirect("/investment")
                        }
                    })
                }
            })

        } catch (error) {
            console.log(error)

        }
    }
}

exports.edit = (req, res, next) => {
        const id = +req.params.id
        if (!req.cookies.jwt || req.cookies.jwt == "logout") {
            res.status(400).redirect("/login")
        } else {
            try {
                db.query("SELECT * FROM Investments where id=? ", [id], (error, results) => {
                    if (results) {
                        req.investment = results[0]
                        console.log(req.investment);
                        return next();
                    }
                    next();
                })

            } catch (error) {
                console.log(error)
                next()

            }
        }

    }
    // UPDATE Investments SET value=5 WHERE id=2
exports.update = (req, res) => {

    const id = +req.params.id

    let { value } = req.body
    if (!req.cookies.jwt || req.cookies.jwt == "logout") {
        res.status(400).redirect("/login")
    } else {
        try {
            console.log(value)
            db.query("UPDATE Investments SET value = ? WHERE id = ?", [
                [value],
                [id]
            ], (error, results) => {
                if (results) {
                    req.investment = results[0]
                    console.log(req.investment);
                    return res.redirect("/investment");
                }

            })

        } catch (error) {
            console.log(error)


        }
    }


}
exports.show = (req, res, next) => {
    const id = +req.params.id
    if (!req.cookies.jwt || req.cookies.jwt == "logout") {
        res.status(400).redirect("/login")
    } else {
        try {
            db.query("SELECT * FROM Investments where id=? ", [id], (error, results) => {
                if (results) {
                    req.investment = results[0]
                    console.log(req.investment);
                    return next();
                }
                next();
            })

        } catch (error) {
            console.log(error)
            next()

        }
    }


}


exports.invest = async(req, res, next) => {
    var data = { price: "", date: "" }
    if (!req.cookies.jwt || req.cookies.jwt == "logout") {
        res.status(400).redirect("/login")
    } else {
        try {
            // COINAPI
            // const res = await superagent.get('https://rest.coinapi.io/v1/assets/BTC?apikey=FE4D06D2-273E-45EF-A491-E6E198668DE7');

            // NOMICS APIS
            const res = await superagent.get('https://api.nomics.com/v1/currencies/ticker?key=df6cbe9bbf472a23013ebaf9e2182160aed0c6e3&ids=BTC,ETH,XRP&interval=1d,30d&convert=EUR&platform-currency=ETH&per-page=100&page=1');
            if (req.body) {
                const body = res.body[0];
                // COIN API
                // data.price = body.price_usd
                // data.date = body.data_end;

                // NOMICS APIS
                data.price = body.price
                data.date = body.price_date;
                req.data = data;
                return next();

            }
            next();


        } catch (err) {
            console.log(err.message);
            next

        };
    }


}
exports.investPost = async(req, res, next) => {
    if (!req.cookies.jwt || req.cookies.jwt == "logout") {
        res.status(400).redirect("/login")
    } else {
        try {
            const { value, price, date } = req.body;
            const decodedJwt = await promisify(jwt.verify)(req.cookies.jwt, process.env.jwtSecret);
            const uid = decodedJwt.id

            // date is auto saved in my sql it enters the time automatically 
            console.log(value, price, uid, date)
            db.query("INSERT INTO Investments SET ?", {
                price: price,
                value: value,
                uid: uid
            }, (error, results) => {
                if (results) {
                    console.log(results)
                    next();
                } else {
                    if (error) {
                        console.log(error)
                    }
                }

            })

        } catch (error) {
            console.log(error)
            next();


        }
    }


}