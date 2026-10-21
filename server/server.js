const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mySecretKey";
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "templogin"
});

db.connect((err) => {

    if (err) {
        console.log("Database connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully");

});
app.post("/register",async(req,res)=>{
    let {name,email,password}=req.body;
    if(!name || !email || !password)
    {
        return res.status(400).json({
            statusL:false,
            message:"All Fields Are Required"
        })
    }
    let checkmail='select id from register where email=?';
    db.query(checkmail,[email],async(err,result)=>{
        
        if(err)
        {
            //console.log(err);
            
            return res.status(400).json({
                status:false,
                message:"Failed To Check The Mail"
            })
        }
        else if(result.length>0)
        {
            return res.status(400).json({
                status:false,
                message:"Email Already Exists"
            })
        }
        try{
            let hashpassword=await bcrypt.hash(password,10);
            let sql='insert into register(name,email,password) values(?,?,?)';
            db.query(sql,[name,email,hashpassword],(err,result)=>{
                if(err)
                {
                    return res.status(400).json({
                        status:false,
                        message:"Registration Failed Done"
                    })
                }
                else{
                    return res.status(200).json({
                        status:true,
                        message:"Registration Successfully Completed And Done"
                    })
                }
            })
        }
        catch(error)
        {
            // console.log(error);
            return res.status(400).json({
                status:false,
                message:"An Error Occurs During Registration "
            })
        }
    })
})
app.listen(8000, () => {

    console.log(
        "Server running on http://localhost:8000"
    );

});