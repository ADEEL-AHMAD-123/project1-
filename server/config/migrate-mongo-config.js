require("dotenv").config({ path: "config/.env" });

module.exports = {
    mongodb: {
      url: `${process.env.DB_URL}?connectTimeoutMS=30000&socketTimeoutMS=30000`,
      databaseName: "project1",
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
};


// COMMANDS FOR MONGODB MIGRATIONS SCRIPT
// 1-Run Pending Migrations:
// npx migrate-mongo up -f config/migrate-mongo-config.js


//2-Roll Back Most Recent Migration (if needed): 
// npx migrate-mongo down -f config/migrate-mongo-config.js


//3-Check Status: 
// npx migrate-mongo status -f config/migrate-mongo-config.js
