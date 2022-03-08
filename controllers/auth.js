const { promisify } = require('util')
const mysql = require("mysql2");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")
dotenv.config({ path: './.env' })
const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});


exports.register = (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body;
    db.query('SELECT email FROM users where email=?', [email], async(error, results) => {
        if (error) {
            console.log(error)
        }
        if (results.length > 0) {
            return res.status(400).render('register', { message: "This email is already used" })
        } else {
            if (password !== passwordConfirmation) {
                return res.status(400).render('register', { message: "Password don't match" })

            } else {
                let hashedPassword = await bcrypt.hash(password, 8);
                db.query("INSERT INTO users SET ?", { name: name, email: email, password: hashedPassword }, (error, results) => {
                    if (error) {
                        console.log(error)
                    } else {
                        return res.status(200).redirect("/login")
                            // return res.send("WEEEEEEEEEEEEEEEEEEEEEEEE")
                    }
                });

            }
        }



    });
}
exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render('login', { message: "Please provide your email and password" })
        }
        db.query("SELECT * FROM users where email = ?", [email], async(error, results) => {
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(400).render('login', { message: "Email or password is incorrect" })

            } else {
                const id = results[0].id;
                const token = jwt.sign({ id }, process.env.jwtSecret, { expiresIn: process.env.jwtExpiration });
                console.log(`the token is ${token}`)
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.jwtCookieExpiration * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/profile")
            }
        })

    } catch (error) {
        console.log(error)

    }

}


exports.isLoggedIn = async(req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            const decodedJwt = await promisify(jwt.verify)(req.cookies.jwt, process.env.jwtSecret)
            console.log(decodedJwt)
                // checking if the user still exists
            db.query('SELECT * FROM users where id =?', [decodedJwt.id], (error, results) => {
                if (!results) {
                    return next();
                }
                req.user = results[0];
                return next();
            })

        } catch (error) {
            console.log(error)
            return next();
        }
    } else {
        next();

    }


}

exports.logout = async(req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect('/');
}