const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";

function verifyToken(req, res, next) {
    const token = req.cookies.Token;

    if (!token) {
        return res.status(401).json({
            status: false,
            message: "Please Login First"
        });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        res.clearCookie("Token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return res.status(401).json({
            status: false,
            message: "Invalid or Expired Token. Please Login Again"
        });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({
                status: false,
                message: "You do not have permission to access this resource"
            });
        }

        next();
    };
}

module.exports = { verifyToken, requireRole };
