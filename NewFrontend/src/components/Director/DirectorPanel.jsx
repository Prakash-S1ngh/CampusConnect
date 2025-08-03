import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { StudentContext } from '../Student/StudentContextProvider';
import { url } from '../../lib/PostUrl';
import { useNavigate } from 'react-router-dom';

const DirectorPanel = () => {
    const { user, setUser, logout } = useContext(StudentContext);
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [campusStudents, setCampusStudents] = useState([]);
    const [campusAlumni, setCampusAlumni] = useState([]);
    const [campusFaculty, setCampusFaculty] = useState([]);
    const [campusUsers, setCampusUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [userManagementTab, setUserManagementTab] = useState('all');

    // Check if user is director
    useEffect(() => {
        console.log('DirectorPanel: User state:', user);
        if (!user) {
            console.log('DirectorPanel: No user, redirecting to login');
            navigate('/Login');
            return;
        }
        
        if (user.role !== 'Director') {
            console.log('DirectorPanel: User is not director, role:', user.role);
            toast.error('Access denied. Only directors can access this panel.');
            navigate('/DashBoard');
            return;
        }
        
        console.log('DirectorPanel: User is director, setting loading to false');
        setIsLoading(false);
    }, [user, navigate]);

    useEffect(() => {
        console.log('DirectorPanel: Fetching data for user:', user);
        if (user && user.role === 'Director') {
            console.log('DirectorPanel: Fetching all campus data');
            fetchConnections();
            fetchAnalytics();
            fetchCampusUsers();
            fetchCampusStudents();
            fetchCampusAlumni();
            fetchCampusFaculty();
        }
    }, [user]);

    const fetchConnections = async () => {
        try {
            const response = await axios.get(`${url}/director/v2/connections`, {
                withCredentials: true
            });
            setConnections(response.data.users);
        } catch (error) {
            console.error('Error fetching connections:', error);
            toast.error('Failed to fetch connections');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${url}/director/v2/analytics`, {
                withCredentials: true
            });
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to fetch analytics');
        }
    };

    const fetchCampusUsers = async () => {
        try {
            const response = await axios.get(`${url}/director/v2/campus-users`, {
                withCredentials: true
            });
            setCampusUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching campus users:', error);
            toast.error('Failed to fetch campus users');
        }
    };

    const removeUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to remove ${userName} from the campus?`)) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`${url}/director/v2/remove-user`, {
                withCredentials: true,
                data: { userId, reason: 'Removed by director' }
            });
            toast.success(`${userName} has been removed from the campus`);
            fetchCampusUsers(); // Refresh the list
        } catch (error) {
            console.error('Error removing user:', error);
            toast.error(error.response?.data?.message || 'Failed to remove user');
        } finally {
            setLoading(false);
        }
    };

    const sendCampusMessage = async () => {
        if (!message.trim() || selectedUsers.length === 0) {
            toast.error('Please select recipients and enter a message');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${url}/director/v2/send-campus-message`, {
                recipients: selectedUsers,
                message: message,
                messageType: 'text'
            }, {
                withCredentials: true
            });
            toast.success('Message sent successfully');
            setMessage('');
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const selectAllUsers = () => {
        setSelectedUsers(campusUsers.map(user => user._id));
    };

    const clearSelection = () => {
        setSelectedUsers([]);
    };

    const Dashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics?.totalStudents || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Faculty</h3>
                <p className="text-3xl font-bold text-green-600">{analytics?.totalFaculty || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Alumni</h3>
                <p className="text-3xl font-bold text-purple-600">{analytics?.totalAlumni || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Online Users</h3>
                <p className="text-3xl font-bold text-orange-600">{analytics?.onlineUsers || 0}</p>
            </div>
        </div>
    );

    const Connections = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Campus Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((user) => (
                    <div key={user.userId} className="border rounded-lg p-4 flex items-center space-x-3">
                        <img 
                            src={user.profileImage || '/default-avatar.png'} 
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const UserManagement = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Campus User Management</h2>
                <div className="space-x-2">
                    <button 
                        onClick={selectAllUsers}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Select All
                    </button>
                    <button 
                        onClick={clearSelection}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Clear
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Select</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campusUsers.map((user) => (
                            <tr key={user._id} className="border-b">
                                <td className="px-4 py-2">
                                    <input 
                                        type="checkbox"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => toggleUserSelection(user._id)}
                                        className="rounded"
                                    />
                                </td>
                                <td className="px-4 py-2 flex items-center space-x-2">
                                    <img 
                                        src={user.profileImage || '/default-avatar.png'} 
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span>{user.name}</span>
                                </td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2 capitalize">{user.role}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    {user.role !== 'Director' && (
                                        <button 
                                            onClick={() => removeUser(user._id, user.name)}
                                            disabled={loading}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const Messaging = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Send Campus Message</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Recipients: {selectedUsers.length}
                </label>
                <div className="flex space-x-2 mb-4">
                    <button 
                        onClick={selectAllUsers}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Select All Users
                    </button>
                    <button 
                        onClick={clearSelection}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Clear Selection
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                />
            </div>

            <button 
                onClick={sendCampusMessage}
                disabled={loading || !message.trim() || selectedUsers.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Sending...' : 'Send Message'}
            </button>
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Director Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Director Panel</h1>
                        <p className="text-gray-600 mt-2">Welcome, {user?.name}. Manage your campus and communicate with members</p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to logout?')) {
                                logout();
                                navigate('/Login');
                            }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium ${
                            activeTab === 'dashboard' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('connections')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium ${
                            activeTab === 'connections' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Connections
                    </button>
                    <button
                        onClick={() => setActiveTab('management')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium ${
                            activeTab === 'management' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('messaging')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium ${
                            activeTab === 'messaging' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Messaging
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'connections' && <Connections />}
                {activeTab === 'management' && <UserManagement />}
                {activeTab === 'messaging' && <Messaging />}
            </div>
        </div>
    );
};

export default DirectorPanel; 