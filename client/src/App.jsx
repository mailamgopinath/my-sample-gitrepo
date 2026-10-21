import React from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
function App() {

  return (
    <>
    <div>
      <h1>App Components</h1>
      <BrowserRouter>
         <Routes>
            <Route path='/' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
         </Routes>
      </BrowserRouter>
    </div>
    </>
  )
}

export default App;
