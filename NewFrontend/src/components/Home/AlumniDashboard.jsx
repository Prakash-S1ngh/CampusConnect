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
    TrendingUp,
    Building
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

const AlumniDashboard = () => {
    const { user, logout } = useContext(StudentContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('feed');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Alumni-specific data
    const [connections, setConnections] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [juniors, setJuniors] = useState([]);
    const [bounties, setBounties] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch alumni-specific data
                await Promise.all([
                    fetchConnections(),
                    fetchFaculty(),
                    fetchJuniors(),
                    fetchBounties(),
                    fetchPosts(),
                    fetchAnalytics()
                ]);
            } catch (error) {
                console.error('Error fetching alumni data:', error);
                toast.error('Failed to load alumni data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchConnections = async () => {
        try {
            const response = await axios.get(`${url}/alumni/v2/connections`, {
                withCredentials: true
            });
            setConnections(response.data.users || []);
        } catch (error) {
            console.error('Error fetching connections:', error);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await axios.get(`${url}/alumni/v2/faculty`, {
                withCredentials: true
            });
            setFaculty(response.data.faculty || []);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    const fetchJuniors = async () => {
        try {
            const response = await axios.get(`${url}/alumni/v2/juniors`, {
                withCredentials: true
            });
            setJuniors(response.data.students || []);
        } catch (error) {
            console.error('Error fetching juniors:', error);
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

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${url}/alumni/v2/analytics`, {
                withCredentials: true
            });
            setAnalytics(response.data.analytics || null);
        } catch (error) {
            console.error('Error fetching analytics:', error);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading Alumni Dashboard...</span>
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

    if (user.role !== 'Alumni') {
        return (
            <div className="h-screen flex justify-center items-center text-red-500">
                Access denied. Only alumni can access this dashboard.
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - hidden on mobile */}
            <div className="hidden md:flex md:flex-col md:w-64 bg-blue-700 text-white">
                <div className="p-4 flex items-center space-x-2">
                    <div className="bg-white text-blue-700 rounded-full p-2">
                        <GraduationCap size={20} />
                    </div>
                    <span className="text-xl font-bold">Alumni Portal</span>
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
                            <div className="text-xs text-blue-200">Alumni</div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'feed' ? 'bg-blue-800' : 'hover:bg-blue-600'
                            }`}
                        >
                            <Home size={20} />
                            <span>Feed</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('connections')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'connections' ? 'bg-blue-800' : 'hover:bg-blue-600'
                            }`}
                        >
                            <Users size={20} />
                            <span>Connections</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('faculty')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'faculty' ? 'bg-blue-800' : 'hover:bg-blue-600'
                            }`}
                        >
                            <Building size={20} />
                            <span>Faculty</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('juniors')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'juniors' ? 'bg-blue-800' : 'hover:bg-blue-600'
                            }`}
                        >
                            <BookOpen size={20} />
                            <span>Juniors</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('bounty')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'bounty' ? 'bg-blue-800' : 'hover:bg-blue-600'
                            }`}
                        >
                            <Award size={20} />
                            <span>Bounties</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                activeTab === 'team' ? 'bg-blue-800' : 'hover:bg-blue-600'
                            }`}
                        >
                            <UserCheck size={20} />
                            <span>Teams</span>
                        </button>
                    </nav>

                    <div className="mt-8 pt-4 border-t border-blue-600">
                        <button
                            onClick={logoutHandler}
                            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-blue-600"
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
                            {activeTab === 'feed' && 'Alumni Feed'}
                            {activeTab === 'connections' && 'Alumni Connections'}
                            {activeTab === 'faculty' && 'Faculty Network'}
                            {activeTab === 'juniors' && 'Junior Students'}
                            {activeTab === 'bounty' && 'Bounty Opportunities'}
                            {activeTab === 'team' && 'Team Management'}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative w-1/3">
                            <input
                                type="text"
                                placeholder="Search Alumni Portal..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    
                    {/* Connections Tab */}
                    {activeTab === "connections" && (
                        <UserList 
                            users={connections} 
                            title="Alumni Connections" 
                            userType="connections"
                            emptyMessage="No connections found"
                        />
                    )}
                    
                    {/* Faculty Tab */}
                    {activeTab === "faculty" && (
                        <UserList 
                            users={faculty} 
                            title="Faculty Network" 
                            userType="faculty"
                            emptyMessage="No faculty found"
                        />
                    )}
                    
                    {/* Juniors Tab */}
                    {activeTab === "juniors" && (
                        <UserList 
                            users={juniors} 
                            title="Junior Students" 
                            userType="students"
                            emptyMessage="No junior students found"
                        />
                    )}

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
                    <div className="fixed left-0 top-0 h-full w-64 bg-blue-700 text-white p-4">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-xl font-bold">Alumni Portal</span>
                            <button onClick={toggleMobileMenu}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <nav className="space-y-2">
                            <button
                                onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'feed' ? 'bg-blue-800' : 'hover:bg-blue-600'
                                }`}
                            >
                                <Home size={20} />
                                <span>Feed</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('connections'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'connections' ? 'bg-blue-800' : 'hover:bg-blue-600'
                                }`}
                            >
                                <Users size={20} />
                                <span>Connections</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('faculty'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'faculty' ? 'bg-blue-800' : 'hover:bg-blue-600'
                                }`}
                            >
                                <Building size={20} />
                                <span>Faculty</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('juniors'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'juniors' ? 'bg-blue-800' : 'hover:bg-blue-600'
                                }`}
                            >
                                <BookOpen size={20} />
                                <span>Juniors</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('bounty'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'bounty' ? 'bg-blue-800' : 'hover:bg-blue-600'
                                }`}
                            >
                                <Award size={20} />
                                <span>Bounties</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); }}
                                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                                    activeTab === 'team' ? 'bg-blue-800' : 'hover:bg-blue-600'
                                }`}
                            >
                                <UserCheck size={20} />
                                <span>Teams</span>
                            </button>
                        </nav>

                        <div className="mt-8 pt-4 border-t border-blue-600">
                            <button
                                onClick={logoutHandler}
                                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-blue-600"
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

export default AlumniDashboard; 