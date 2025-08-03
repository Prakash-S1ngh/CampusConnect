import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../lib/PostUrl';
import { FaSpinner } from 'react-icons/fa';
import { StudentContext } from '../components/Student/StudentContextProvider';
import { Shield, Building, Users, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DirectorLogin = () => {
  const { setUser, loading } = useContext(StudentContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${url}/director/v2/login`, { email, password }, {
        withCredentials: true,
      });

      console.log("Director Login Response:", response);

      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Director login successful! Redirecting to panel...');
        setTimeout(() => navigate('/director-panel'));
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error("Director Login Error:", error);
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Director Portal</h1>
          <p className="text-white/70">Access your campus management dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="director@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Access Director Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-white/70 text-sm">Don't have a director account? </span>
            <Link to='/signup' className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors">
              Contact Administration
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
            <Users className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white/80 text-sm">User Management</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
            <BarChart3 className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white/80 text-sm">Analytics</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
            <Building className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white/80 text-sm">Campus Control</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
            <Shield className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white/80 text-sm">Security</p>
          </div>
        </div>

        {/* Back to regular login */}
        <div className="mt-6 text-center">
          <Link to='/Login' className="text-white/60 hover:text-white text-sm transition-colors">
            ← Back to regular login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DirectorLogin; 