import './App.css';
import React from 'react';
import LandingPage from './Authorization/LandingPage';
import { Routes , Route } from 'react-router-dom';
import Signup from './Authorization/Signup';
import StudentDashboard from './components/Home/StudentDashboard';
import LoginPage from './Authorization/LoginPage';
import  { StudentContextProvider } from './components/Student/StudentContextProvider';
import VideoCall from './components/Text/VideoCall';
import UserProfile from './components/Profile/UserProfile';
import BountyBoard from './components/Bounty/BountyBoard';

function App() {
  return (
    <div className="App">
    <StudentContextProvider>
     <Routes>
      <Route path='/' element={<LandingPage/>}></Route>
      <Route path='/DashBoard' element={<StudentDashboard/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/Login' element={<LoginPage/>}></Route>
      <Route path='/call' element={<VideoCall/>}></Route>
      <Route path='/profile' element={<UserProfile/>}></Route>
      <Route path='/bounty' element={<BountyBoard/>}></Route>
      
     </Routes>
   
     </StudentContextProvider>
     

    </div>
  );
}

export default App;

