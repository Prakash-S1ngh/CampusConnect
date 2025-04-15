import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { url } from '../../lib/PostUrl';
import { X, Upload } from 'lucide-react';

const OptionsMenu = ({ post }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('general');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const menuRef = useRef(null);
    const apiurl = `${url}/feed/v2`;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const deleteHandler = async () => {
        try {
            const res = await axios.get(`${apiurl}/deletePost/${post._id}`, {
                withCredentials: true,
            });
            console.log("Deleted:", res.data);
            setShowMenu(false);
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const openEditModal = () => {
        setTitle(post.title || '');
        setContent(post.content || '');
        setPostType(post.postType || 'general');
        setMediaFiles([]); // Load actual media files if needed
        setIsModalOpen(true);
        setShowMenu(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFileChange = (e) => {
        setMediaFiles([...e.target.files]);
    };

    const removeFile = (index) => {
        const updated = [...mediaFiles];
        updated.splice(index, 1);
        setMediaFiles(updated);
    };

    const saveHandler = async () => {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("postType", postType);
            mediaFiles.forEach(file => formData.append("media", file));

            const res = await axios.patch(`${apiurl}/posts/${post._id}`, formData, {
                withCredentials: true,
            });

            console.log("Post updated:", res.data);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600"
            >
                •••
            </button>

            {showMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <button
                        onClick={openEditModal}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Edit
                    </button>
                    <button
                        onClick={deleteHandler}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                        Delete
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="relative bg-white rounded-lg shadow p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-3 right-3 text-gray-600 hover:text-black"
                            onClick={closeModal}
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Post Title</label>
                            <input
                                type="text"
                                placeholder="Enter title"
                                className="w-full bg-gray-100 rounded px-4 py-2 focus:outline-none"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Content</label>
                            <textarea
                                placeholder="Write something..."
                                className="w-full bg-gray-100 rounded px-4 py-2 focus:outline-none resize-none h-32"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Post Type</label>
                            <select
                                className="w-full bg-gray-100 rounded px-4 py-2"
                                value={postType}
                                onChange={(e) => setPostType(e.target.value)}
                            >
                                <option value="announcement">📢 Announcement</option>
                                <option value="event">🎉 Event</option>
                                <option value="general">💬 General Discussion</option>
                                <option value="query">🆘 Help / Query</option>
                                <option value="lost-found">📦 Lost & Found</option>
                                <option value="placement">💼 Placement / Internship</option>
                                <option value="alumni">🎓 Alumni Post</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Upload Media</label>
                            <div className="flex items-center">
                                <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded flex items-center gap-2">
                                    <Upload size={16} />
                                    <span>Add Files</span>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                <span className="ml-3 text-sm text-gray-500">
                                    {mediaFiles.length > 0 ? `${mediaFiles.length} file(s) selected` : 'No files selected'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                You can upload multiple images and one video
                            </p>
                        </div>

                        {mediaFiles.length > 0 && (
                            <div className="mb-4">
                                <p className="font-medium mb-2">Media Preview</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {mediaFiles.map((file, index) => (
                                        <div key={index} className="relative">
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`preview ${index}`}
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                            ) : (
                                                <video className="w-full h-32 object-cover rounded">
                                                    <source src={URL.createObjectURL(file)} type={file.type} />
                                                </video>
                                            )}
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                            <span className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
                                                {file.type.startsWith('image/') ? 'Image' : 'Video'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveHandler}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isPosting}
                            >
                                {isPosting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default OptionsMenu;