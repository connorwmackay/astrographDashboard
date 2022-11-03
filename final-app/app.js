// Import ExpressJS, which is a web app framework
const express = require('express');
const app = express();

const {connectDatabase} = require('./db');

// Import Path, for handling file paths
const path = require('path');

// Import MongoDB, a database library
const { MongoClient } = require('mongodb');

// Set the port that web app will be accessible from
const port = 8080;

// Modify web app properties
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Connect to a database via MongoDB
const dbUrl = 'mongodb://localhost:27017';
const dbClient = new MongoClient(dbUrl);

async function connectMongoDB() {
    await dbClient.connect();
    const db = dbClient.db('dashboardApp');
    connectDatabase(db);

    const testFindQuery = db.collection('test').findOne({name: 'example'});
    const testExample = await testFindQuery.then(result => {return result;});

    if (testExample === null) {
        const testInsertQuery = db.collection('test').insertOne({name: 'example'});
        await testInsertQuery.then(result => {return result;});
    }

    return 'Connected to database successfully';
}

// Include the Routers
const homeRouter = require('./routes/home.js');

// Use the routers at their respective url
app.use('/', homeRouter);

// Try to connect to the database, using the function defined above
connectMongoDB()
    .then(console.log)
    .catch(console.error)
    .finally(() => 
{
    // Start the app on the specified port after the database has connected
    app.listen(port, () => {
        console.log("Starting the dashboard at http://localhost:8080/");
    });
})
