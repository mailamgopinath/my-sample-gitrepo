const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            status: false,
            message: "All Fields Are Required"
        });
    }

    db.query("select id from register where email=?", [email], async (err, result) => {
        if (err) {
            return res.status(400).json({
                status: false,
                message: "Failed To Check The Email"
            });
        }

        if (result.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Email Already Exists"
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = "insert into register(name,email,password,role) values(?,?,?,'student')";

            db.query(sql, [name, email, hashedPassword], (insertError) => {
                if (insertError) {
                    return res.status(405).json({
                        status: false,
                        message: "Registeration Failed"
                    });
                }

                return res.status(201).json({
                    status: true,
                    message: "Registration Successfully Done"
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Error Occurs in Internal Server"
            });
        }
    });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: false,
            message: "All Fields Are required"
        });
    }

    db.query(
        "select id,name,email,password,role from register where email=?",
        [email],
        async (err, result) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    message: "Failed To Check The Email"
                });
            }

            if (result.length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "Email Not Found"
                });
            }

            const user = result[0];

            try {
                const passwordMatches = await bcrypt.compare(password, user.password);

                if (!passwordMatches) {
                    return res.status(400).json({
                        status: false,
                        message: "Failed To Login Please Check It"
                    });
                }

                const token = jwt.sign({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }, JWT_SECRET, { expiresIn: "1h" });

                res.cookie("Token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 1000,
                    path: "/"
                });

                return res.status(200).json({
                    status: true,
                    message: "Login Successfully Done",
                    data: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                });
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: false,
                    message: "Server Internal Error Please Check It"
                });
            }
        }
    );
});

router.post("/logout", (req, res) => {
    res.clearCookie("Token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    return res.status(200).json({
        status: true,
        message: "Logout Successfully"
    });
});

module.exports = router;
