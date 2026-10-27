import React from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Student from './components/Student';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
function App() {

  return (
    <>
    <div>
      {/* <h1>App Components</h1> */}
      <BrowserRouter>
         <Routes>
            <Route path='/' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route element={<ProtectedRoute requiredRole="faculty" />}>
                <Route path="/student" element={<Student />} />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
            </Route>
         </Routes>
      </BrowserRouter>
    </div>
    </>
  )
}

export default App;
