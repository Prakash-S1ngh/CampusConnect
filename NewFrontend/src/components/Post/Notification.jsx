// components/NotificationModal.jsx
import React from 'react';

const Notification = ({ notifications, onClose, onMarkAllRead }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No new notifications</p>
        ) : (
          notifications.map((note, index) => (
            <div key={index} className="border-b border-gray-200 py-2">
              <p className="text-sm">{note.message}</p>
              <p className="text-xs text-gray-400">{note.time}</p>
            </div>
          ))
        )}

        <div className="flex justify-end space-x-3 mt-4">
          <button
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={onMarkAllRead}
          >
            Mark All as Read
          </button>
          <button
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;