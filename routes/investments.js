const express = require('express')
const router = express.Router();
const authController = require('../controllers/auth');
const investmentsController = require('../controllers/investement')
    // get all data 
router.get("/", investmentsController.getAllInvestments, (req, res) => {
    if (req.investments) {
        if (req.investments.uid) {
            res.render('investments', { investments: req.investments })

        } else {
            res.redirect('/login')
        }

    }

})
router.get("/show/:id", investmentsController.show, (req, res) => {
    console.log("weeeweeeeeeeeeeeeeeeeeeeeeeeeee");
    console.log(req.investment);
    res.render("show", { investement: req.investment })

})


router.get("/delete/:id", investmentsController.delete, (req, res) => {

})

router.get("/edit/:id", investmentsController.edit, (req, res) => {
    console.log("weee");
    console.log(req.investment);
    res.render("update", { investement: req.investment })

})
router.post("/edit/:id", investmentsController.update)

router.post("/invest", investmentsController.investPost, (req, res) => {
    res.redirect("/investment")
})
module.exports = router;