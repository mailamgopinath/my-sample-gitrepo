const express = require("express");
const db = require("../config/database");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken, requireRole("faculty"));
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure photo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            Date.now() + "-" +
            Math.round(Math.random() * 1e9) +
            extension;

        cb(null, uniqueName);
    }
});

// Allow only image files
const upload = multer({
    storage: storage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG and WebP images are allowed"));
        }
    }
});

// Helper: remove an uploaded file
function deletePhoto(filename) {
    if (!filename) return;

    const filePath = path.join(uploadDir, path.basename(filename));

    fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("Photo deletion failed:", err.message);
        }
    });
}

// Validate employee fields
function validateEmployee(req, res, requirePhoto = false) {
    const { name, email, mobile } = req.body;

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof mobile !== "string" ||
        !name.trim() ||
        !email.trim() ||
        !mobile.trim()
    ) {
        if (req.file) deletePhoto(req.file.filename);

        res.status(400).json({
            success: false,
            message: "Name, email and mobile are required"
        });

        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
        if (req.file) deletePhoto(req.file.filename);

        res.status(400).json({
            success: false,
            message: "Please enter a valid email address"
        });

        return false;
    }

    // Accept 10-digit Indian mobile numbers or numbers
    // beginning with + and containing 8-15 digits.
    const mobilePattern = /^(?:[6-9]\d{9}|\+[1-9]\d{7,14})$/;

    if (!mobilePattern.test(mobile.trim())) {
        if (req.file) deletePhoto(req.file.filename);

        res.status(400).json({
            success: false,
            message: "Enter a valid mobile number"
        });

        return false;
    }

    if (requirePhoto && !req.file) {
        res.status(400).json({
            success: false,
            message: "Employee photo is required"
        });

        return false;
    }

    return true;
}

// 1. CREATE EMPLOYEE
router.post("/", upload.single("photo"), (req, res) => {

    if (!validateEmployee(req, res, true)) {
        return;
    }

    const { name, email, mobile } = req.body;
    const photo = req.file.filename;

    const sql = `
        INSERT INTO employees (name, email, mobile, photo)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name.trim(), email.trim(), mobile.trim(), photo],
        (err, result) => {

            if (err) {
                deletePhoto(photo);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Email already exists"
                    });
                }

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to add employee"
                });
            }

            res.status(201).json({
                success: true,
                message: "Employee added successfully",
                id: result.insertId
            });
        }
    );
});

// 2. GET ALL EMPLOYEES
router.get("/", (req, res) => {

    const sql = `
        SELECT id, name, email, mobile, photo, created_at
        FROM employees
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch employees"
            });
        }

        res.json({
            success: true,
            data: result
        });
    });
});

// 3. GET SINGLE EMPLOYEE
router.get("/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid employee ID"
        });
    }

    db.query(
        "SELECT * FROM employees WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee"
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found"
                });
            }

            res.json({
                success: true,
                data: result[0]
            });
        }
    );
});

// 4. UPDATE EMPLOYEE
router.put("/:id", upload.single("photo"), (req, res) => {

    if (!validateEmployee(req, res)) {
        return;
    }

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        if (req.file) deletePhoto(req.file.filename);

        return res.status(400).json({
            success: false,
            message: "Invalid employee ID"
        });
    }

    const { name, email, mobile } = req.body;

    db.query(
        "SELECT * FROM employees WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                if (req.file) deletePhoto(req.file.filename);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee"
                });
            }

            if (result.length === 0) {
                if (req.file) deletePhoto(req.file.filename);

                return res.status(404).json({
                    success: false,
                    message: "Employee not found"
                });
            }

            const oldPhoto = result[0].photo;
            const newPhoto = req.file
                ? req.file.filename
                : oldPhoto;

            const sql = `
                UPDATE employees
                SET name = ?, email = ?, mobile = ?, photo = ?
                WHERE id = ?
            `;

            db.query(
                sql,
                [
                    name.trim(),
                    email.trim(),
                    mobile.trim(),
                    newPhoto,
                    id
                ],
                (updateErr) => {

                    if (updateErr) {
                        if (req.file) deletePhoto(newPhoto);

                        if (updateErr.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message: "Email already exists"
                            });
                        }

                        console.error(updateErr);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to update employee"
                        });
                    }

                    // Remove the previous photo only after
                    // the database update succeeds.
                    if (req.file && oldPhoto) {
                        deletePhoto(oldPhoto);
                    }

                    res.json({
                        success: true,
                        message: "Employee updated successfully"
                    });
                }
            );
        }
    );
});

// 5. DELETE EMPLOYEE
router.delete("/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid employee ID"
        });
    }

    db.query(
        "SELECT photo FROM employees WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee"
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found"
                });
            }

            const photo = result[0].photo;

            db.query(
                "DELETE FROM employees WHERE id = ?",
                [id],
                (deleteErr) => {

                    if (deleteErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Failed to delete employee"
                        });
                    }

                    if (photo) {
                        deletePhoto(photo);
                    }

                    res.json({
                        success: true,
                        message: "Employee deleted successfully"
                    });
                }
            );
        }
    );
});

// Handle upload errors
router.use((err, req, res, next) => {

    if (req.file) {
        deletePhoto(req.file.filename);
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.code === "LIMIT_FILE_SIZE"
                ? "Photo must be smaller than 2 MB"
                : "Photo upload failed"
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "Request failed"
        });
    }

    next();
});
module.exports = router;
