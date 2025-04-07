import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Search, MessageSquare } from "lucide-react";
import { url } from "../../lib/PostUrl";
import { StudentContext } from "../Student/StudentContextProvider";
import { io } from "socket.io-client";
import ChatApp from "../Text/ChatApp";

const API_URL = `${url}/student/v2/fetchConnnections`;
const socket = io(url); // Connect to WebSocket server

const Friends = () => {
  const { user } = useContext(StudentContext);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (user) {
      socket.emit("userOnline", user._id); // Notify backend that user is online
    }

    socket.on("updateUserStatus", (onlineUserIds) => {
      setOnlineUsers(new Set(onlineUserIds)); // Update online users state
    });

    return () => {
      socket.off("updateUserStatus");
    };
  }, [user]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL, { withCredentials: true });
        setFriends(response.data.success ? response.data.users : []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedFriend) {
    return (
      <ChatApp
        selectedFriend={selectedFriend}
        filteredFriends={filteredFriends}
        userId={user._id}
        setSelectedFriend={setSelectedFriend}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">My Friends</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading friends...</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div key={friend.userId} className="p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={friend.profileImage}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          onlineUsers.has(friend.userId) ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{friend.name}</h3>
                      <p className="text-xs text-gray-500">
                        {friend.lastMessage !== "None" ? friend.lastMessage : "No messages yet"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-500 text-center">No friends found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
