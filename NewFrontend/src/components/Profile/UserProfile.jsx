import React from 'react';
import { useState, useEffect } from 'react';
import { url } from '../../lib/PostUrl';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    bio: '',
    skills: [],
    address: '',
    profileImage: '',
    social: {
      linkedin: '',
      github: '',
      portfolio: '',
      projects: [],
      id: ''
    }
  });
  const [newSkill, setNewSkill] = useState('');
  const [newProject, setNewProject] = useState('');
  const [formChanged, setFormChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const APIURL = `${url}/student/v2`;
  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${APIURL}/getInfo`, {
          withCredentials: true
        });
        const user = response.data.user;

        // Handle comma-separated and non-separated skills
        const rawSkills = user?.userInfo?.skills || [];
        const skillsArray = rawSkills
          .flatMap(skillItem => skillItem.split(','))
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);

        const social = {
          github: user?.userInfo?.social?.github || '',
          linkedin: user?.userInfo?.social?.linkedin || '',
          portfolio: user?.userInfo?.social?.portfolio || '',
          projects: user?.userInfo?.social?.projects || []
        };

        const formattedUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          college: user.college || {},
          userInfo: {
            bio: user.userInfo.bio,
            skills: skillsArray,
            address: user.userInfo.address || '',
            social,
            id: user.userInfo._id
          }
        };

        setUserData(formattedUser);

        setFormData({
          name: formattedUser.name,
          email: formattedUser.email,
          role: formattedUser.role,
          profileImage: formattedUser.profileImage,
          college: formattedUser.college,
          bio: formattedUser.userInfo.bio,
          skills: formattedUser.userInfo.skills,
          address: formattedUser.userInfo.address,
          social: formattedUser.userInfo.social,
          id: formattedUser.userInfo.id
        });

        console.log("User data fetched:", formattedUser);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Track form changes
  useEffect(() => {
    if (userData && !isLoading) {
      const initialData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage,
        bio: userData.userInfo.bio,
        skills: userData.userInfo.skills,
        address: userData.userInfo.address,
        social: userData.userInfo.social
      };

      // Check if any form field has changed
      const hasChanged = JSON.stringify(initialData) !== JSON.stringify(formData);
      setFormChanged(hasChanged);
    }
  }, [formData, userData, isLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    const imageUrl = e.target.value;
    setFormData({
      ...formData,
      profileImage: imageUrl
    });
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() !== '' && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      console.log(formData);

      const sendskill = {
        skill: newSkill.trim(),
        userinfoid: formData.id  // assuming formData contains userinfoid
      };

      try {
        const response = await axios.post(`${APIURL}/addskills`, sendskill, {
          withCredentials: true
        });

        console.log("Skill added response:", response.data);
        setNewSkill('');
      } catch (error) {
        console.error("Error adding skill:", error.response?.data || error.message);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      // Update local state
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter(skill => skill !== skillToRemove)
      }));

      // Send DELETE request to backend with skill and userinfo id
      const response = await axios.delete(`${APIURL}/removeskills`, {
        data: {
          skill: skillToRemove,
          userinfoid: formData.id
        },
        withCredentials: true
      });

      console.log("Skill removed:", response.data);
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  const handleAddProject = async () => {
    const trimmedProject = newProject.trim();

    if (trimmedProject !== '' && !formData.social.projects.includes(trimmedProject)) {
      // Update frontend state
      setFormData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          projects: [...prev.social.projects, trimmedProject]
        }
      }));

      try {
        const response = await axios.post(
          `${APIURL}/addproject`,
          {
            project: trimmedProject,
            userinfoid: formData.id
          },
          {
            withCredentials: true
          }
        );

        console.log("Project added:", response.data);
        setNewProject('');
      } catch (error) {
        console.error("Error adding project:", error);
      }
    }
  };

  const handleRemoveProject = async (projectToRemove) => {
    // Optimistically update the frontend
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        projects: prev.social.projects.filter(project => project !== projectToRemove)
      }
    }));

    try {
      const response = await axios.delete(`${APIURL}/removeproject`, {
        data: {
          project: projectToRemove,
          userinfoid: formData.id
        },
        withCredentials: true
      });

      console.log("Project removed:", response.data);
    } catch (error) {
      console.error("Error removing project:", error);
    }
  };

  const handleSaveChanges = async () => {
    if (!formChanged) return;

    setIsSaving(true);

    try {
      const dataToSubmit = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        profileImage: formData.profileImage,
        userInfo: {
          userinfoid: formData.id, // important!
          bio: formData.bio,
          address: formData.address,
          social: {
            github: formData.social.github,
            linkedin: formData.social.linkedin,
            portfolio: formData.social.portfolio
          }
        }
      };

      const response = await axios.put(`${APIURL}/updateUser`, dataToSubmit, {
        withCredentials: true
      });

      console.log("Profile updated:", response.data);

      setUserData({
        ...userData,
        ...response.data.updatedUser
      });

      setFormChanged(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Image Modal Component
  const ImageModal = () => {
    if (!showImageModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-auto relative">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>

          <div className="p-6">
            <h3 className="text-xl font-medium mb-4">Profile Image</h3>

            <div className="mb-4 flex justify-center">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="max-h-80 object-contain rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/400/400";
                  }}
                />
              ) : (
                <div className="w-64 h-64 rounded bg-gray-300 flex items-center justify-center">
                  <span className="text-6xl text-gray-600">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Profile Image URL</label>
              <input
                type="text"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://example.com/profile-image.jpg"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-start mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:underline font-medium"
          >
            ← Back
          </button>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Edit Profile</h1>

        <div className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative mb-4 cursor-pointer group"
              onClick={() => setShowImageModal(true)}
            >
              {formData.profileImage ? (
                <div className="relative">
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 transition-opacity group-hover:opacity-80"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/128/128";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-50 rounded-full w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center group-hover:bg-gray-400 transition-colors">
                  <span className="text-4xl text-gray-600">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
              <input
                type="text"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://example.com/profile-image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">Click on profile image to open larger view</p>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Student">Student</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Your address"
              />
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          {/* Skills Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  <span>{skill}</span>
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  name="social.linkedin"
                  value={formData.social.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="LinkedIn profile URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input
                  type="url"
                  name="social.github"
                  value={formData.social.github}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="GitHub profile URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                <input
                  type="url"
                  name="social.portfolio"
                  value={formData.social.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Portfolio website URL"
                />
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projects</label>
            <div className="mb-2">
              {formData.social.projects.map((project, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-200 py-2">
                  <span>{project}</span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveProject(project)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Add a project"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProject())}
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving || !formChanged}
              className={`px-6 py-2 rounded-md ${isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : !formChanged
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } font-medium transition-colors duration-200`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Profile Image Modal */}
        <ImageModal />
      </div>
    </div>
  );
}

export default UserProfile;