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
    res.render('accountCreation', {user: req.session.user, error: false, isAdmin: true, accountCreated: false});
});

router.post('/accountCreation', async(req, res) => {

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.psw;
    const repeatPassword = req.body.psw_repeat;
    const isAdmin = req.body.isAdmin;

    try {
        const db = getDatabase();

        const userFindQuery = db.collection('users').findOne({username: req.session.user.username});
        const userResult = await userFindQuery.then(result => {return result;});

        if (userResult != null) {
            if (userResult.isAdmin) {
                if ((username != undefined && password != undefined && repeatPassword != undefined) &&
                    (password == repeatPassword)) {

                        const userFindQuery = db.collection('users').findOne({username: username});
                        const userResult = await userFindQuery.then(result => {return result;});

                        if (userResult != null) {
                            res.render('accountCreation', {user: req.session.user, isAdmin: true, error: true, accountCreated: false});
                        } else {
                            const userHashData = hashPassword(password);
                            const userInsertQuery = db.collection('users').insertOne(
                                {
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email,
                                    username: username,
                                    passwordHash: userHashData.hash,
                                    passwordSalt: userHashData.salt,
                                    isAdmin: isAdmin
                                }
                            );
                
                            const userInsertResult = await userInsertQuery.then(result => {return result;});
                
                            res.render('accountCreation', {user: req.session.user, isAdmin: true, error: false, accountCreated: true});
                        }
                } else {
                    res.render('accountCreation', {user: req.session.user, error: true, isAdmin: true, accountCreated: false});
                }
            } else {
                res.render('accountCreation', {user: req.session.user, error: false, isAdmin: false, accountCreated: false});
            }
        } 
    } catch(err) {
        console.error(err);
        res.render('accountCreation', {user: req.session.user, error: true, isAdmin: true, accountCreated: false});
    }
});

// Export the created router with all the specified routes
module.exports = router;
module.exports.hashPassword = hashPassword;
module.exports.isPasswordCorrect = isPasswordCorrect;