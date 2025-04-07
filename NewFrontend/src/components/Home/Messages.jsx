import React from "react";
import { Search } from "lucide-react";

const Messages = ({ messages }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Messages List */}
        <div className="divide-y">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 flex justify-between items-center ${
                  message.unread ? "bg-indigo-50" : ""
                }`}
              >
                {/* Sender Details */}
                <div className="flex items-center space-x-3">
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{message.sender}</h3>
                    <p className="text-sm text-gray-600 truncate w-48">
                      {message.content}
                    </p>
                  </div>
                </div>

                {/* Timestamp & Unread Indicator */}
                <div className="text-right">
                  <p className="text-xs text-gray-500">{message.time}</p>
                  {message.unread && (
                    <span className="inline-block w-3 h-3 bg-indigo-600 rounded-full mt-1"></span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500 text-center">No messages found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;