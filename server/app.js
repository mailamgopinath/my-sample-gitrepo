const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const studentRoutes = require("./routes/studentRoutes");
const employeeRoutes=require("./routes/EmployeeRoutes");

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "routes", "uploads")));

app.use(authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/employees",employeeRoutes);

module.exports = app;
