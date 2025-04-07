import React from "react";
import { MessageSquare } from "lucide-react";

const Feed = ({ user, posts }) => {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center space-x-2">
          <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full" />
          <input
            type="text"
            placeholder="What's on your mind?"
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Posts */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-start space-x-3">
              <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{post.author}</h3>
                    <p className="text-xs text-gray-500">{post.authorRole} • {post.time}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">•••</button>
                </div>
                <p className="mt-2">{post.content}</p>
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  <button className="flex items-center space-x-1">
                    <span>👍</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <MessageSquare size={16} />
                    <span>{post.comments}</span>
                  </button>
                  <button>Share</button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 p-4">No posts available</div>
      )}
    </div>
  );
};

export default Feed;