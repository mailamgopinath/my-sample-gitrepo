import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
const API='http://localhost:8000/api/students';
function Student()
{
  let [student,setStudent]=useState({
    name:"",
    email:"",
    course:""
  });
  let [students,setStudents]=useState([]);
  let [editId,setEditId]=useState(null);
  let [inputError,setInputError]=useState({});
  let [message,setMessage]=useState("");
  let validate=()=>{
      const error = {};
      if (!student.name.trim()) {
          error.name = "Name is required";
      } else if (student.name.trim().length < 3) {
          error.name = "Name must contain at least 3 characters";
      }
      if (!student.email.trim()) {
          error.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email.trim())) {
          error.email = "Enter a valid email address";
      }
      if (!student.course.trim()) {
          error.course = "Course is required";
      } else if (student.course.trim().length < 3) {
          error.course = "Course must contain at least 6 characters";
      }
      setInputError(error);
      return Object.keys(error).length===0;
  }
  let fetchStudentData=async()=>{
    try{
      let response=await axios.get(API);
      console.log(response);
      setStudents(response.data.data);
    }
    catch(error){
      console.log(error);
      if(error.response && error.response.data && error.response.data.message)
      {
        setMessage(error.response.data.message);
      }
      else{
        setMessage(error.message);
      }
    }
  }
  useEffect(()=>{
    fetchStudentData();
  },[])
  let handleChange=(e)=>{
    let {name,value}=e.target;
    setStudent((preValue)=>{
      return (
        {
          ...preValue,[name]:value
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
      let response;
      if( editId !== id )
      {
        response= await axios.put(`${API}/${editId}`,student);
      }
      else{
        response=await axios.post(`${API}`,student);
      }
      setMessage(response.data.message);
      setInputError({});
      setStudent({
        name:"",
        email:"",
        course:""
      })
      setEditId(null);
      await fetchStudentData();
    }
    catch(error){
      console.log(error);
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
              <div>
                <h1>Student Master CRUD</h1>
              </div>
              <div>
                <form>
                    <div>
                      <label htmlFor="name">Student Name</label>
                      <input type="text" name='name' placeholder='Enter Student Name' value={student.name} onChange={handleChange}/>
                    </div>
                    <div>
                      <label htmlFor="email">Student Email</label>
                      <input type="email" name='email' placeholder='Enter Student Email' value={student.value} onChange={handleChange}/>
                    </div>
                </form>
              </div>
          </div>
      </div>
    </>
  )
}
export default Student;

// import axios from "axios";
// import React from "react";
// import {useState,useEffect} from 'react';
// const API='http://localhost:8000/api/students';
// function Student()
// {
//   let [student,setStudent]=useState({
//     name:"",
//     email:"",
//     course:""
//   })
//   let [students,setStudents]=useState([]);
//   let [inputError,setInputError]=useState({});
//   let [message,setMessage]=useState("");
//   let [editId,setEditId]=useState(null);
  // let validate=()=>{
  //    const error = {};
  //       if (!student.name.trim()) {
  //           error.name = "Name is required";
  //       } else if (student.name.trim().length < 3) {
  //           error.name = "Name must contain at least 3 characters";
  //       }
  //       if (!student.email.trim()) {
  //           error.email = "Email is required";
  //       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email.trim())) {
  //           error.email = "Enter a valid email address";
  //       }
  //       if (!student.course.trim()) {
  //           error.course = "Course is required";
  //       } else if (student.course.trim().length < 3) {
  //           error.course = "Course must contain at least 6 characters";
  //       }
  //       setInputError(error);
  //       return Object.keys(error).length===0;
  // }
//   let fetchStudent=async()=>{
//     try{
//       let response=await axios.get(API);
//       console.log(response);
//       setStudents(response.data.data);
//     }
//     catch(error){
//       console.log(error);
//       if(error.response && error.response.data && error.response.data.message)
//       {
//         setMessage(error.response.data.message);
//       }
//       else{
//         setMessage(error.message);
//       }
//     }
//   }
//   useEffect(()=>{
//     fetchStudent();
//   },[]);
//   let handleChange=(e)=>{
//     let {name,value}=e.target;
//     setStudent((preValue)=>{
//       return ({
//         ...preValue,[name]:value
//       })
//     })
//   }
//   let handleSubmit=async(e)=>{
//     e.preventDefault();
//     if(!validate())
//     {
//       return ;
//     }
//     try{
//       let response;
//       if(editId !== null)
//       {
//         response=await axios.put(`${API}/${editId}`,student);
//       }
//       else{
//         response=await axios.post(`${API}`,student);
//       }
//       setMessage(response.data.message);
//       setInputError({});
//       setStudent({
//         name:"",
//         email:"",
//         course:""
//       })
//       setEditId(null);
//       await fetchStudent();
//     }
//     catch(error){
//       console.log(error);
//       if(error.response && error.response.data && error.response.data.message){
//         setMessage(error.response.data.message);
//       }
//       else{
//         setMessage(error.message);
//       }
//     }
//   }
//   let handleEdit=(item)=>{
//     setStudent({
//       name:item.name,
//       email:item.email,
//       course:item.course
//     })
//     setEditId(item.id);
//     setMessage("");
//   }
//   let handleDelete=async(id)=>{
//     if(!window.confirm("Are U Sure Want To Delete The Student Details"))
//     {
//       return ;
//     }
//         try {
//       const response = await axios.delete(`${API}/${id}`);

//       setMessage(response.data.message);

//       if (editId === id) {
//         setEditId(null);
//         setStudent({
//           name: "",
//           email: "",
//           course: "",
//         });
//       }

//       await fetchStudent();
//     } catch (error) {
//       setMessage(
//         error.response?.data?.message || "Delete failed"
//       );
//     }
//   }
//   let handleCancel=()=>{
//     setEditId(null);
//     setStudent({
//       name:"",
//       email:"",
//       course:""
//     })
//     setMessage("");
//   }
//   return (
//     <>
//        <div>
//            <div>
//               <div>
//                 <h1>Student Master</h1>
//               </div>
//               <div>
//                 <form onSubmit={handleSubmit} noValidate>
//                    <div>
//                     <label htmlFor="name">Student Name</label>
//                     <input type="text" name="name" placeholder="Enter Student Name" value={student.name} onChange={handleChange}/>
//                    </div>
//                    <div>
//                     <label htmlFor="email">Student Email</label>
//                     <input type="email" name="email" placeholder="Enter Student Email" value={student.email} onChange={handleChange}/>
//                    </div>
//                    <div>
//                     <label htmlFor="course">Student Course</label>
//                     <input type="text" name="course" placeholder="Enter Student Course" value={student.course} onChange={handleChange}/>
//                    </div>
//                    {
//                     message && ( <h3 style={{color:"blue"}}>{message}</h3> )
//                    }
//                    <div>
//                     <button type="submit">
//                       {
//                         editId !== null ? 'Update Student' : 'Add Student'
//                       }
//                     </button>
//                     <button type="button">cancel</button>
//                    </div>
//                 </form>
//               </div>
//            </div>
//            <hr />
//            <div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>S NO</th>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Course</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {
//                   students.length===0 ? (
//                     <tr>
//                       <td>No Records Found</td>
//                     </tr>
//                   ) : (
//                     students.map((item)=>{
//                       return(
//                         <tr key={item.id}>
//                           <td>{item.id}</td>
//                           <td>{item.name}</td>
//                           <td>{item.email}</td>
//                           <td>{item.course}</td>
//                           <td>
//                             <button type="button" onClick={()=>{handleEdit(item)}}>Edit</button>
//                             <button type="button" onClick={()=>{handleDelete(item.id)}}>Delete</button>
//                           </td>
//                         </tr>
//                       )
//                     })
//                   )
//                 }
//               </tbody>
//             </table>
//            </div>
//        </div>
//     </>
//   )
// }
// export default Student;