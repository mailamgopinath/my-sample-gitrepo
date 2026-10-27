const express = require("express");
const db = require("../config/database");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken, requireRole("faculty"));

router.get("/", (req, res) => {
    db.query("select * from students order by id asc", (err, result) => {
        if (err) {
            return res.status(400).json({
                status: false,
                message: "Student Data Not Fatched"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Student Data Fetched Successfully",
            data: result
        });
    });
});

router.post("/", (req, res) => {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
        return res.status(400).json({
            status: false,
            message: "All Fields Are Required"
        });
    }

    db.query(
        "insert into students(name,email,course) value(?,?,?)",
        [name, email, course],
        (err, result) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    message: "Failed To Add The Students"
                });
            }

            return res.status(200).json({
                status: true,
                message: "Student Added Successfully",
                studentId: result.insertId
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
        return res.status(500).json({
            status: false,
            message: "all fields are required"
        });
    }

    db.query("select id from students where id=?", [id], (err, result) => {
        if (err) {
            return res.status(400).json({
                status: false,
                message: "Failed To Check the Student Details"
            });
        }

        if (result.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Student Details Not Found"
            });
        }

        db.query(
            "update students set name=?,email=?,course=? where id=?",
            [name, email, course, id],
            (updateError) => {
                if (updateError) {
                    return res.status(400).json({
                        status: false,
                        message: "Failed To Update The Student Details"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "Student Updated Successfully Done"
                });
            }
        );
    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;

    db.query("select id from students where id=?", [id], (err, result) => {
        if (err) {
            return res.status(400).json({
                status: false,
                message: "Failed To Check The Student"
            });
        }

        if (result.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Student Details Not Found"
            });
        }

        db.query("delete from students where id=?", [id], (deleteError) => {
            if (deleteError) {
                return res.status(400).json({
                    status: false,
                    message: "Failed To Delete The Student"
                });
            }

            return res.status(200).json({
                status: true,
                message: "Student Data Deleted Successfully"
            });
        });
    });
});

module.exports = router;
