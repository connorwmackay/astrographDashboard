# Dashboard

## Installing the Dependencies

To install all the packages that the web app depends on, type **npm install** in the folder that contains *app.js*.

You'll need NodeJS installed, you can find it [here](https://nodejs.org/en/download/)

Additionally, this app uses MongoDB for its database. Therfore, you will need to install [MongoDB](https://www.mongodb.com/try/download/community), as well as [Mongo Compass](https://www.mongodb.com/try/download/compass) if it didn't install with MongoDB (which is a gui interface for managing MongoDB).

## Running the app

To run the app, open a terminal in the folder that contains *app.js* and type **npm start**. The terminal should then give a link, copy that link and paste it into a browser. You should now see the home page of the app.

To see if the database has properly connected, after starting the app at least once, you should open Mongo Compass and then you should see a database called **dashboardApp** that contains a table called **test** with one record.

## App Structure

The app contains a file called **app.js**, which is the core of the web app, it sets up most of the settings, connects to the database, connects the web pages to urls and starts the app.

The app also contains a file called **db.js** that takes the database defined in **app.js** and allows it to be used in any file by calling the function *getDatabase()*. The file will need to be imported, an example of this is ``` const {getDatabase} = require('../db'); ```, but bare in mind that the '../db' string will be different depending on where your file is.

The app also contains a file called **.env**, this contains data for configuring the web app. It's used to specify the login details for the admin user. For example:
```
ADMIN_USERNAME=""
ADMIN_PASSWORD=""
```
The app will create an admin account using that details when it's first started.

The app also contains a folder called **views**, these use the *.ejs* extension, but are essentially HTML with nice integration with the web app. They use a templating engine called [EJS](https://ejs.co/), which allows passing data from the server to the file, which allows the web pages to change based on the data they are sent.

Also, in the app is a folder called **routes**, this contains the server-side code for each web page. It will connect to the EJS file, handle forms such as a login form etc.

Finally, there's a folder called **public** which will include files used by the browser you view the app on, such as CSS, images or JavaScript that manipultates the generated HTML.
