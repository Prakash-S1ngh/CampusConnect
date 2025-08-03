import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../lib/PostUrl';
import { FaSpinner } from 'react-icons/fa';  
import { StudentContext } from '../components/Student/StudentContextProvider';

const LoginPage = () => {
  const { setUser, loading } = useContext(StudentContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try student login first (most common)
      let response;
      let loginSuccess = false;
      
      try {
        response = await axios.post(`${url}/student/v2/login`, { email, password }, {
          withCredentials: true,
        });
        loginSuccess = true;
      } catch (studentError) {
        console.log("Student login failed, trying other roles...");
        
        // Try director login
        try {
          response = await axios.post(`${url}/director/v2/login`, { email, password }, {
            withCredentials: true,
          });
          loginSuccess = true;
        } catch (directorError) {
          console.log("Director login failed, trying faculty...");
          
          // Try faculty login
          try {
            response = await axios.post(`${url}/faculty/v2/login`, { email, password }, {
              withCredentials: true,
            });
            loginSuccess = true;
          } catch (facultyError) {
            console.log("Faculty login failed, trying alumni...");
            
            // Try alumni login
            try {
              response = await axios.post(`${url}/alumni/v2/login`, { email, password }, {
                withCredentials: true,
              });
              loginSuccess = true;
            } catch (alumniError) {
              // All login attempts failed
              throw new Error("Invalid credentials for all user types");
            }
          }
        }
      }

      if (loginSuccess && response.data.success) {
        setUser(response.data.user);
        showToast('Login successful! Redirecting...', 'success');
        
        // Redirect based on user role
        const userRole = response.data.user.role;
        if (userRole === 'Director') {
          setTimeout(() => navigate('/director-panel'));
        } else {
          setTimeout(() => navigate('/DashBoard'));
        }
      } else {
        showToast('Invalid credentials. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Login Error:", error);
      showToast(error.message || 'Invalid credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });

    setTimeout(() => {
      setToast((prevToast) => ({ ...prevToast, visible: false }));
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Sign-In Button with Spinner */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
              {isLoading ? "Processing..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Don't have an account? </span>
            <Link to='/signup' className="text-blue-600 hover:text-blue-800 text-sm font-medium">Sign Up</Link>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-gray-500 text-sm">Are you a director? </span>
            <Link to='/director-login' className="text-purple-600 hover:text-purple-800 text-sm font-medium">Director Login</Link>
          </div>
        </div>
      </div>

      {/* Toaster Notification */}
      {toast.visible && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default LoginPage;