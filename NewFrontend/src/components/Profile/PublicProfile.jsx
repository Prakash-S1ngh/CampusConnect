import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { url } from '../../lib/PostUrl';
import axios from 'axios';
import { StudentContext } from '../Student/StudentContextProvider';
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  ExternalLink,
  User,
  GraduationCap,
  Building,
  Crown,
  MessageSquare,
  Phone,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(StudentContext);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch user data from different endpoints based on role
        let response;
        let userData;

                try {
            // Try student endpoint first
            response = await axios.get(`${url}/student/v2/getUserById/${userId}`, {
                withCredentials: true
            });
            userData = response.data.user;
        } catch (studentError) {
            try {
                // Try faculty endpoint
                response = await axios.get(`${url}/faculty/v2/getUserById/${userId}`, {
                    withCredentials: true
                });
                userData = response.data.user;
            } catch (facultyError) {
                try {
                    // Try alumni endpoint
                    response = await axios.get(`${url}/alumni/v2/getUserById/${userId}`, {
                        withCredentials: true
                    });
                    userData = response.data.user;
                } catch (alumniError) {
                    try {
                        // Try director endpoint
                        response = await axios.get(`${url}/director/v2/getUserById/${userId}`, {
                            withCredentials: true
                        });
                        userData = response.data.user;
                    } catch (directorError) {
                        // Try the general user endpoint as fallback
                        try {
                            response = await axios.get(`${url}/student/v2/getUserById/${userId}`, {
                                withCredentials: true
                            });
                            userData = response.data.user;
                        } catch (generalError) {
                            throw new Error('User not found');
                        }
                    }
                }
            }
        }

        if (!userData) {
          throw new Error('User data not available');
        }

        // Format the user data for display
        const formattedData = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profileImage: userData.profileImage,
          college: userData.college,
          isOnline: userData.isOnline,
          lastSeen: userData.lastSeen,
          userInfo: {
            bio: userData.userInfo?.bio || '',
            skills: userData.userInfo?.skills || [],
            address: userData.userInfo?.address || '',
            social: userData.userInfo?.social || {},
            id: userData.userInfo?._id
          },
          // Role-specific data
          alumniDetails: userData.alumniDetails,
          facultyDetails: userData.facultyDetails,
          directorDetails: userData.directorDetails
        };

        setProfileData(formattedData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(error.message || 'Failed to load profile');
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Student':
        return <User size={20} className="text-blue-500" />;
      case 'Faculty':
        return <Building size={20} className="text-indigo-500" />;
      case 'Alumni':
        return <GraduationCap size={20} className="text-green-500" />;
      case 'Director':
        return <Crown size={20} className="text-purple-500" />;
      default:
        return <User size={20} className="text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Student':
        return 'bg-blue-100 text-blue-800';
      case 'Faculty':
        return 'bg-indigo-100 text-indigo-800';
      case 'Alumni':
        return 'bg-green-100 text-green-800';
      case 'Director':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleMessage = () => {
    // Navigate to chat with this user
    navigate(`/chat/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Available</h2>
          <p className="text-gray-600 mb-4">This profile is not available for viewing.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {currentUser && currentUser._id !== profileData._id && (
                <button
                  onClick={handleMessage}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare size={16} />
                  <span>Message</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profileData.profileImage || '/default-avatar.png'}
                  alt={profileData.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                {profileData.isOnline && (
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{profileData.name}</h1>
                  {getRoleIcon(profileData.role)}
                </div>
                
                <div className="flex items-center space-x-4 text-blue-100">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileData.role)}`}>
                    {profileData.role}
                  </span>
                  
                  {profileData.college?.name && (
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{profileData.college.name}</span>
                    </div>
                  )}
                </div>
                
                {!profileData.isOnline && profileData.lastSeen && (
                  <p className="text-blue-100 text-sm mt-2">
                    Last seen {formatLastSeen(profileData.lastSeen)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                {profileData.userInfo?.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                    <p className="text-gray-600 leading-relaxed">{profileData.userInfo.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {profileData.userInfo?.skills && profileData.userInfo.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.userInfo.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Role-specific Information */}
                {profileData.role === 'Alumni' && profileData.alumniDetails && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional Information</h3>
                    <div className="space-y-3">
                      {profileData.alumniDetails.currentCompany && (
                        <div className="flex items-center space-x-2">
                          <Building size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            <span className="font-medium">Company:</span> {profileData.alumniDetails.currentCompany}
                          </span>
                        </div>
                      )}
                      {profileData.alumniDetails.jobTitle && (
                        <div className="flex items-center space-x-2">
                          <Award size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            <span className="font-medium">Position:</span> {profileData.alumniDetails.jobTitle}
                          </span>
                        </div>
                      )}
                      {profileData.alumniDetails.graduationYear && (
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            <span className="font-medium">Graduated:</span> {profileData.alumniDetails.graduationYear}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {profileData.role === 'Faculty' && profileData.facultyDetails && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Faculty Information</h3>
                    <div className="space-y-3">
                      {profileData.facultyDetails.department && (
                        <div className="flex items-center space-x-2">
                          <BookOpen size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            <span className="font-medium">Department:</span> {profileData.facultyDetails.department}
                          </span>
                        </div>
                      )}
                      {profileData.facultyDetails.designation && (
                        <div className="flex items-center space-x-2">
                          <Award size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            <span className="font-medium">Designation:</span> {profileData.facultyDetails.designation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {profileData.role === 'Director' && profileData.directorDetails && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Director Information</h3>
                    <div className="space-y-3">
                      {profileData.directorDetails.directorRole && (
                        <div className="flex items-center space-x-2">
                          <Crown size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            <span className="font-medium">Role:</span> {profileData.directorDetails.directorRole}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-gray-600">{profileData.email}</span>
                    </div>
                    
                    {profileData.userInfo?.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-gray-600">{profileData.userInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {profileData.userInfo?.social && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h3>
                    <div className="space-y-3">
                      {profileData.userInfo.social.linkedin && (
                        <a
                          href={profileData.userInfo.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Linkedin size={16} />
                          <span>LinkedIn</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                      
                      {profileData.userInfo.social.github && (
                        <a
                          href={profileData.userInfo.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <Github size={16} />
                          <span>GitHub</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                      
                      {profileData.userInfo.social.portfolio && (
                        <a
                          href={profileData.userInfo.social.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-600 hover:text-purple-600 transition-colors"
                        >
                          <Globe size={16} />
                          <span>Portfolio</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {profileData.userInfo?.social?.projects && profileData.userInfo.social.projects.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Projects</h3>
                    <div className="space-y-2">
                      {profileData.userInfo.social.projects.map((project, index) => (
                        <div key={index} className="text-gray-600 text-sm">
                          • {project}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile; 