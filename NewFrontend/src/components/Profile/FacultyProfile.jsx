import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  MapPin, 
  Clock, 
  BookOpen, 
  Award, 
  Users, 
  ExternalLink,
  GraduationCap,
  Building,
  Star,
  Calendar,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { url } from '../../lib/PostUrl';
import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';
import toast, { Toaster } from 'react-hot-toast';



const FacultyProfile = () => {

  const [facultyData, setFacultyData] = useState({
    name: "Faculty Name",
    title: "Professor", // e.g., "Assistant Professor", "Ph.D. Scholar", "Temporary Faculty"
    department: "Department Name",
    expertise: ["Research Area 1", "Research Area 2", "Research Area 3"],
    officeLocation: "Building / Room Number",
    contactEmail: "faculty@example.com",
    researchInterests: ["Interest 1", "Interest 2", "Interest 3"],
    publications: [
      {
        title: "Sample Publication Title",
        journal: "Sample Journal",
        year: 2023,
        link: "#"
      }
    ],
    teachingSubjects: ["Subject 1", "Subject 2", "Subject 3"],
    officeHours: {
      from: "09:00 AM",
      to: "12:00 PM"
    },
    achievements: ["Achievement 1", "Achievement 2", "Achievement 3"],
    guidance: {
      phd: 0,
      mtech: 0,
      btech: 0
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await axios.get(`${url}/faculty/v2/getinfo`, {
          withCredentials: true
        });
        console.log("Fetched faculty data:", response.data);
        if (response.data.success) {
          setFacultyData(response.data.faculty);

          setEditData(response.data.faculty);

        }
        
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setFacultyData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyData();
  }, []);

  const handleEditToggle = () => {
    if (!editMode) {
      setEditData({ ...facultyData });
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleArrayAdd = (field, defaultValue = '') => {
    setEditData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultValue]
    }));
  };

  const handleArrayRemove = (field, index) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handlePublicationChange = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      publications: prev.publications.map((pub, i) => 
        i === index ? { ...pub, [field]: value } : pub
      )
    }));
  };

  const handleOfficeHoursChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      officeHours: {
        ...prev.officeHours,
        [field]: value
      }
    }));
  };

  const handleGuidanceChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      guidance: {
        ...prev.guidance,
        [field]: parseInt(value) || 0
      }
    }));
  };

  const updateFacultyProfile = async () => {
    setSaving(true);
    try {
      const facultyId = facultyData._id || "your-faculty-id";
      const response = await axios.put(
        `${url}/faculty/v2/updateinfo`,
        editData,
        {
          withCredentials: true
        }
      );
      setFacultyData(editData);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating faculty profile:", error);
      toast.error("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading faculty profile...</p>
        </div>
      </div>
    );
  }

  const getField = (field, fallback = 'N/A') => {
    return field ? field : fallback;
  };

  const getArrayField = (arr) => {
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  };

  const currentData = editMode ? editData : facultyData;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 relative">
      <Toaster position="top-right" />
      
      {/* Edit Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        {!editMode ? (
          <button
            onClick={handleEditToggle}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Edit3 className="w-5 h-5" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={updateFacultyProfile}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleEditToggle}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className={`bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl ${editMode ? 'ring-4 ring-blue-300' : ''}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
            <img src ={currentData?.profileImage} alt="Faculty Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex-1">
            {editMode ? (
              <input
                type="text"
                value={currentData?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-4xl font-bold mb-2 bg-transparent border-b-2 border-blue-300 text-white placeholder-blue-200 focus:outline-none focus:border-white w-full"
                placeholder="Faculty Name"
              />
            ) : (
              <h1 className="text-4xl font-bold mb-2">{currentData?.name}</h1>
            )}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {editMode ? (
                <select
                  value={currentData?.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="Professor">Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Scholar">Scholar</option>
                  <option value="PhD">PhD</option>
                  <option value="Temporary Professor">Temporary Professor</option>
                </select>
              ) : (
                <span className="bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {currentData?.title}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                {editMode ? (
                  <input
                    type="text"
                    value={currentData?.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="bg-transparent border-b border-blue-300 text-blue-100 placeholder-blue-200 focus:outline-none focus:border-white"
                    placeholder="Department"
                  />
                ) : (
                  <span className="text-blue-100">{currentData?.department}</span>
                )}
              </div>
            </div>
            {editMode ? (
              <div className="space-y-2">
                <p className="text-sm text-blue-200">Expertise Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {currentData?.expertise?.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-600 bg-opacity-70 px-3 py-1 rounded-full text-xs">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                        className="bg-transparent text-white placeholder-blue-200 focus:outline-none min-w-0 flex-1"
                      />
                      <button
                        onClick={() => handleArrayRemove('expertise', index)}
                        className="text-blue-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleArrayAdd('expertise', 'New Expertise')}
                    className="bg-blue-600 bg-opacity-70 px-3 py-1 rounded-full text-xs hover:bg-opacity-90 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentData?.expertise?.slice(0, 3).map((skill, index) => (
                  <span key={index} className="bg-blue-600 bg-opacity-70 px-3 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
                {currentData?.expertise?.length > 3 && (
                  <span className="bg-blue-600 bg-opacity-70 px-3 py-1 rounded-full text-xs">
                    +{currentData.expertise.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Office Information */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${editMode ? 'ring-2 ring-blue-200' : ''}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Contact & Office
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  {editMode ? (
                    <input
                      type="email"
                      value={currentData?.email || ''}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{currentData?.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Office Location</p>
                  {editMode ? (
                    <input
                      type="text"
                      value={currentData?.officeLocation || ''}
                      onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                      className="font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-green-500 w-full"
                    />
                  ) : (
                    <p className="font-semibold text-gray-800">{currentData?.officeLocation}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg md:col-span-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Office Hours</p>
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentData?.officeHours?.from || ''}
                        onChange={(e) => handleOfficeHoursChange('from', e.target.value)}
                        className="font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-purple-500 w-24"
                        placeholder="From"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        value={currentData?.officeHours?.to || ''}
                        onChange={(e) => handleOfficeHoursChange('to', e.target.value)}
                        className="font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-purple-500 w-24"
                        placeholder="To"
                      />
                    </div>
                  ) : (
                    <p className="font-semibold text-gray-800">
                      {currentData?.officeHours?.from} - {currentData?.officeHours?.to}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Research Interests */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${editMode ? 'ring-2 ring-blue-200' : ''}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              Research Interests
            </h2>
            {editMode ? (
              <div className="space-y-3">
                {currentData?.researchInterests?.map((interest, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={interest}
                      onChange={(e) => handleArrayChange('researchInterests', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => handleArrayRemove('researchInterests', index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleArrayAdd('researchInterests', 'New Research Interest')}
                  className="flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Research Interest
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {currentData?.researchInterests?.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Teaching Subjects */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${editMode ? 'ring-2 ring-blue-200' : ''}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-orange-600" />
              Teaching Subjects
            </h2>
            {editMode ? (
              <div className="space-y-3">
                {currentData?.teachingSubjects?.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => handleArrayChange('teachingSubjects', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={() => handleArrayRemove('teachingSubjects', index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleArrayAdd('teachingSubjects', 'New Subject')}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Teaching Subject
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentData?.teachingSubjects?.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-orange-50 border border-orange-200 p-4 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <p className="font-semibold text-orange-800">{subject}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publications */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${editMode ? 'ring-2 ring-blue-200' : ''}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Recent Publications
            </h2>
            {editMode ? (
              <div className="space-y-4">
                {currentData?.publications?.map((pub, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-700">Publication {index + 1}</h4>
                      <button
                        onClick={() => handleArrayRemove('publications', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={pub.title}
                      onChange={(e) => handlePublicationChange(index, 'title', e.target.value)}
                      placeholder="Publication Title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={pub.journal}
                      onChange={(e) => handlePublicationChange(index, 'journal', e.target.value)}
                      placeholder="Journal Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={pub.year}
                        onChange={(e) => handlePublicationChange(index, 'year', parseInt(e.target.value))}
                        placeholder="Year"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="url"
                        value={pub.link}
                        onChange={(e) => handlePublicationChange(index, 'link', e.target.value)}
                        placeholder="Publication Link"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => handleArrayAdd('publications', { title: '', journal: '', year: new Date().getFullYear(), link: '' })}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Publication
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentData?.publications?.map((pub, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">{pub.title}</h3>
                        <p className="text-gray-600 text-sm mb-1">{pub.journal}</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500 text-sm">{pub.year}</span>
                        </div>
                      </div>
                      <a
                        href={pub.link}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Student Guidance Stats */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${editMode ? 'ring-2 ring-blue-200' : ''}`}>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Student Guidance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-medium text-gray-700">PhD Students</span>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={currentData?.guidance?.phd || 0}
                    onChange={(e) => handleGuidanceChange('phd', e.target.value)}
                    className="text-2xl font-bold text-red-600 bg-transparent border-b border-red-300 focus:outline-none focus:border-red-500 w-16 text-center"
                  />
                ) : (
                  <span className="text-2xl font-bold text-red-600">{currentData?.guidance?.phd}</span>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="font-medium text-gray-700">M.Tech Students</span>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={currentData?.guidance?.mtech || 0}
                    onChange={(e) => handleGuidanceChange('mtech', e.target.value)}
                    className="text-2xl font-bold text-yellow-600 bg-transparent border-b border-yellow-300 focus:outline-none focus:border-yellow-500 w-16 text-center"
                  />
                ) : (
                  <span className="text-2xl font-bold text-yellow-600">{currentData?.guidance?.mtech}</span>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">B.Tech Students</span>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={currentData?.guidance?.btech || 0}
                    onChange={(e) => handleGuidanceChange('btech', e.target.value)}
                    className="text-2xl font-bold text-blue-600 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 w-16 text-center"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">{currentData?.guidance?.btech}</span>
                )}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${editMode ? 'ring-2 ring-blue-200' : ''}`}>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Achievements
            </h2>
            {editMode ? (
              <div className="space-y-3">
                {currentData?.achievements?.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => handleArrayChange('achievements', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      onClick={() => handleArrayRemove('achievements', index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleArrayAdd('achievements', 'New Achievement')}
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentData?.achievements?.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expertise Tags */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${editMode ? 'ring-2 ring-blue-200' : ''}`}>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Areas of Expertise</h2>
            {editMode ? (
              <div className="space-y-3">
                {currentData?.expertise?.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                      onClick={() => handleArrayRemove('expertise', index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleArrayAdd('expertise', 'New Expertise')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Expertise
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentData?.expertise?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;