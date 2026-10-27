require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
// const { data } = require("react-router-dom");
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";
const app = express();
const port = Number(process.env.PORT || 8000);
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));
const db = mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "templogin"
});

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
// Authentication Middleware
function verifyToken(req, res, next) {
    const token = req.cookies.Token;

    if (!token) {
        return res.status(401).json({
            status: false,
            message: "Please Login First"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Store authenticated user details in req.user
        req.user = decoded;

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
app.post("/register",async(req,res)=>{
    let {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.status(400).json({
            status:false,
            message:"All Fields Are Required"
        })
    }
    let checkemil='select id from register where email=?';
    db.query(checkemil,[email],async(err,result)=>{
        if(err){
            return res.status(400).json({
                status:false,
                message:"Failed To Check The Email"
            })
        }
        if(result.length>0){
            return res.status(409).json({
                status:false,
                message:"Email Already Exists"
            })
        }
        try{
            let hashpassword=await bcrypt.hash(password,10);
            let mysql="insert into register(name,email,password,role) values(?,?,?,'student')";
            db.query(mysql,[name,email,hashpassword],(err,result)=>{
                if(err){
                    return res.status(405).json({
                        status:false,
                        message:"Registeration Failed"
                    })
                }
                else{
                    return res.status(201).json({
                        status:true,
                        message:"Registration Successfully Done"
                    })
                }
            })
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                status:false,
                message:"Error Occurs in Internal Server"
            })
        }
    })
})
app.post("/login",async(req,res)=>{
    let {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({
            status:false,
            message:"All Fields Are required"
        })
    }
    let checkemail='select id,name,email,password,role from register where email=?';
    db.query(checkemail,[email],async(err,result)=>{
        if(err){
            return res.status(400).json({
                status:false,
                message:"Failed To Check The Email"
            })
        }
        if(result.length===0){
            return res.status(400).json({
                status:false,
                message:"Email Not Found"
            })
        }
        let user=result[0];
        try{
            let checkpassword=await bcrypt.compare(password,user.password);
            if(!checkpassword){
                return res.status(400).json({
                    status:false,
                    message:"Failed To Login Please Check It"
                })
            }
            else{
                let token=jwt.sign({
                        id:user.id,
                        name:user.name,
                        email:user.email,
                        role:user.role
                    },
                    JWT_SECRET,
                    {
                        expiresIn:"1h"
                    }
                )
                // res.cookie("Token", token, {
                //     httpOnly: true,
                //     secure: false, // Use true with HTTPS in production
                //     sameSite: "lax",
                //     maxAge: 60 * 60 * 1000,
                //     path: "/"
                // });
                res.cookie("Token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 1000,
                    path: "/"
                });
                return res.status(200).json({
                    status:true,
                    message:"Login Successfully Done",
                    data:{
                        id:user.id,
                        email:user.email,
                        name:user.name,
                        role:user.role
                    }
                })
            }
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                status:false,
                message:"Server Internal Error Please Check It"
            })
        }
    })
})
app.get("/api/students",verifyToken,requireRole("faculty"),(req,res)=>{
    let sql='select * from students order by id asc';
    db.query(sql,(err,result)=>{
        if(err)
        {
            return res.status(400).json({
                status:false,
                message:"Student Data Not Fatched",
            })
        }
        else{
            return res.status(200).json({
                status:true,
                message:"Student Data Fetched Successfully",
                data:result
            })
        }
    })
})

// 2. POST - Add Student
app.post('/api/students',verifyToken,requireRole("faculty"),(req,res)=>{
    let {name,email,course}=req.body;
    if(!name || !email || !course){
        return res.status(400).json({
            status:false,
            message:"All Fields Are Required"
        })
    }
    let sql='insert into students(name,email,course) value(?,?,?)';
    db.query(sql,[name,email,course],(err,result)=>{
        if(err){
            return res.status(400).json({
                status:false,
                message:"Failed To Add The Students"
            })
        }
        else{
            return res.status(200).json({
                status:true,
                message:"Student Added Successfully",
                studentId:result.insertId
            })
        }
    })
})

// 3. PUT - Update Student
app.put('/api/students/:id',verifyToken,requireRole("faculty"),(req,res)=>{
    let {id}=req.params;
    let {name,email,course}=req.body;
    if(!name || !email || !course){
        return res.status(500).json({
            status:false,
            message:"all fields are required"
        })
    }
    let sql='select id from students where id=?';
    db.query(sql,[id],(err,result)=>{
        if(err)
        {
            return res.status(400).json({
                status:false,
                message:"Failed To Check the Student Details"
            })
        }
        if(result.length===0)
        {
            return res.status(400).json({
                status:false,
                message:"Student Details Not Found"
            })
        }
        let mysql='update students set name=?,email=?,course=? where id=?';
        db.query(mysql,[name,email,course,id],(err,result)=>{
            if(err){
                return res.status(400).json({
                    status:false,
                    message:"Failed To Update The Student Details"
                })
            }
            else{
                return res.status(200).json({
                    status:true,
                    message:"Student Updated Successfully Done"
                })
            }
        })
    })
})

// 4. DELETE - Delete Student
app.delete('/api/students/:id',verifyToken,requireRole("faculty"),(req,res)=>{
    let {id}=req.params;
    let checksql='select id from students where id=?';
    db.query(checksql,[id],(err,result)=>{
        if(err){
            return res.status(400).json({
                status:false,
                message:"Failed To Check The Student"
            })
        }
        if(result.length===0)
        {
            return res.status(400).json({
                status:false,
                message:"Student Details Not Found"
            })
        }
        let deletesql= 'delete from students where id=?';
        db.query(deletesql,[id],(err,result)=>{
            if(err)
            {
                return res.status(400).json({
                    status:false,
                    message:"Failed To Delete The Student"
                })
            }
            else{
                return res.status(200).json({
                    status:true,
                    message:"Student Data Deleted Successfully"
                }
                )
            }
        })
    })
})
// Protected Dashboard API
app.get("/api/dashboard", verifyToken, (req, res) => {
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
// Logout API
app.post("/logout", (req, res) => {
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