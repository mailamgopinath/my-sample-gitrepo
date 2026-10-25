require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";
const app = express();
const port = Number(process.env.PORT || 8000);

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

app.post('/register',async(req,res)=>{
    let {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.status(500).json({
            status:false,
            message:"All Fields Are Required"
        })
    }
    let checkemail='select id from register where email=?';
    db.query(checkemail,[email],async(err,result)=>{
        if(err){
            return res.status(400).json({
                status:false,
                message:"Failed To Check The Email"
            })
        }
        if(result.length>0){
            return res.status(400).json({
                status:false,
                message:"Email Already Exists"
            })
        }
        try{
            let hashpassword=await bcrypt.hash(password,10);
            let mysql='insert into register(name,email,password) value(?,?,?)';
            db.query(mysql,[name,email,hashpassword],(err,result)=>{
                if(err){
                    return res.status(404).json({
                        status:false,
                        message:"Registeration failed to done"
                    })
                }
                else{
                    return res.status(200).json({
                        status:true,
                        message:"Registeration DOne Successfully"
                    })
                }
            })
        }
        catch(error){
            console.log(error);
            return res.status(400).json({
                status:false,
                message:"Internal Problem Please Check It Once"
            })
        }
    })
})
app.post('/login',async(req,res)=>{
    let {email,password}=req.body;
    if(!email || !password)
    {
        return res.status(400).json({
            statue:false,
            message:"All Fields Are Required"
        })
    }
    let checkemail='select id,name,email,password from register where email=?';
    db.query(checkemail,[email],async(err,result)=>{
        if(err){
            return res.status(400).json({
                status:false,
                message:"Check To Find The Email"
            })
        }
        if(result.length===0){
            return res.status.json({
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
                    message:"Invalid Email Are Password"
                })
            }
            else{
                const token =jwt.sign({
                        id:user.id,
                        name:user.name,
                        email:user.email
                    },
                    JWT_SECRET,
                    {
                        expiresIn:'1h'
                    }
                )
                return res.status(200).json({
                    status:true,
                    message:"Login Successfully Done",
                    token:token,
                    user:{
                        id:user.id,
                        email:user.email
                    }
                })
            }
        }
        catch(error){
            console.log(error);
            return res.status(400).json({
                status:false,
                message:"Internal Server Error"
            })
        }
    })
})
app.get("/api/students",(req,res)=>{
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
app.post('/api/students',(req,res)=>{
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
app.put('/api/students/:id',(req,res)=>{
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
app.delete('/api/students/:id',(req,res)=>{
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