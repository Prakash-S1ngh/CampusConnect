import './App.css';
import React, { useContext } from 'react';
import LandingPage from './Authorization/LandingPage';
import { Routes, Route } from 'react-router-dom';
import Signup from './Authorization/Signup';
import StudentDashboard from './components/Home/StudentDashboard';
import LoginPage from './Authorization/LoginPage';
import { StudentContextProvider } from './components/Student/StudentContextProvider';
import VideoCall from './components/Text/VideoCall';
import UserProfile from './components/Profile/UserProfile';
import BountyBoard from './components/Bounty/BountyBoard';
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast';
import { StudentContext } from './components/Student/StudentContextProvider';
import AlumniProfile from './components/Profile/AlumniProfile';
import FacultyProfile from './components/Profile/FacultyProfile';

function App() {
  const { user } = useContext(StudentContext);
  return (
    <div className="App">

      <Toaster position="top-right" />
      <StudentContextProvider>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='/DashBoard' element={<StudentDashboard />}></Route>
          <Route path='/signup' element={<Signup />}></Route>
          <Route path='/Login' element={<LoginPage />}></Route>
          <Route path='/call' element={<VideoCall />}></Route>
          <Route
            path='/profile'
            element={
              user?.role === 'Alumni' ? (
                <AlumniProfile />
              ) : user?.role === 'Faculty' ? (
                <FacultyProfile />
              ) : (
                <UserProfile />
              )
            }
          />
          <Route path='/bounty' element={<BountyBoard />}></Route>


        </Routes>

      </StudentContextProvider>


    </div>
  );
}

export default App;

