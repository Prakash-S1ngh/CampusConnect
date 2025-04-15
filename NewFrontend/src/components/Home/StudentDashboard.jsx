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
  X
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

const StudentDashboard = () => {
  // const [activeTab, setActiveTab] = useState('feed');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab } = useContext(StudentContext);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const { user, loading, loggedIn, logout } = useContext(StudentContext); // ✅ Use global user state



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

  // Sample friends data
  const friends = [
    { id: 1, name: "Taylor Smith", status: "online", avatar: "/api/placeholder/40/40" },
    { id: 2, name: "Jordan Lee", status: "online", avatar: "/api/placeholder/40/40" },
    { id: 3, name: "Casey Brown", status: "offline", avatar: "/api/placeholder/40/40" },
    { id: 4, name: "Morgan White", status: "online", avatar: "/api/placeholder/40/40" },
    { id: 5, name: "Riley Garcia", status: "offline", avatar: "/api/placeholder/40/40" }
  ];

  // Sample mentors data
  const mentors = [
    { id: 1, name: "Dr. Emma Johnson", department: "Computer Science", avatar: "/api/placeholder/40/40" },
    { id: 2, name: "Prof. Robert Chen", department: "Engineering", avatar: "/api/placeholder/40/40" },
    { id: 3, name: "Dr. Olivia Martinez", department: "Biology", avatar: "/api/placeholder/40/40" }
  ];

  // Sample messages data
  const messages = [
    { id: 1, sender: "Taylor Smith", content: "Did you finish the assignment?", time: "10:30 AM", unread: true, avatar: "/api/placeholder/40/40" },
    { id: 2, sender: "Dr. Emma Johnson", content: "Office hours changed to 2-4pm", time: "Yesterday", unread: false, avatar: "/api/placeholder/40/40" },
    { id: 3, sender: "Campus Events", content: "New event: Tech Talk this Friday", time: "Yesterday", unread: true, avatar: "/api/placeholder/40/40" }
  ];

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

          <nav className="space-y-2">
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

            {/* <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'messages' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <MessageSquare size={20} />
              <span>Messages</span>
            </button> */}

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'bookmarks' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <Bookmark size={20} />
              <span>Bounties</span>
            </button>

            {/* <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === 'inbox' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            > */}
              {/* <Mail size={20} />
              <span>Inbox</span>
            </button> */}
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
          <button className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
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
              onClick={() => setActiveTab(user.role === 'alumni' ? 'juniors' : 'mentors')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg ${activeTab === (user.role === 'alumni' ? 'juniors' : 'mentors') ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
            >
              <User size={20} />
              <span>{user.role === 'alumni' ? 'Juniors' : 'Mentors'}</span>
            </button>

            {/* <button
              onClick={() => {
                setActiveTab('messages');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <MessageSquare size={20} />
              <span></span>
            </button> */}

            <button
              onClick={() => {
                setActiveTab('Bounties');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <Bookmark size={20} />
              <span>Bounties</span>
            </button>

            {/* <button
              onClick={() => {
                setActiveTab('inbox');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 w-full p-2"
            >
              <Mail size={20} />
              <span>Inbox</span>
            </button> */}

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

          {/* Mentors Tab */}
          {activeTab === "mentors" && <ChatApp />}

          {/* Messages Tab */}
          {/* {activeTab === "B" && <Messages messages={messages} />} */}


          {/* Bookmarks Tab */}
          {activeTab === "Bounties" && <Bookmarks bookmarks={bookmarks} />}

          {/* Inbox Tab
          {activeTab === "inbox" && (
            <Inbox
              notifications={[
                { id: 1, title: "New campus event", message: "Tech Talk: AI in Education - Tomorrow at 5PM", time: "1h ago", icon: <Bell size={20} />, bgColor: "bg-indigo-100 text-indigo-600" },
                { id: 2, title: "Study group invitation", message: 'James invited you to join "CS Finals Prep"', time: "3h ago", icon: <Users size={20} />, bgColor: "bg-green-100 text-green-600" },
                { id: 3, title: "Assignment reminder", message: "Physics Problem Set due Friday at 11:59PM", time: "Yesterday", icon: <Mail size={20} />, bgColor: "bg-yellow-100 text-yellow-600" },
              ]}
            />
          )} */}
        </div>
      </div>

      {/*  Right Sidebar - Only visible on larger screens */}
      <div className="hidden lg:block w-72 p-4 border-l">
        <h2 className="font-bold mb-4">Online Friends</h2>
        <div className="space-y-3 mb-6">
          {friends.filter(f => f.status === 'online').map((friend) => (
            <div key={friend.id} className="flex items-center space-x-2">
              <div className="relative">
                <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white"></span>
              </div>
              <span className="text-sm">{friend.name}</span>
            </div>
          ))}
        </div>

        <h2 className="font-bold mb-4">Upcoming Events</h2>
        <div className="space-y-3">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <div className="text-xs text-indigo-600 font-semibold mb-1">TODAY, 5:00 PM</div>
            <div className="font-medium mb-1">CS Department Meet & Greet</div>
            <div className="text-xs text-gray-500">Student Center, Room 302</div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <div className="text-xs text-indigo-600 font-semibold mb-1">TOMORROW, 12:00 PM</div>
            <div className="font-medium mb-1">Tech Talk: AI in Education</div>
            <div className="text-xs text-gray-500">Virtual Event</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;