// Import ExpressJS, which is a web app framework
const express = require('express');
const app = express();

const {connectDatabase} = require('./db');

// Import Path, for handling file paths
const path = require('path');

// Import MongoDB, a database library
const { MongoClient } = require('mongodb');

// Import DotENV, allows reading of .env files
const dotenv = require('dotenv');

// User sessions
const session = require('express-session');

// Mongo Store
const MongoStore = require('connect-mongo');

// Set the port that web app will be accessible from
const port = 8080;

// Configure dotenv and look for a .env file in the same directory as this file
dotenv.config({ path: './.env' });

// Modify web app properties
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Connect to a database via MongoDB
const oldDbUrl = 'mongodb://localhost:27017';
const dbUrl = process.env.MONGODB_URL;

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    store: new MongoStore({
         mongoUrl: dbUrl,
         dbName: 'dashboardApp',
         ttl: 7 * 24 * 60 * 60,
         crypto: {
            secret: process.env.COOKIE_SECRET
        }
    })
}));

const dbClient = new MongoClient(dbUrl);
let db;

async function connectMongoDB() {
    await dbClient.connect();
    db = dbClient.db('dashboardApp');
    connectDatabase(db);

    try {
        const testFindQuery = db.collection('test').findOne({name: 'example'});
        const testExample = await testFindQuery.then(result => {return result;});

        if (testExample === null) {
            const testInsertQuery = db.collection('test').insertOne({name: 'example'});
            await testInsertQuery.then(result => {return result;});
        }
    } catch(err) {
        console.error(err);
    }

    return 'Connected to database successfully';
}

const { hashPassword } = require('./routes/user.js');

// Create the admin user based on the data provided in the .env file
async function createAdminUser() {
    const adminFirstname = process.env.ADMIN_FIRSTNAME;
    const adminLastname = process.env.ADMIN_LASTNAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminUsername != null || adminPassword != null) {
        try {
            const adminFindQuery = db.collection('users').findOne({username: adminUsername});
            const adminResult = await adminFindQuery.then(result => {return result;});

            if (adminResult == null) {
                const adminHashData = hashPassword(adminPassword);
                const adminInsertQuery = db.collection('users').insertOne(
                    {
                        firstName: adminFirstname,
                        lastName: adminLastname,
                        email: adminEmail,
                        username: adminUsername,
                        passwordHash: adminHashData.hash,
                        passwordSalt: adminHashData.salt,
                        isAdmin: true
                    }
                );
                const adminInsertResult = await adminInsertQuery.then(result => {return result;});
            }
        } catch(err) {
            console.error(err);
        }
    } else {
        console.log("You need to specifiy an ADMIN_USERNAME and an ADMIN_PASSWORD in your .env file");
    }
}

// Include the Routers
const homeRouter = require('./routes/home.js');
const userRouter = require('./routes/user.js');
const uploadRouter = require('./routes/upload.js');

// Use the routers at their respective url
app.use('/', homeRouter);
app.use('/', userRouter);
app.use('/upload', uploadRouter);

// Try to connect to the database, using the function defined above
connectMongoDB()
    .then(console.log)
    .catch(console.error)
    .finally(() => 
{
    createAdminUser();

    // Start the app on the specified port after the database has connected
    app.listen(port, () => {
        console.log("Starting the dashboard at http://localhost:8080/");
    });
})
