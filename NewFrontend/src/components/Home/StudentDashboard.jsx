import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';  // ✅ Import axios

import {
  Bell,
  MessageSquare,
  User,
  Users,
  Search,
  Home,
  Bookmark,
  Mail,
  LogOut,
  Menu,
  X,
  Award,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { url } from '../../lib/PostUrl';
import { StudentContext } from '../Student/StudentContextProvider';
import { useNavigate } from 'react-router-dom';
import Mentors from './Mentors';
import Feed from './Feed';
import Messages from './Messages';
import Bookmarks from './Bookmarks';
import Inbox from './Inbox';
import ChatApp from '../Text/ChatApp';
import BountyBoard from '../Bounty/BountyBoard';
import Notification from '../Post/Notification';
import Team from './Team';

const StudentDashboard = () => {
  // const [activeTab, setActiveTab] = useState('feed');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab } = useContext(StudentContext);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const { user, loading, loggedIn, logout } = useContext(StudentContext); // ✅ Use global user state

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications on bell click
  const handleBellClick = async () => {
    try {
      const res = await axios.get(`${url}/notification`, { withCredentials: true });
      setNotifications(res.data.notifications);  // Adjust key as per response
      setShowNotifications(true);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${url}/notification/mark-all-read`, {}, { withCredentials: true });
      setNotifications([]);
      setShowNotifications(false);
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  // Sample posts data
  const logoutHandler = () => {
    logout();
    navigate("/Login");
  }
  const [bookmarks, setmarks] = useState([]);
  const posts = [
    {
      id: 1,
      author: "Sarah Miller",
      authorRole: "Biology Professor",
      avatar: "/api/placeholder/40/40",
      content: "Just posted my lecture notes on cellular respiration. Check them out on the Biology space!",
      likes: 24,
      comments: 8,
      time: "2h ago"
    },
    {
      id: 2,
      author: "James Wilson",
      authorRole: "Computer Science Student",
      avatar: "/api/placeholder/40/40",
      content: "Looking for study partners for the upcoming Algorithm exam. Anyone interested?",
      likes: 15,
      comments: 12,
      time: "4h ago"
    },
    {
      id: 3,
      author: "Campus Library",
      authorRole: "Official",
      avatar: "/api/placeholder/40/40",
      content: "Extended hours during finals week. We'll be open 24/7 starting next Monday!",
      likes: 56,
      comments: 3,
      time: "6h ago"
    }
  ];

  const [bounties, setBounties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${url}/student/v2/getTeams`, {
          withCredentials: true,
        });
        setBounties(res.data.participation); // if you're storing in state
        console.log("Bounty", res.data.participation);
      } catch (error) {
        console.error("Error fetching bounty:", error);
      }
    };

    fetchData();
  }, []);


  const CountdownClock = ({ deadline }) => {
    const calculateTimeLeft = () => {
      const diff = new Date(deadline).getTime() - new Date().getTime();
      const totalSeconds = Math.floor(diff / 1000);
      if (totalSeconds <= 0) return "⏰ Time's up!";
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const hours = Math.floor(totalSeconds / 3600);
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    return <span className="text-red-500 font-bold animate-pulse">⏳ {timeLeft}</span>;
  };

  const formatTimeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const sec = Math.floor(diff / 1000);
    if (sec < 0) return "Ended";

    const hrs = Math.floor(sec / 3600);
    const min = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${hrs}h ${min}m ${s}s`;
  };



  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  if (loading) {
    return <div className="h-screen flex justify-center items-center text-gray-500">Loading...</div>;
  }

  // ✅ Handle null user state
  if (!user) {
    return <div className="h-screen flex justify-center items-center text-red-500">Error: User data not found</div>;
  }
  if (showNotifications) {
    return <div> <Notification
      notifications={notifications}
      onClose={() => setShowNotifications(false)}
      onMarkAllRead={handleMarkAllRead}
    /></div>
  }
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-indigo-700 text-white">
        <div className="p-4 flex items-center space-x-2">
          <div className="bg-white text-indigo-700 rounded-full p-2">
            <MessageSquare size={20} />
          </div>
          <span className="text-xl font-bold">CampusConnect</span>
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
              <div className="text-xs text-indigo-200">{user.role}</div>
            </div>
          </div>

          {/* <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'feed' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <Home size={20} />
              <span>Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'friends' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <Users size={20} />
              <span>Friends</span>
            </button>

            <button
              onClick={() => setActiveTab(user.role === 'Alumni' ? 'juniors' : 'mentors')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === (user.role === 'alumni' ? 'juniors' : 'mentors') ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                }`}
            >
              <User size={20} />
              <span>{user.role === 'Alumni' ? 'Juniors' : 'Mentors'}</span>
            </button>

            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'faculty' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <Users size={20} />
              <span>Faculty</span>
            </button>


            <button
              onClick={() => setActiveTab('Bounties')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'Bounties' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <Award size={20} />
              <span>Bounties</span>
            </button>


            <button
              onClick={() => setActiveTab('Team')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'Team' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <UserCheck size={20} />
              <span>Teams</span>
            </button>
          </nav> */}

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'feed' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                }`}
            >
              <Home size={20} />
              <span>Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'friends' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                }`}
            >
              <Users size={20} />
              <span>Friends</span>
            </button>

            <button
              onClick={() =>
                setActiveTab(user.role === 'Alumni' ? 'juniors' : 'mentors')
              }
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === (user.role?.toLowerCase() === 'alumni' ? 'juniors' : 'mentors')
                  ? 'bg-indigo-800'
                  : 'hover:bg-indigo-600'
                }`}
            >
              <User size={20} />
              <span>{user.role?.toLowerCase() === 'alumni' ? 'Juniors' : 'Mentors'}</span>
            </button>

            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'faculty' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                }`}
            >
              <Users size={20} />
              <span>Faculty</span>
            </button>

            <button
              onClick={() => setActiveTab('Bounties')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'Bounties' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                }`}
            >
              <Award size={20} />
              <span>Bounties</span>
            </button>

            <button
              onClick={() => setActiveTab('Team')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'Team' ? 'bg-indigo-800' : 'hover:bg-indigo-600'
                }`}
            >
              <UserCheck size={20} />
              <span>Teams</span>
            </button>
          </nav>

        </div>

        <div className="mt-auto p-4">
          <button onClick={logoutHandler} className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-indigo-600">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white shadow-md p-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleMobileMenu} className="mr-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center">
            <div className="bg-indigo-700 text-white rounded-full p-1">
              <MessageSquare size={16} />
            </div>
            <span className="text-lg font-bold ml-1">CampusConnect</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative" onClick={handleBellClick}>
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 z-10 bg-white p-4">
          <div className="flex items-center space-x-3 mb-6">
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => navigate('/profile')}
            />
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
          </div>

          <nav className="space-y-4">
            <button
              onClick={() => {
                setActiveTab('feed');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <Home size={20} />
              <span>Feed</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('friends');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <Users size={20} />
              <span>Friends</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('faculty');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <Users size={20} />
              <span>Faculty </span>
            </button>

            <button
              onClick={() => setActiveTab(user.role === 'Alumni' ? 'juniors' : 'mentors')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === (user.role === 'Alumni' ? 'juniors' : 'mentors') ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <User size={20} />
              <span>{user.role === 'Alumni' ? 'Juniors' : 'Mentors'}</span>
            </button>


            <button
              onClick={() => {
                setActiveTab('Bounties');
                setMobileMenuOpen(false);

              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <span>Bounties</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('Team');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <span>Teams</span>
            </button>

            <button className="flex items-center space-x-3 w-full p-2 text-red-500">
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Hidden on mobile */}
        <div className="hidden md:flex justify-between items-center p-4 border-b">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search CampusConnect..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
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

        {/* Feed Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pt-16 md:pt-4">

          {/* Feed Content */}
          {activeTab === "feed" && <Feed user={user} posts={posts} />}
          {/* Friends Tab */}
          {activeTab === "friends" && <ChatApp />}
          {/* Faculty Tab */}
          {activeTab === "faculty" && <ChatApp />}

          {/* Mentors Tab */}
          {activeTab === "mentors" && <ChatApp />}
          {activeTab === "juniors" && <ChatApp />}


          {/* Bookmarks Tab */}
          {activeTab === "Bounties" && <BountyBoard />}
          {activeTab === "Team" && <Team />}
        </div>
      </div>


      <div className="hidden lg:block w-1/4 p-4 space-y-6 overflow-y-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-5 border-2 border-purple-700">
          <h2 className="text-xl font-extrabold text-white mb-4 border-b border-purple-500 pb-2">
            🎯 Current Bounty
          </h2>

          {bounties?.length > 0 ? (
            <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 hover:scale-[1.02] transition">
              <h3 className="text-2xl font-bold text-indigo-400 mb-2">
                {bounties[0].bounty.title}
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                {bounties[0].bounty.description}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                <span className="text-green-400 font-medium">
                  💰 ₹{bounties[0].bounty.amount}
                </span>
                <CountdownClock deadline={bounties[0].bounty.deadline} />
              </div>

              <div className="text-sm text-gray-300 mb-2">
                👨‍💻 Team: <span className="text-white font-semibold">{bounties[0].teamName}</span>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                {bounties[0].members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center text-center text-xs"
                  >
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border-2 border-purple-500 shadow"
                    />
                    <span className="text-white mt-1">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No active bounty available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;