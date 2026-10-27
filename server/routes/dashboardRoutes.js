const express = require("express");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
    return res.status(200).json({
        status: true,
        message: "Welcome to Dashboard",
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;
