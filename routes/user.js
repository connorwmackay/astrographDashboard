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
    passwordHashData = {
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

// A route that allows a username and password to perform a login
router.post('/login', async(req, res) => {
    if (req.body.username != null || req.body.username != '' &&
        req.body.password != null || req.body.password != '') {
            // TODO: Perform login
    } else {
        // TODO: Send error message
    }
});

// A route that allows the currently logged in user to logout
router.post('/logout', async(req, res) => {
    // TODO: Implement Logout route
});

// Export the created router with all the specified routes
module.exports = router;