import React from "react";
import { MessageSquare } from "lucide-react";

const Mentors = ({ mentors }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">My Mentors</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        {/* Mentors List */}
        <div className="divide-y">
          {mentors.length > 0 ? (
            mentors.map((mentor) => (
              <div key={mentor.id} className="p-4 flex justify-between items-center">
                
                {/* Mentor Avatar & Details */}
                <div className="flex items-center space-x-3">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{mentor.name}</h3>
                    <p className="text-xs text-gray-500">{mentor.department}</p>
                  </div>
                </div>

                {/* Actions: Schedule & Message */}
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">
                    Schedule
                  </button>
                  <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500 text-center">No mentors found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mentors;