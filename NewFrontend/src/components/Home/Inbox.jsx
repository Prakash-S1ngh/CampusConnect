import React from "react";
import { Bell, Users, Mail } from "lucide-react";

const Inbox = ({ notifications }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Inbox</h2>
      <div className="bg-white rounded-lg shadow divide-y">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${notification.bgColor}`}>
                  {notification.icon}
                </div>
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No new notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;