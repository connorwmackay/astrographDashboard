// Import ExpressJS
const express = require('express');
const router = express.Router();

// Import the Database
const {getDatabase} = require('../db');

// When the user requests to view the home page, this code will be called
router.get('/', (req, res) => {
    res.render('home', {user: req.session.user});
});

// Export the router so that the web app can use it
module.exports = router;