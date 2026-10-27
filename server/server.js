require("dotenv").config();

const app = require("./app");
const db = require("./config/database");
const port = Number(process.env.PORT || 8000);

db.connect((err) => {
    if (err) {
        console.error(
            `MySQL connection failed (${err.code || "unknown error"}): ${err.message}`
        );
        console.error(
            "Check DB_HOST/DB_PORT and make sure the MySQL service is running."
        );
        process.exitCode = 1;
        return;
    }

    console.log("MySQL connected successfully");
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
