import React, { useState, useEffect, useContext, useRef } from "react";
import { 
    Search, 
    ArrowLeft, 
    Video, 
    Calendar, 
    MoreVertical, 
    Smile, 
    Send, 
    Paperclip, 
    Image as ImageIcon,
    File,
    Phone,
    PhoneOff,
    User,
    Settings,
    LogOut,
    Check,
    CheckCheck,
    Clock,
    X
} from "lucide-react";
import { StudentContext } from "../Student/StudentContextProvider";
import axios from "axios";
import { url } from "../../lib/PostUrl";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_URL = `${url}/student/v2`;

const ChatApp = () => {
    const { user, socket, activeTab } = useContext(StudentContext);
    const [friends, setFriends] = useState([]);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showFilePicker, setShowFilePicker] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [messageStatus, setMessageStatus] = useState({});
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [showVoiceCall, setShowVoiceCall] = useState(false);
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected
    const [lastSeen, setLastSeen] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [searchMessages, setSearchMessages] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();

    // Emoji data
    const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😎", "🤔", "😢", "😡", "👋", "💪", "🎯", "⭐", "💯", "🚀"];

    const handleProfileClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadingFriends(true);
                let endpoint = "";

                // Determine user role and appropriate endpoint
                const userRole = user?.role;
                console.log("ChatApp - activeTab:", activeTab, "userRole:", userRole);
                
                if (activeTab === "friends") {
                    if (userRole === 'Alumni') {
                        endpoint = `${url}/alumni/v2/connections`;
                    } else {
                        endpoint = `${API_URL}/fetchConnections`;
                    }
                } else if (activeTab === "mentors") {
                    endpoint = `${API_URL}/getAlumni`;
                } else if (activeTab === "juniors") {
                    if (userRole === 'Alumni') {
                        endpoint = `${url}/alumni/v2/juniors`;
                    } else {
                        endpoint = `${API_URL}/getjuniors`;
                    }
                } else if (activeTab === "faculty") {
                    if (userRole === 'Alumni') {
                        endpoint = `${url}/alumni/v2/faculty`;
                    } else if (userRole === 'Faculty') {
                        endpoint = `${url}/faculty/v2/connections`;
                    } else {
                        endpoint = `${url}/faculty/v2/getFaculty`;
                    }
                } else if (activeTab === "peers") {
                    if (userRole === 'Faculty') {
                        endpoint = `${url}/faculty/v2/connections`;
                    } else {
                        endpoint = `${API_URL}/getFaculty`;
                    }
                } else if (activeTab === "alumni") {
                    if (userRole === 'Faculty') {
                        endpoint = `${url}/faculty/v2/connections`;
                    } else if (userRole === 'Alumni') {
                        endpoint = `${url}/alumni/v2/connections`;
                    } else {
                        endpoint = `${API_URL}/getAlumni`;
                    }
                } else if (activeTab === "students") {
                    if (userRole === 'Faculty') {
                        endpoint = `${url}/faculty/v2/connections`;
                    } else {
                        endpoint = `${API_URL}/getjuniors`;
                    }
                } else {
                    console.warn("Invalid activeTab:", activeTab);
                    setLoadingFriends(false);
                    return;
                }

                const response = await axios.get(endpoint, { withCredentials: true });
                console.log("current tab ", response.data);
                
                // Handle different response formats
                let users = [];
                if (response.data.success) {
                    if (response.data.users) {
                        users = response.data.users;
                    } else if (response.data.students) {
                        users = response.data.students;
                    } else if (response.data.faculty) {
                        users = response.data.faculty;
                    } else if (response.data.alumni) {
                        users = response.data.alumni;
                    } else if (response.data.connections) {
                        // For faculty connections, filter based on active tab
                        if (userRole === 'Faculty') {
                            if (activeTab === "peers") {
                                users = response.data.connections.faculty;
                            } else if (activeTab === "alumni") {
                                users = response.data.connections.alumni;
                            } else if (activeTab === "students") {
                                users = response.data.connections.students;
                            } else {
                                // Default: show all users
                                users = [
                                    ...response.data.connections.students,
                                    ...response.data.connections.alumni,
                                    ...response.data.connections.faculty
                                ];
                            }
                        } else {
                            // For non-faculty users, combine all user types
                            users = [
                                ...response.data.connections.students,
                                ...response.data.connections.alumni,
                                ...response.data.connections.faculty
                            ];
                        }
                    }
                }
                
                console.log("Loaded users:", users);
                console.log("Sample user with messages:", users[0]);
                setFriends(users);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to load contacts");
            } finally {
                setLoadingFriends(false);
            }
        };

        fetchUsers();
    }, [activeTab, user?.role]);

    useEffect(() => {
        if (selectedFriend) {
            const recipientId = selectedFriend.userId || selectedFriend._id;
            const roomId = [user._id, recipientId].sort().join("_");
            socket.emit("joinRoom", { sender: user._id, receiver: recipientId });

            const fetchMessages = async () => {
                try {
                    setLoadingMessages(true);
                    let endpoint = `${API_URL}/messages?roomId=${roomId}`;
                    
                    // Use faculty-specific endpoint if user is faculty
                    if (user?.role === 'Faculty') {
                        endpoint = `${url}/faculty/v2/messages/${recipientId}`;
                    }
                    
                    console.log("Fetching messages from endpoint:", endpoint);
                    const response = await axios.get(endpoint, { withCredentials: true });
                    console.log("Messages response:", response.data);
                    
                    if (user?.role === 'Faculty') {
                        setMessages(response.data.messages || []);
                    } else {
                        setMessages(response.data.messages.reverse());
                    }
                } catch (error) {
                    console.error("Error fetching messages:", error);
                    toast.error("Failed to load messages");
                } finally {
                    setLoadingMessages(false);
                }
            };
            fetchMessages();
        }
    }, [selectedFriend]);

    useEffect(() => {
        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
            // Mark message as received
            socket.emit("messageReceived", { messageId: msg._id, receiver: user._id });
        });

        socket.on("messageDelivered", (data) => {
            setMessageStatus(prev => ({
                ...prev,
                [data.messageId]: "delivered"
            }));
        });

        socket.on("messageRead", (data) => {
            setMessageStatus(prev => ({
                ...prev,
                [data.messageId]: "read"
            }));
        });

        socket.on("userTyping", (data) => {
            if (data.userId !== user._id) {
                setTypingUsers(prev => new Set(prev).add(data.userId));
                setTimeout(() => {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(data.userId);
                        return newSet;
                    });
                }, 3000);
            }
        });

        socket.on("userOnline", (userId) => {
            setOnlineUsers(prev => new Set(prev).add(userId));
        });

        socket.on("userOffline", (userId) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("messageDelivered");
            socket.off("messageRead");
            socket.off("userTyping");
            socket.off("userOnline");
            socket.off("userOffline");
        };
    }, [socket, user._id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleTyping = (e) => {
        setMessage(e.target.value);
        
        if (selectedFriend) {
            socket.emit("typing", { 
                sender: user._id, 
                receiver: selectedFriend.userId 
            });
        }

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { 
                sender: user._id, 
                receiver: selectedFriend.userId 
            });
        }, 1000);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedFriend) return;

        const recipientId = selectedFriend.userId || selectedFriend._id;
        const msgData = {
            sender: user._id,
            receiver: recipientId,
            message: message.trim(),
            replyTo: replyTo,
            createdAt: new Date().toISOString(),
        };

        // For faculty, also send to backend API
        if (user?.role === 'Faculty') {
            const recipientId = selectedFriend.userId || selectedFriend._id;
            console.log("Sending faculty message to:", recipientId);
            axios.post(`${url}/faculty/v2/sendMessage`, {
                recipientId: recipientId,
                message: message.trim()
            }, {
                withCredentials: true
            }).then(response => {
                if (response.data.success) {
                    // Add the new message to the state
                    const newMessageData = response.data.data;
                    setMessages(prev => [...prev, newMessageData]);
                }
            }).catch(error => {
                console.error("Error sending faculty message:", error);
                toast.error("Failed to send message");
            });
        } else {
            socket.emit("sendMessage", msgData);
        }

        setMessage("");
        setReplyTo(null);
        setShowEmojiPicker(false);
    };

    const sendFile = (file) => {
        if (!selectedFriend) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sender', user._id);
        formData.append('receiver', selectedFriend.userId);

        axios.post(`${API_URL}/upload-file`, formData, { withCredentials: true })
            .then(response => {
                const msgData = {
                    sender: user._id,
                    receiver: selectedFriend.userId,
                    message: `File: ${file.name}`,
                    fileUrl: response.data.fileUrl,
                    fileType: file.type,
                    fileName: file.name,
                    createdAt: new Date().toISOString(),
                };
                socket.emit("sendMessage", msgData);
                toast.success("File sent successfully");
            })
            .catch(error => {
                console.error("Error uploading file:", error);
                toast.error("Failed to send file");
            });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error("File size should be less than 10MB");
                return;
            }
            sendFile(file);
        }
        setShowFilePicker(false);
    };

    const addEmoji = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // WhatsApp-like features
    const initiateVideoCall = () => {
        if (!selectedFriend) return;
        
        setCallStatus('calling');
        setShowVideoCall(true);
        
        // Emit video call signal
        socket.emit('video-call', {
            from: user._id,
            to: selectedFriend.userId,
            type: 'video'
        });
        
        toast.success('Initiating video call...');
    };

    const initiateVoiceCall = () => {
        if (!selectedFriend) return;
        
        setCallStatus('calling');
        setShowVoiceCall(true);
        
        // Emit voice call signal
        socket.emit('voice-call', {
            from: user._id,
            to: selectedFriend.userId,
            type: 'voice'
        });
        
        toast.success('Initiating voice call...');
    };

    const endCall = () => {
        setCallStatus('idle');
        setShowVideoCall(false);
        setShowVoiceCall(false);
        
        // Emit end call signal
        socket.emit('end-call', {
            from: user._id,
            to: selectedFriend?.userId
        });
        
        toast.info('Call ended');
    };

    const pinMessage = (messageId) => {
        setPinnedMessages(prev => [...prev, messageId]);
        toast.success('Message pinned');
    };

    const searchInMessages = (query) => {
        setSearchMessages(query);
        setShowSearchResults(query.length > 0);
    };

    const markAsRead = (friendId) => {
        setUnreadCounts(prev => ({ ...prev, [friendId]: 0 }));
        // Emit read receipt
        socket.emit('mark-read', { from: user._id, to: friendId });
    };

    const getLastSeen = (friendId) => {
        return lastSeen[friendId] || 'Unknown';
    };

    const isOnline = (friendId) => {
        return onlineUsers.has(friendId);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else if (diffInHours < 48) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString();
        }
    };

    const isSender = (msgSender) =>
        (typeof msgSender === "string" && msgSender === user._id) ||
        (typeof msgSender === "object" && msgSender._id === user._id);

    const getMessageStatus = (messageId) => {
        return messageStatus[messageId] || "sent";
    };

    const renderMessageStatus = (messageId) => {
        const status = getMessageStatus(messageId);
        switch (status) {
            case "sent":
                return <Clock size={12} className="text-gray-400" />;
            case "delivered":
                return <Check size={12} className="text-gray-400" />;
            case "read":
                return <CheckCheck size={12} className="text-blue-500" />;
            default:
                return null;
        }
    };

    const Spinner = () => (
        <div className="flex justify-center items-center h-full p-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const filteredFriends = friends.filter((friend) =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full bg-gray-50">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 h-full flex flex-col overflow-hidden bg-white border-r border-gray-200 shadow-lg`}>
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Messages</h2>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                <Settings size={16} className="text-white" />
                            </button>
                            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                <LogOut size={16} className="text-white" />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 pl-10 rounded-lg bg-white/90 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingFriends ? (
                        <Spinner />
                    ) : (
                        <div>
                            {filteredFriends.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <User size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No contacts found</p>
                                </div>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend._id || friend.userId}
                                        className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            selectedFriend?._id === friend._id || selectedFriend?.userId === friend.userId
                                                ? "bg-blue-50 border-l-4 border-blue-500"
                                                : ""
                                        }`}
                                    >
                                        <div className="relative">
                                            <img
                                                src={friend.profileImage || "/default-avatar.png"}
                                                alt={friend.name}
                                                className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProfileClick(friend.userId || friend._id);
                                                }}
                                                title="View Profile"
                                            />
                                            {onlineUsers.has(friend.userId) && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div 
                                                    className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={() => {
                                                        console.log("Selected friend:", friend);
                                                        console.log("Friend ID:", friend._id || friend.userId);
                                                        setSelectedFriend(friend);
                                                    }}
                                                >
                                                    {friend.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatTime(friend.lastMessageTime)}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate">
                                                {friend.lastMessage ? (
                                                    friend.lastMessageSender === user._id ? (
                                                        <span>You: {friend.lastMessage}</span>
                                                    ) : (
                                                        friend.lastMessage
                                                    )
                                                ) : (
                                                    "No messages yet"
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedFriend ? (
                <div className="flex-1 h-full flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
                        <div className="flex items-center">
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="md:hidden p-2 mr-3 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <div className="relative">
                                <img
                                    src={selectedFriend.profileImage || "/default-avatar.png"}
                                    alt={selectedFriend.name}
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleProfileClick(selectedFriend.userId || selectedFriend._id)}
                                    title="View Profile"
                                />
                                {onlineUsers.has(selectedFriend.userId) && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div 
                                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleProfileClick(selectedFriend.userId || selectedFriend._id)}
                                >
                                    {selectedFriend.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {onlineUsers.has(selectedFriend.userId) ? "Online" : "Offline"}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={initiateVideoCall}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                title="Video Call"
                            >
                                <Video size={20} className="text-gray-600" />
                            </button>
                            <button
                                onClick={initiateVoiceCall}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                title="Voice Call"
                            >
                                <Phone size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <MoreVertical size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                        {loadingMessages ? (
                            <Spinner />
                        ) : (
                            <div className="flex flex-col space-y-4">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${isSender(msg.sender) ? "justify-end" : "justify-start"}`}
                                    >
                                        {!isSender(msg.sender) && (
                                            <div className="flex items-end max-w-xs lg:max-w-md">
                                                <img
                                                    src={selectedFriend.profileImage || "/default-avatar.png"}
                                                    alt={selectedFriend.name}
                                                    className="w-8 h-8 rounded-full mr-2 self-end object-cover"
                                                />
                                                <div className="bg-white rounded-2xl rounded-bl-md p-3 shadow-sm">
                                                    {msg.replyTo && (
                                                        <div className="text-xs text-gray-500 mb-1 border-l-2 border-gray-300 pl-2">
                                                            Replying to a message
                                                        </div>
                                                    )}
                                                    {msg.fileUrl ? (
                                                        <div className="flex items-center space-x-2">
                                                            {msg.fileType?.startsWith('image/') ? (
                                                                <img src={msg.fileUrl} alt="Shared image" className="max-w-full rounded" />
                                                            ) : (
                                                                <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                                                                    <File size={16} />
                                                                    <span className="text-sm">{msg.fileName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-800 break-words">{msg.message}</p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {isSender(msg.sender) && (
                                            <div className="flex items-end max-w-xs lg:max-w-md">
                                                <div className="bg-blue-500 text-white rounded-2xl rounded-br-md p-3 shadow-sm">
                                                    {msg.replyTo && (
                                                        <div className="text-xs text-blue-100 mb-1 border-l-2 border-blue-300 pl-2">
                                                            Replying to a message
                                                        </div>
                                                    )}
                                                    {msg.fileUrl ? (
                                                        <div className="flex items-center space-x-2">
                                                            {msg.fileType?.startsWith('image/') ? (
                                                                <img src={msg.fileUrl} alt="Shared image" className="max-w-full rounded" />
                                                            ) : (
                                                                <div className="flex items-center space-x-2 p-2 bg-blue-400 rounded">
                                                                    <File size={16} />
                                                                    <span className="text-sm">{msg.fileName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="break-words">{msg.message}</p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-blue-100">
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                        {renderMessageStatus(msg._id)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Typing indicator */}
                                {typingUsers.has(selectedFriend.userId) && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl rounded-bl-md p-3 shadow-sm">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Reply preview */}
                    {replyTo && (
                        <div className="bg-gray-100 p-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Replying to: {replyTo.message.substring(0, 50)}...
                                </div>
                                <button 
                                    onClick={() => setReplyTo(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="bg-white border-t border-gray-200 p-4">
                        <form className="flex items-center space-x-2" onSubmit={sendMessage}>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <Smile size={20} className="text-gray-500" />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1">
                                        {emojis.map((emoji, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => addEmoji(emoji)}
                                                className="p-1 hover:bg-gray-100 rounded text-lg"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowFilePicker(!showFilePicker)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <Paperclip size={20} className="text-gray-500" />
                                </button>
                                {showFilePicker && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full"
                                        >
                                            <ImageIcon size={16} />
                                            <span className="text-sm">Send file</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <input
                                type="text"
                                value={message}
                                onChange={handleTyping}
                                placeholder="Type a message..."
                                className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={!message.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <User size={48} className="text-blue-500" />
                        </div>
                        <div className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Chat</div>
                        <p className="text-gray-500 max-w-md">
                            Select a conversation from the sidebar to start chatting with your connections
                        </p>
                    </div>
                </div>
            )}

            {/* Video Call Overlay */}
            {showVideoCall && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <Video size={48} className="text-blue-600 mx-auto mb-2" />
                                <h3 className="text-xl font-semibold">Video Call</h3>
                                <p className="text-gray-600">Calling {selectedFriend?.name}...</p>
                            </div>
                            
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={endCall}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    End Call
                                </button>
                                <button
                                    onClick={() => setShowVideoCall(false)}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Voice Call Overlay */}
            {showVoiceCall && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <Phone size={48} className="text-green-600 mx-auto mb-2" />
                                <h3 className="text-xl font-semibold">Voice Call</h3>
                                <p className="text-gray-600">Calling {selectedFriend?.name}...</p>
                            </div>
                            
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={endCall}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    End Call
                                </button>
                                <button
                                    onClick={() => setShowVoiceCall(false)}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatApp;