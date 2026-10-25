// const express=require('express');
// const cors=require('cors');
// const mysql=require('mysql');
// const bcrypt=require('bcrypt');
// const jwt=require('jsonwebtoken');
// const jwtsecretkey='secretkey';
// const app=express();
// app.use(cors({origin:"*"}));
// app.use(express.json());
// app.use(express.urlencoded({
//     extended:true
// }))
// const db=mysql.createConnection({
//     host:'localhost',
//     password:"",
//     user:"root",
//     database:'templogin'
// })
// db.connect((err)=>{
//     if(err){
//         return console.log("DB Conection Failed",err);
//     }
//     else{
//         console.log("Data Base Connection Successfully");
//     }
// })
// app.use(8000,()=>{
//     console.log("The Server Is Running On PORT 8000");
// })