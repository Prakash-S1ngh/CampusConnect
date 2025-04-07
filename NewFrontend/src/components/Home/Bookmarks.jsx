import React from "react";
import { Bookmark } from "lucide-react";

const Bookmarks = ({ bookmarks }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Bookmarks</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {bookmarks.length > 0 ? (
          <div className="divide-y">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{bookmark.title}</h3>
                  <p className="text-sm text-gray-600">{bookmark.description}</p>
                </div>
                <a href={bookmark.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
            <p className="text-gray-500 mb-4">Save posts, messages, and resources for quick access later</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Browse popular posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;