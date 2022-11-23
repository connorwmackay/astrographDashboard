// Import ExpressJS
const express = require('express');

// Create the router that will handle all routes at the /user route i.e. /user/login
const router = express.Router();

// Import the current database
const {getDatabase} = require('../db');

// Import CryptoJS for hashing passwords
const CryptoJS = require('crypto-js');

// Hashes a plaintext password and returns the hash and salt generated
function hashPassword(password) {
    let passwordHashData = {
        hash: '',
        salt: ''
    };

    passwordHashData.salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
    let key = CryptoJS.PBKDF2(password, passwordHashData.salt, {keySize: 64, iterations: 10000});
    passwordHashData.hash = CryptoJS.HmacSHA512(password, key).toString(CryptoJS.enc.Hex);

    return passwordHashData;
}

// Compares the password hash and salt provided to the password hash generates from the password and salt
function isPasswordCorrect(passwordHash, passwordSalt, password) {
    let keyFromPassword = CryptoJS.PBKDF2(password, passwordSalt, {keySize: 64, iterations: 10000});
    let hashFromPassword = CryptoJS.HmacSHA512(password, keyFromPassword).toString(CryptoJS.enc.Hex);

    if (hashFromPassword == passwordHash) {
        return true;
    } else {
        return false;
    }
}

router.get('/login', async(req, res) => {
    res.render('login', {user: req.session.user});
});

// A route that allows a username and password to perform a login
router.post('/login', async(req, res) => {
    let isUserLoggedIn = false;

    if (req.body.username != null && req.body.username != '' &&
        req.body.password != null && req.body.password != '') {
        
        try {
            const db = getDatabase();
            const userFindQuery = db.collection('users').findOne({username: req.body.username});
            const userFindResult = await userFindQuery.then(result => {return result;});

            if (userFindResult != null) {
                if (isPasswordCorrect(userFindResult.passwordHash, userFindResult.passwordSalt, req.body.password)) {
                    isUserLoggedIn = true;
                    req.session.user = {userId: userFindResult._id, username: userFindResult.username};

                    try {
                        req.session.save();
                    } catch(err) {
                        console.log(err);
                        isUserLoggedIn = false;
                    }
                }
            }
        } catch(err) {
            console.error(err);
            isUserLoggedIn = false;
        }
    } else {
        isUserLoggedIn = false;
    }

    if (!isUserLoggedIn) {
        res.render('login', {wasLoginSuccessful: false, user: req.session.user});
    } else {
        res.redirect('/');
    }
});

// A route that allows the currently logged in user to logout
router.post('/logout', async(req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/accountCreation', async(req, res) => {
    res.render('accountCreation', {user: req.session.user});
});

// Export the created router with all the specified routes
module.exports = router;
module.exports.hashPassword = hashPassword;
module.exports.isPasswordCorrect = isPasswordCorrect;