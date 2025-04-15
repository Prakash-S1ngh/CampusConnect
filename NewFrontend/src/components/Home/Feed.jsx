import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Plus, X, Upload } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { url } from '../../lib/PostUrl';
import { StudentContext } from '../Student/StudentContextProvider';
import OptionsMenu from '../Post/OptionsMenu';

const Feed = () => {
  const { user , socket } = useContext(StudentContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState('announcement');
  const [isPosting, setIsPosting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setMediaFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if we already have a video
    const existingVideo = mediaFiles.find(file => file.type.startsWith('video/'));
    const hasNewVideo = files.some(file => file.type.startsWith('video/'));

    if (existingVideo && hasNewVideo) {
      toast.warning('Only one video file allowed');
      // Filter out new video files
      const filteredFiles = files.filter(file => !file.type.startsWith('video/'));
      setMediaFiles(prev => [...prev, ...filteredFiles]);
      return;
    }

    // Add new files to existing ones
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setIsPosting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('createdBy', user._id);
      formData.append('college', user.college._id);
      formData.append('type', postType);

      // Append each media file to the form data
      mediaFiles.forEach(file => {
        formData.append('images', file);
      });

      toast.info('Creating post...');
      await axios.post(`${url}/feed/v2/createFeed`, formData, { withCredentials: true });
      toast.success('Post created successfully!');
      closeModal();
      fetchPosts();
    } catch (err) {
      toast.error('Error creating post');
      console.error('Error creating post', err);
    } finally {
      setIsPosting(false);
    }
  };

  // useEffect(() => {
  //   socket.on('new-post', (newPost) => {
  //     setPosts(prev => [newPost, ...prev]);
  //     toast.info('📢 New post added!');
  //   });
  
  //   return () => {
  //     socket.off('new-post');
  //   };
  // }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/feed/v2/getPost`, { withCredentials: true });
      setPosts(res.data.posts || []);
      console.log(res.data.posts);
    } catch (err) {
      toast.error('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Helper function to check if a file is a video
  const isVideoFile = (fileUrl) => {
    if (!fileUrl || fileUrl != "string") return false;
    return fileUrl.toLowerCase().endsWith('.mp4') ||
      fileUrl.toLowerCase().endsWith('.mov') ||
      fileUrl.toLowerCase().endsWith('.webm') ||
      fileUrl.toLowerCase().includes('video');
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <ToastContainer />

      {/* 🔍 Search bar and ➕ button */}
      <div className="flex items-center gap-2 mt-6 mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          className="flex-1 bg-gray-100 rounded px-4 py-2 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={openModal}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 📦 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white rounded-lg shadow p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={closeModal}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Create a Post</h2>

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

            {/* Media Preview */}
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
                        <video
                          className="w-full h-32 object-cover rounded"
                        >
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
                onClick={handleCreatePost}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPosting}
              >
                {isPosting ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 Loader or Post Feed */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-lg">Loading posts...</div>
      ) : filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-start space-x-3">
              <img
                src={post.createdBy?.profileImage}
                alt={post.createdBy?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{post.createdBy?.name}</h3>
                    <p className="text-xs text-gray-500">
                      {post.createdBy?.role} • {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <OptionsMenu post={post}
                    onEdit={() => console.log("Edit clicked")}
                    onDelete={() => console.log("Delete clicked")}
                  />
                </div>

                <h4 className="text-md font-semibold mt-2">{post.title}</h4>
                <p className="mt-1 whitespace-pre-wrap">{post.content}</p>

                {post.media && post.media.length > 0 && (
                  <div className="mt-3">
                    {post.media.length === 1 ? (
                      isVideoFile(post.media[0]) ? (
                        <video controls className="max-h-60 mt-2 rounded w-full">
                          <source src={post.media[0]} />
                        </video>
                      ) : (
                        <img
                          src={post.media[0].url}
                          alt="post media"
                          className="mt-2 rounded max-h-60 w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {post.media.map((file, idx) => (
                          isVideoFile(file) ? (
                            <video key={idx} controls className="h-40 mt-2 rounded w-full object-cover">
                              <source src={file} />
                            </video>
                          ) : (
                            <img
                              key={idx}
                              src={file.url}
                              alt="post media"
                              className="mt-2 rounded h-40 w-full object-cover"
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <span>👍</span>
                    <span>{post.reactions?.like?.length || 0}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <MessageSquare size={16} />
                    <span>0</span>
                  </button>
                  <button className="hover:text-blue-600">Share</button>
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