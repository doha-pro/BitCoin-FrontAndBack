const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const authController = require('../controllers/auth');
const investmentsController = require('../controllers/investement')
router.get("/", authController.isLoggedIn, (req, res) => {

    res.render('index', { user: req.user })


})
router.get("/register", (req, res) => {

    res.render('register')
})
router.get("/login", (req, res) => {

    res.render('login')
})

router.get("/profile", authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('profile', { user: req.user })

    } else {
        res.redirect('/login')
    }

    // res.render('profile')
})

router.get("/invest", investmentsController.invest, (req, res) => {
    if (req.data) {
        res.render('invest', { data: req.data })
    } else {
        res.redirect("/investment")
    }
})



module.exports = router;