import React, { useContext, useState, useEffect } from 'react';
import { 
    Home, 
    Users, 
    User, 
    Award, 
    MessageSquare, 
    Bell, 
    Search, 
    Menu, 
    X,
    GraduationCap,
    BookOpen,
    UserCheck,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentContext } from '../Student/StudentContextProvider';
import Feed from './Feed';
import ChatApp from '../Text/ChatApp';
import BountyBoard from '../Bounty/BountyBoard';
import Team from './Team';
import UserList from './UserList';

import axios from 'axios';
import { url } from '../../lib/PostUrl';
import { toast } from 'react-hot-toast';

const FacultyDashboard = () => {
    const { user, logout, activeTab, setActiveTab } = useContext(StudentContext);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Faculty-specific data
    const [peers, setPeers] = useState([]);
    const [alumni, setAlumni] = useState([]);
    const [students, setStudents] = useState([]);
    const [bounties, setBounties] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch faculty-specific data
                await Promise.all([
                    fetchPeers(),
                    fetchAlumni(),
                    fetchStudents(),
                    fetchBounties(),
                    fetchPosts()
                ]);
            } catch (error) {
                console.error('Error fetching faculty data:', error);
                toast.error('Failed to load faculty data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchPeers = async () => {
        try {
            const response = await axios.get(`${url}/faculty/v2/getFaculty`, {
                withCredentials: true
            });
            setPeers(response.data.faculty || []);
        } catch (error) {
            console.error('Error fetching peers:', error);
        }
    };

    const fetchAlumni = async () => {
        try {
            const response = await axios.get(`${url}/faculty/v2/getAlumni`, {
                withCredentials: true
            });
            setAlumni(response.data.alumni || []);
        } catch (error) {
            console.error('Error fetching alumni:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`${url}/faculty/v2/getStudents`, {
                withCredentials: true
            });
            setStudents(response.data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchBounties = async () => {
        try {
            const response = await axios.get(`${url}/bounty/v2/getBounties`, {
                withCredentials: true
            });
            setBounties(response.data.bounties || []);
        } catch (error) {
            console.error('Error fetching bounties:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${url}/feed/v2/getPost`, {
                withCredentials: true
            });
            setPosts(response.data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleBellClick = async () => {
        try {
            const response = await axios.get(`${url}/student/v2/getNotifications`, {
                withCredentials: true
            });
            setNotifications(response.data.notifications || []);
            setShowNotifications(true);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post(`${url}/student/v2/markAllRead`, {}, {
                withCredentials: true
            });
            setNotifications([]);
            setShowNotifications(false);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    };

    const logoutHandler = () => {
        logout();
        navigate('/Login');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3">Loading Faculty Dashboard...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen flex justify-center items-center text-red-500">
                Error: User data not found
            </div>
        );
    }

    if (user.role !== 'Faculty') {
        return (
            <div className="h-screen flex justify-center items-center text-red-500">
                Access denied. Only faculty can access this dashboard.
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - hidden on mobile */}
            <div className="hidden md:flex md:flex-col md:w-64 bg-indigo-700 text-white">
                <div className="p-4 flex items-center space-x-2">
                    <div className="bg-white text-indigo-700 rounded-full p-2">
                        <GraduationCap size={20} />
                    </div>
                    <span className="text-xl font-bold">Faculty Portal</span>
                </div>

                <div className="p-4">
                    <div className="flex items-center space-x-3 mb-6">
                        <img
                            src={user.profileImage}
                            alt="Profile"
                            className="w-10 h-10 rounded-full cursor-pointer"
                            onClick={() => navigate('/profile')}
                        />
                        <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-xs text-indigo-200">Faculty</div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'feed' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                            }`}
                        >
                            <Home size={20} />
                            <span>Feed</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('peers')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'peers' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                            }`}
                        >
                            <Users size={20} />
                            <span>Peers</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('alumni')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'alumni' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                            }`}
                        >
                            <GraduationCap size={20} />
                            <span>Alumni</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('students')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'students' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                            }`}
                        >
                            <BookOpen size={20} />
                            <span>Students</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('bounty')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'bounty' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                            }`}
                        >
                            <Award size={20} />
                            <span>Bounties</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'team' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                            }`}
                        >
                            <UserCheck size={20} />
                            <span>Teams</span>
                        </button>


                    </nav>

                    <div className="mt-8 pt-4 border-t border-indigo-600">
                        <button
                            onClick={logoutHandler}
                            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-indigo-600"
                        >
                            <X size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {activeTab === 'feed' && 'Faculty Feed'}
                            {activeTab === 'peers' && 'Faculty Peers'}
                            {activeTab === 'alumni' && 'Alumni Network'}
                            {activeTab === 'students' && 'Student Directory'}
                            {activeTab === 'bounty' && 'Bounty Management'}
                            {activeTab === 'team' && 'Team Management'}
                            {activeTab === 'chat' && 'Faculty Chat'}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative w-1/3">
                            <input
                                type="text"
                                placeholder="Search Faculty Portal..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="relative" onClick={handleBellClick}>
                                <Bell size={24} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                            <div className="flex items-center space-x-2">
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    onClick={() => navigate('/profile')}
                                />
                                <span className="font-medium">{user.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 pt-16 md:pt-4">
                    {/* Feed Content */}
                    {activeTab === "feed" && <Feed user={user} posts={posts} />}
                    
                    {/* Peers Tab */}
                    {activeTab === "peers" && <ChatApp />}
                    
                    {/* Alumni Tab */}
                    {activeTab === "alumni" && <ChatApp />}
                    
                    {/* Students Tab */}
                    {activeTab === "students" && <ChatApp />}

                    {/* Bounties Tab */}
                    {activeTab === "bounty" && <BountyBoard />}
                    
                    {/* Team Tab */}
                    {activeTab === "team" && <Team />}
                    

                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
                    <div className="fixed left-0 top-0 h-full w-64 bg-indigo-700 text-white p-4">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-xl font-bold">Faculty Portal</span>
                            <button onClick={toggleMobileMenu}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <nav className="space-y-2">
                            <button
                                onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'feed' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                                }`}
                            >
                                <Home size={20} />
                                <span>Feed</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('peers'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'peers' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                                }`}
                            >
                                <Users size={20} />
                                <span>Peers</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('alumni'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'alumni' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                                }`}
                            >
                                <GraduationCap size={20} />
                                <span>Alumni</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'students' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                                }`}
                            >
                                <BookOpen size={20} />
                                <span>Students</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('bounty'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'bounty' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                                }`}
                            >
                                <Award size={20} />
                                <span>Bounties</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'team' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                                }`}
                            >
                                <UserCheck size={20} />
                                <span>Teams</span>
                            </button>


                        </nav>

                        <div className="mt-8 pt-4 border-t border-indigo-600">
                            <button
                                onClick={logoutHandler}
                                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-indigo-600"
                            >
                                <X size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard; 