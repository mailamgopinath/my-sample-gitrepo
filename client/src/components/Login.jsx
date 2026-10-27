import axios from "axios";
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function Login()
{
    let [loginvalue,setLoginValue]=useState({
        email:"",
        password:""
    })
    let navigate=useNavigate();
    let [inputError,setInputError]=useState({});
    let [message,setMessage]=useState("");
    let validate=()=>{
        let error={};
        if(!loginvalue.email.trim()){
            error.email="Email Field is required"
        }
        if(!loginvalue.password.trim()){
            error.password="Password field Is Required"
        }
        else if(loginvalue.password.length<6){
            error.password="Password Field Must Contain 6 Characters"
        }
        setInputError(error);
        return Object.keys(error).length===0;
    }
    let handleChange=(e)=>{
        let {name,value}=e.target;
        setLoginValue((preValue)=>{
            return ({
                ...preValue,[name]:value
            })
        })
    }
    let handleSubmit=async(e)=>{
        e.preventDefault();
        if(!validate()){
            return ;
        }
        try{
            let response=await axios.post('http://localhost:8000/login',loginvalue,{
                withCredentials:true
            });
            console.log(response);
            if(response){
                setMessage(response.data.message);
                setInputError({});
                setLoginValue({
                    email:"",
                    password:""
                })
                 navigate("/dashboard", {
                    replace: true
                });
            }
        }
        catch(error){
            console.log(error);
            if(error.response && error.response.data && error.response.data.message){
                setMessage(error.response.data.message);
            }
            else{
                setMessage(error.message);
            }
        }
    }
    return (
        <>
          <div>
                <div>
                    <h1>Login Page</h1>
                </div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email">User Email</label>
                            <input type="email" name="email" placeholder="Enter User Email" value={loginvalue.email} onChange={handleChange}/>
                            {inputError.email && ( <h3>{inputError.email}</h3> )}
                        </div>
                        <div>
                            <label htmlFor="password">User Password</label>
                            <input type="password" name="password" placeholder="Enter User password" value={loginvalue.password} onChange={handleChange}/>
                            {inputError.password && ( <h3>{inputError.password}</h3> )}
                        </div>
                        {
                            message && ( <h2>{message}</h2> )
                        }
                        <div>
                            <button type="submit">Login Now</button>
                        </div>
                    </form>
                    <div>
                        <button><Link to='/register'>If U Have No Account Please Register Now</Link></button>
                    </div>
                </div>
          </div>
        </>
    )
}
export default Login;