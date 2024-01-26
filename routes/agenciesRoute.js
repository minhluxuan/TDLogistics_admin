const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const agenciesController = require("../controllers/agenciesController");
const utils = require("../utils");
const Agencies = require("../database/Agencies");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
}, async (email, password, done) => {
    const agency = await Agencies.getOneAgency(["email"], [email]);
    if(agency.length <= 0) {
        return done(null, false);
    }

    const passwordFromDatabase = agency[0]["password"];
    // console.log(passwordFromDatabase);
    const match = bcrypt.compareSync(password, passwordFromDatabase);
    if(!match) {
        return done(null, false);
    }

    const agency_id = agency[0]["agency_id"];
    //console.log(agency_id);
    const permission = 3;

    return done(null, {
        agency_id,
        permission,
    });
});

passport.use("normalLogin", sessionStrategy);

router.post("/login", passport.authenticate("normalLogin", {
    successRedirect: "/api/v1/agencies/login_success",
    failureRedirect: "/api/v1/agencies/login_fail",
    failureFlash: true,
}), agenciesController.verifyAgencySuccess);

router.post("/login_success", agenciesController.verifyAgencySuccess);
router.post("/login_fail", agenciesController.verifyAgencyFail);
router.post("/create", agenciesController.createNewAgency);
router.post("/update", agenciesController.updateAgency);
router.get("/search", agenciesController.getAgencies);
router.delete("/delete", agenciesController.deleteAgency);

passport.serializeUser(utils.setAgencySession);
passport.deserializeUser((agency, done) => {
    utils.verifyAgencyPermission(agency, done);
});

module.exports = router;