import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
function Register()
{
    let [value,setValue]=useState({
        name:"",
        email:"",
        password:""
    })
    let [message,setMessage]=useState("");
    let [inputError,setInputError]=useState({});
    let navigate=useNavigate();
    function validate()
    {
        let error={};
        if(!value.name.trim())
        {
            error.name="Name Field Is Required";
        }
        else if(value.name.trim().length<3)
        {
            error.name="Name FieldMust Contain Above 3 Characters";
        }
        if(!value.email.trim()){
            error.email="Email Field Is Required";
        }
        if(!value.password.trim())
        {
            error.password="Password Field Is Required";
        }
        else if(value.password.trim().length<6)
        {
            error.password="Password Field Must Contain 6 Characters"
        }
        setInputError(error);
        return Object.keys(error).length===0;
    }
    let handleChange=(e)=>{
        let {name,value}=e.target;
        setValue((preValue)=>{
            return (
                {
                    ...preValue,
                    [name]:value
                }
            )
        })
    }
    let handleSubmit=async(e)=>{
        e.preventDefault();
        if(!validate())
        {
            return ;
        }
        try{
            let response=await axios.post("http://localhost:8000/register",value);
            if(response.data.message)
            {
                setMessage(response.data.message);
                setInputError({});
                setValue({
                    name:"",
                    email:"",
                    password:""
                })
                setTimeout(()=>{
                    navigate("/")
                },2000)
            }
        }
        catch(error)
        {
            if(error.response && error.response.data && error.response.data.message)
            {
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
                    <h1>Registration Page</h1>
                </div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name">User Name</label>
                            <input type="text" name='name' placeholder='Enter User Name' value={value.name} onChange={handleChange}/>
                            { inputError.name && ( <p style={{color:"red"}}>{inputError.name}</p> ) }
                        </div>
                        <div>
                            <label htmlFor="email">User Email</label>
                            <input type="email" name='email' placeholder='Enter User Email' value={value.email} onChange={handleChange}/>
                            { inputError.email && ( <p style={{color:"red"}}>{inputError.email}</p> ) }
                        </div>
                        <div>
                            <label htmlFor="password">User Password</label>
                            <input type="password" name='password' placeholder='Enter User Password' value={value.password} onChange={handleChange}/>
                            { inputError.email && ( <p style={{color:"red"}}>{inputError.email}</p> ) }
                        </div>
                        {
                            message && (
                                <h3 style={{color:"blue"}}>{message}</h3>
                            )
                        }
                        <div>
                            <button type='submit'>Register Now</button>
                        </div>
                    </form>
                    <div>
                        <button><Link to="/">If U Have Account Please Login</Link></button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Register;