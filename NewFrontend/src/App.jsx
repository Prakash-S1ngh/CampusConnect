import './App.css';
import React from 'react';
import LandingPage from './Authorization/LandingPage';
import { Routes , Route } from 'react-router-dom';
import Signup from './Authorization/Signup';
import StudentDashboard from './components/Home/StudentDashboard';
import LoginPage from './Authorization/LoginPage';
import  { StudentContextProvider } from './components/Student/StudentContextProvider';

function App() {
  return (
    <div className="App">
    <StudentContextProvider>
     <Routes>
      <Route path='/' element={<LandingPage/>}></Route>
      <Route path='/DashBoard' element={<StudentDashboard/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/Login' element={<LoginPage/>}></Route>
     </Routes>
   
     </StudentContextProvider>
     

    </div>
  );
}

export default App;

