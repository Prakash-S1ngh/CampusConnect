import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    MessageSquare, 
    Trophy, 
    Calendar, 
    Award,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Send,
    Smile,
    Paperclip,
    ArrowLeft
} from 'lucide-react';
import { StudentContext } from '../Student/StudentContextProvider';
import { url } from '../../lib/PostUrl';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TeamPanel = () => {
    const { user, socket } = useContext(StudentContext);
    const navigate = useNavigate();
    const [currentTeam, setCurrentTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamMessages, setTeamMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);

    // Emoji data
    const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😎", "🤔", "😢", "😡", "👋", "💪", "🎯", "⭐", "💯", "🚀"];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [teamMessages]);

    useEffect(() => {
        fetchCurrentTeam();
    }, [user]);

    useEffect(() => {
        if (currentTeam && socket && user && currentTeam._id && user._id) {
            // Join team room for real-time messaging
            socket.emit('joinTeamRoom', { teamId: currentTeam._id, userId: user._id });

            // Listen for team messages
            socket.on('teamMessage', (message) => {
                console.log('[TEAM_PANEL] Received team message:', message);
                setTeamMessages(prev => [...prev, message]);
            });

            // Listen for team member updates
            socket.on('teamMemberUpdate', (data) => {
                if (data.teamId === currentTeam._id) {
                    fetchTeamMembers();
                }
            });

            return () => {
                if (socket) {
                    socket.off('teamMessage');
                    socket.off('teamMemberUpdate');
                    socket.emit('leaveTeamRoom', { teamId: currentTeam._id, userId: user._id });
                }
            };
        }
    }, [currentTeam, socket, user]);

    const fetchCurrentTeam = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/student/v2/getTeams`, {
                withCredentials: true
            });

            console.log('[TEAM_PANEL] Response:', response.data);
            
            if (response.data.success && response.data.participation.length > 0) {
                console.log('[TEAM_PANEL] Found participations:', response.data.participation.length);
                // Get the most recent team (active or inactive)
                const mostRecentTeam = response.data.participation.find(p => p.bounty);
                if (mostRecentTeam) {
                    console.log('[TEAM_PANEL] Found team:', mostRecentTeam);
                    setCurrentTeam(mostRecentTeam);
                    await fetchTeamMembers(mostRecentTeam._id);
                    await fetchTeamMessages(mostRecentTeam._id);
                } else {
                    console.log('[TEAM_PANEL] No team with bounty found');
                }
            } else {
                console.log('[TEAM_PANEL] No participations found');
            }
        } catch (error) {
            console.error('Error fetching current team:', error);
            toast.error('Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async (teamId = currentTeam?._id) => {
        if (!teamId) return;

        try {
            const response = await axios.get(`${url}/student/v2/getTeamMembers/${teamId}`, {
                withCredentials: true
            });

            if (response.data.success) {
                setTeamMembers(response.data.members);
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    const fetchTeamMessages = async (teamId = currentTeam?._id) => {
        if (!teamId) return;

        try {
            const response = await axios.get(`${url}/student/v2/getTeamMessages/${teamId}`, {
                withCredentials: true
            });

            if (response.data.success) {
                setTeamMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error fetching team messages:', error);
        }
    };

    const sendTeamMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentTeam || !user) return;

        try {
            const messageText = newMessage.trim();
            setNewMessage(''); // Clear input immediately for better UX

            // Save to database first
            const response = await axios.post(`${url}/student/v2/sendTeamMessage`, {
                teamId: currentTeam._id,
                message: messageText
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                // Add the new message to the state
                const newMessageData = response.data.data;
                setTeamMessages(prev => [...prev, newMessageData]);

                // Send message via socket for real-time to other team members
                if (socket) {
                    socket.emit('sendTeamMessage', {
                        teamId: currentTeam._id,
                        message: newMessageData
                    });
                }

                console.log('Message sent successfully:', newMessageData);
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending team message:', error);
            toast.error('Failed to send message');
            // Restore the message if sending failed
            setNewMessage(newMessage);
        }
    };

    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const getTeamStatus = () => {
        if (!currentTeam) return 'No Team';
        if (currentTeam.isApproved) return 'Approved';
        if (currentTeam.submittedAt) return 'Pending Approval';
        return 'Active';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-green-600 bg-green-100';
            case 'Pending Approval': return 'text-yellow-600 bg-yellow-100';
            case 'Active': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={16} />;
            case 'Pending Approval': return <Clock size={16} />;
            case 'Active': return <AlertCircle size={16} />;
            default: return <XCircle size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading team data...</span>
            </div>
        );
    }

    // Check if user is loaded
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">Loading user data...</div>
                </div>
            </div>
        );
    }

    if (!currentTeam) {
        return (
            <div className="h-full flex flex-col">
                {/* Header with back button */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                            title="Back to Home"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Team Panel</h2>
                            <p className="text-sm text-gray-600">Manage your team activities</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Team</h3>
                        <p className="text-gray-500 mb-4">You're not currently part of any active team.</p>
                        <div className="space-x-4">
                            <button
                                onClick={() => fetchCurrentTeam()}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Refresh Teams
                            </button>
                            <button
                                onClick={() => navigate('/bounty')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Join a Bounty
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Team Header */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                            title="Back to Home"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{currentTeam.teamName}</h2>
                            <p className="text-sm text-gray-600">{currentTeam.bounty?.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(getTeamStatus())}`}>
                            {getStatusIcon(getTeamStatus())}
                            <span>{getTeamStatus()}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex space-x-1 p-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'overview' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'members' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Members ({teamMembers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'chat' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Team Chat
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'overview' && (
                    <div className="p-6 space-y-6">
                        {/* Bounty Information */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bounty Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Trophy className="text-yellow-500" size={20} />
                                    <div>
                                        <p className="font-medium">{currentTeam.bounty?.title}</p>
                                        <p className="text-sm text-gray-600">{currentTeam.bounty?.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Award className="text-green-500" size={20} />
                                    <div>
                                        <p className="font-medium">₹{currentTeam.bounty?.amount}</p>
                                        <p className="text-sm text-gray-600">Bounty Reward</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Calendar className="text-red-500" size={20} />
                                    <div>
                                        <p className="font-medium">
                                            {new Date(currentTeam.bounty?.deadline).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">Deadline</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team Status */}
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Team Approval:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getTeamStatus())}`}>
                                        {getTeamStatus()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Team Members:</span>
                                    <span className="font-medium">{teamMembers.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Messages:</span>
                                    <span className="font-medium">{teamMessages.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="p-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {teamMembers.map((member, index) => (
                                    <div key={member._id || index} className="p-4 flex items-center space-x-3">
                                        <img
                                            src={member.profileImage || '/default-avatar.png'}
                                            alt={member.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{member.name}</p>
                                            <p className="text-sm text-gray-600">{member.role}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Member</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div ref={messagesEndRef} />
                            {teamMessages.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">No messages yet</p>
                                    <p className="text-sm text-gray-500">Start the conversation!</p>
                                </div>
                            ) : (
                                teamMessages.map((message, index) => (
                                    <div
                                        key={message._id || index}
                                        className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.sender._id === user._id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                        }`}>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <img
                                                    src={message.sender.profileImage || '/default-avatar.png'}
                                                    alt={message.sender.name}
                                                    className="w-6 h-6 rounded-full"
                                                />
                                                <span className="text-xs opacity-75">{message.sender.name}</span>
                                            </div>
                                            <p className="text-sm">{message.message}</p>
                                            <p className="text-xs opacity-75 mt-1">
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="border-t border-gray-200 p-4 bg-white">
                            <form onSubmit={sendTeamMessage} className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <Smile size={20} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </form>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-8 gap-1">
                                        {emojis.map((emoji, index) => (
                                            <button
                                                key={index}
                                                onClick={() => addEmoji(emoji)}
                                                className="p-2 hover:bg-gray-200 rounded text-lg"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamPanel; 