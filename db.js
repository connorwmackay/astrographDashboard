let db;

function connectDatabase(database) {
    db = database;
}

function getDatabase() {
    return db;
}

module.exports.connectDatabase = connectDatabase;
module.exports.getDatabase = getDatabase;