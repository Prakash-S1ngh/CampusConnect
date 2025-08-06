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
import DirectorLogin from './Authorization/DirectorLogin';
import DirectorPanel from './components/Director/DirectorPanel';
import DirectorProfile from './components/Profile/DirectorProfile';
import DirectorTest from './components/Director/DirectorTest';
import FacultyDashboard from './components/Home/FacultyDashboard';
import AlumniDashboard from './components/Home/AlumniDashboard';
import PublicProfile from './components/Profile/PublicProfile';
import TeamPanel from './components/Home/TeamPanel';

function App() {
  const { user } = useContext(StudentContext);
  return (
    <div className="App">

      <Toaster position="top-right" />
      <StudentContextProvider>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='/DashBoard' element={<StudentDashboard />}></Route>
          <Route path='/faculty-dashboard' element={<FacultyDashboard />}></Route>
          <Route path='/alumni-dashboard' element={<AlumniDashboard />}></Route>
          <Route path='/profile/:userId' element={<PublicProfile />}></Route>
          <Route path='/team-panel' element={<TeamPanel />}></Route>
          <Route path='/signup' element={<Signup />}></Route>
          <Route path='/Login' element={<LoginPage />}></Route>
          <Route path='/director-login' element={<DirectorLogin />}></Route>
          <Route path='/director-panel' element={<DirectorPanel />}></Route>
          <Route path='/director-test' element={<DirectorTest />}></Route>
          <Route path='/call' element={<VideoCall />}></Route>
          <Route
            path='/profile'
            element={
              user?.role === 'Alumni' ? (
                <AlumniProfile />
              ) : user?.role === 'Faculty' ? (
                <FacultyProfile />
              ) : user?.role === 'Director' ? (
                <DirectorProfile />
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

