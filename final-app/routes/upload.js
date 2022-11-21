// Import ExpressJS
const express = require('express');

// Create the router that will handle all routes at the /user route i.e. /user/login
const router = express.Router();

// Import the current database
const {getDatabase} = require('../db');

// Import to read Excel files
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

// Supports handling files
const path = require('path');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, 'upload.xlsx');
    }
});

const upload = multer({storage: storage});

router.get('/', async(req, res) => {
    res.render('upload', {"uploaded": false, "user": req.session.user, "error": false, "fileName": "", user: req.session.user});
});

router.get('/read', async(req, res) => {
    const filePath = 'uploads/upload.xlsx';

    if (fs.existsSync(filePath)) {

        const result = excelToJson({
            source: fs.readFileSync(filePath)
        });
        
        res.send({data: result});
    } else {
        res.send({
            data: [],
        })
    }
});

router.post('/', upload.single('csvFile'), async(req, res) => {
    if (req.file.originalname.includes(".xlsx")) {
        res.render('upload', {"uploaded": true, "user": req.session.user, "error": false, "fileName": req.file.originalname});
    } else {
        // TODO: Delete the upload.csv file on error
        res.render('upload', {"uploaded": false, "user": req.session.user, "error": true, "fileName": req.file.originalname});
    }
});

module.exports = router;