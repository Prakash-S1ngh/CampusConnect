import React, { useState, useEffect, useContext, useRef } from "react";
import { Search, ArrowLeft, Video, Calendar, MoreVertical, Smile, Send } from "lucide-react";
import { StudentContext } from "../Student/StudentContextProvider";
import axios from "axios";
import { url } from "../../lib/PostUrl";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const API_URL = `${url}/student/v2`;
// const SOCKET_URL = `${url}`;
// const socket = io(SOCKET_URL, { withCredentials: true });

const ChatApp = () => {
    const { user , socket } = useContext(StudentContext);
    const [friends, setFriends] = useState([]);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);
   
    const  activeTab =  localStorage.getItem("activeTab");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadingFriends(true);
    
                let endpoint = "";
    
                if (activeTab === "friends") {
                    endpoint = `${API_URL}/fetchConnnections`;
                } else if (activeTab === "mentors") {
                    endpoint = `${API_URL}/getAlumni`;
                } else if(activeTab === "juniors"){
                    endpoint = `${API_URL}/getjuniors`;
                }
                
                else {
                    console.warn("Invalid activeTab in localStorage.");
                    setLoadingFriends(false);
                    return;
                }
    
                const response = await axios.get(endpoint, { withCredentials: true });
                
                console.log("current tab ",activeTab);
                console.log(`${activeTab} Data:`, response.data);
                setFriends(response.data.success ? response.data.users : []);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoadingFriends(false);
            }
        };
    
        fetchUsers();
    }, [activeTab]);

    useEffect(() => {
        if (selectedFriend) {
            const roomId = [user._id, selectedFriend.userId].sort().join("_");
            socket.emit("joinRoom", { sender: user._id, receiver: selectedFriend.userId });

            const fetchMessages = async () => {
                try {
                    setLoadingMessages(true);
                    const response = await axios.get(`${API_URL}/messages?roomId=${roomId}`, { withCredentials: true });
                    setMessages(response.data.messages.reverse());
                } catch (error) {
                    console.error("Error fetching messages:", error);
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
        });
        return () => socket.off("receiveMessage");
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedFriend) return;

        const msgData = {
            sender: user._id,
            receiver: selectedFriend.userId,
            message: message.trim(),
            createdAt: new Date().toISOString(),
        };

        socket.emit("sendMessage", msgData);
        setMessage("");
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const isSender = (msgSender) =>
        (typeof msgSender === "string" && msgSender === user._id) ||
        (typeof msgSender === "object" && msgSender._id === user._id);

    const Spinner = () => (
        <div className="flex justify-center items-center h-full p-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-80 h-screen flex flex-col overflow-hidden bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search friends"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 pl-8 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none"
                        />
                        <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingFriends ? (
                        <Spinner />
                    ) : (
                        friends
                            .filter((friend) =>
                                friend.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((friend) => (
                                <div
                                    key={friend._id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                                        selectedFriend?._id === friend._id
                                            ? "bg-blue-50 border-l-4 border-blue-500"
                                            : ""
                                    }`}
                                >
                                    <img
                                        src={friend.profileImage || "/api/placeholder/40/40"}
                                        alt={friend.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div className="ml-3 flex-1">
                                        <div className="font-medium">{friend.name}</div>
                                        <div className="text-sm text-gray-500 truncate">
                                            {friend.lastMessage}
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedFriend ? (
                <div className="flex-1 h-screen flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSelectedFriend(null)}
                                className="md:hidden p-2 mr-2 rounded-full hover:bg-gray-100"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <img
                                src={selectedFriend.profileImage || "/api/placeholder/40/40"}
                                alt={selectedFriend.name}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <div className="font-medium">{selectedFriend.name}</div>
                                <div className="text-xs text-gray-500">
                                    {selectedFriend.status === "online" ? "Online" : "Offline"}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/call" state={{ sender: user._id, receiver: selectedFriend.userId }}>
                                <Video size={20} className="text-gray-600 cursor-pointer" />
                            </Link>
                            <Calendar size={20} className="text-gray-600 cursor-pointer" />
                            <MoreVertical size={20} className="text-gray-600 cursor-pointer" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                        {loadingMessages ? (
                            <Spinner />
                        ) : (
                            <div className="flex flex-col">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex mb-4 ${
                                            isSender(msg.sender) ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        {!isSender(msg.sender) && (
                                            <div className="flex items-end">
                                                <img
                                                    src={
                                                        selectedFriend.profileImage ||
                                                        "/api/placeholder/40/40"
                                                    }
                                                    alt={selectedFriend.name}
                                                    className="w-8 h-8 rounded-full mr-2 self-end"
                                                />
                                                <div className="max-w-xs p-3 bg-white text-gray-800 rounded-lg rounded-bl-none shadow">
                                                    <p className="break-words">{msg.message}</p>
                                                    <span className="text-xs block text-right mt-1 text-gray-500">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {isSender(msg.sender) && (
                                            <div className="flex items-end">
                                                <div className="max-w-xs p-3 bg-blue-500 text-white rounded-lg rounded-br-none">
                                                    <p className="break-words">{msg.message}</p>
                                                    <span className="text-xs block text-right mt-1 text-blue-100">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>
                                                <img
                                                    src={user.profileImage || "/api/placeholder/40/40"}
                                                    alt="You"
                                                    className="w-8 h-8 rounded-full ml-2 self-end"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="bg-white border-t border-gray-200 p-3">
                        <form className="flex items-center" onSubmit={sendMessage}>
                            <button
                                type="button"
                                onClick={() => alert("Emoji picker not implemented yet")}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <Smile size={20} className="text-gray-500" />
                            </button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 p-2 mx-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
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
                        <div className="text-xl font-medium text-gray-700 mb-2">Welcome to Chat</div>
                        <p className="text-gray-500">Select a conversation to start chatting</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatApp;