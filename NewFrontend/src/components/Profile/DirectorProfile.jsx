import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { toast } from 'react-hot-toast';
import toast, { Toaster } from 'react-hot-toast';

const DirectorProfile = () => {
    const [director, setDirector] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        expertise: [],
        officeLocation: '',
        contactEmail: '',
        researchInterests: [],
        publications: [],
        teachingSubjects: [],
        officeHours: { from: '', to: '' },
        achievements: [],
        guidance: { phd: 0, mtech: 0, btech: 0 },
        directorRole: '',
        managedDepartments: []
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDirectorInfo();
    }, []);

    const fetchDirectorInfo = async () => {
        try {
            const response = await axios.get('/director/v2/info', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDirector(response.data.director);
            setFormData({
                title: response.data.director.title || '',
                department: response.data.director.department || '',
                expertise: response.data.director.expertise || [],
                officeLocation: response.data.director.officeLocation || '',
                contactEmail: response.data.director.contactEmail || '',
                researchInterests: response.data.director.researchInterests || [],
                publications: response.data.director.publications || [],
                teachingSubjects: response.data.director.teachingSubjects || [],
                officeHours: response.data.director.officeHours || { from: '', to: '' },
                achievements: response.data.director.achievements || [],
                guidance: response.data.director.guidance || { phd: 0, mtech: 0, btech: 0 },
                directorRole: response.data.director.directorRole || '',
                managedDepartments: response.data.director.managedDepartments || []
            });
        } catch (error) {
            console.error('Error fetching director info:', error);
            toast.error('Failed to fetch director information');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayInputChange = (field, value) => {
        const items = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({
            ...prev,
            [field]: items
        }));
    };

    const handleOfficeHoursChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            officeHours: {
                ...prev.officeHours,
                [field]: value
            }
        }));
    };

    const handleGuidanceChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            guidance: {
                ...prev.guidance,
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put('/director/v2/update', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Director information updated successfully');
            setIsEditing(false);
            fetchDirectorInfo(); // Refresh data
        } catch (error) {
            console.error('Error updating director info:', error);
            toast.error(error.response?.data?.message || 'Failed to update information');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-4">
                            <img 
                                src={director?.profileImage || '/default-avatar.png'} 
                                alt={director?.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{director?.name}</h1>
                                <p className="text-lg text-gray-600">{director?.email}</p>
                                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                                    {director?.directorRole || 'Director'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                {isEditing ? (
                                    <select
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Title</option>
                                        <option value="Director">Director</option>
                                        <option value="Associate Director">Associate Director</option>
                                        <option value="Assistant Director">Assistant Director</option>
                                        <option value="Dean">Dean</option>
                                        <option value="Associate Dean">Associate Dean</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-900">{director?.title || 'Not specified'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-gray-900">{director?.department || 'Not specified'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Director Role
                                </label>
                                {isEditing ? (
                                    <select
                                        value={formData.directorRole}
                                        onChange={(e) => handleInputChange('directorRole', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Campus Director">Campus Director</option>
                                        <option value="Department Director">Department Director</option>
                                        <option value="Academic Director">Academic Director</option>
                                        <option value="Administrative Director">Administrative Director</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-900">{director?.directorRole || 'Not specified'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Office Location
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.officeLocation}
                                        onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-gray-900">{director?.officeLocation || 'Not specified'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-gray-900">{director?.contactEmail || 'Not specified'}</p>
                                )}
                            </div>
                        </div>

                        {/* Office Hours and Guidance */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Office Hours
                                </label>
                                {isEditing ? (
                                    <div className="flex space-x-2">
                                        <input
                                            type="time"
                                            value={formData.officeHours.from}
                                            onChange={(e) => handleOfficeHoursChange('from', e.target.value)}
                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="self-center">to</span>
                                        <input
                                            type="time"
                                            value={formData.officeHours.to}
                                            onChange={(e) => handleOfficeHoursChange('to', e.target.value)}
                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-900">
                                        {director?.officeHours?.from && director?.officeHours?.to 
                                            ? `${director.officeHours.from} - ${director.officeHours.to}`
                                            : 'Not specified'
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Students Guided
                                </label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm">PhD:</label>
                                            <input
                                                type="number"
                                                value={formData.guidance.phd}
                                                onChange={(e) => handleGuidanceChange('phd', e.target.value)}
                                                className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm">M.Tech:</label>
                                            <input
                                                type="number"
                                                value={formData.guidance.mtech}
                                                onChange={(e) => handleGuidanceChange('mtech', e.target.value)}
                                                className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm">B.Tech:</label>
                                            <input
                                                type="number"
                                                value={formData.guidance.btech}
                                                onChange={(e) => handleGuidanceChange('btech', e.target.value)}
                                                className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-gray-900">PhD: {director?.guidance?.phd || 0}</p>
                                        <p className="text-gray-900">M.Tech: {director?.guidance?.mtech || 0}</p>
                                        <p className="text-gray-900">B.Tech: {director?.guidance?.btech || 0}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Arrays */}
                    <div className="mt-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expertise Areas
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.expertise.join(', ')}
                                    onChange={(e) => handleArrayInputChange('expertise', e.target.value)}
                                    placeholder="Enter expertise areas separated by commas"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {director?.expertise?.length > 0 ? (
                                        director.expertise.map((exp, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {exp}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No expertise areas specified</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Research Interests
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.researchInterests.join(', ')}
                                    onChange={(e) => handleArrayInputChange('researchInterests', e.target.value)}
                                    placeholder="Enter research interests separated by commas"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {director?.researchInterests?.length > 0 ? (
                                        director.researchInterests.map((interest, index) => (
                                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                {interest}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No research interests specified</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Managed Departments
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.managedDepartments.join(', ')}
                                    onChange={(e) => handleArrayInputChange('managedDepartments', e.target.value)}
                                    placeholder="Enter managed departments separated by commas"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {director?.managedDepartments?.length > 0 ? (
                                        director.managedDepartments.map((dept, index) => (
                                            <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                                {dept}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No departments specified</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Achievements
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.achievements.join(', ')}
                                    onChange={(e) => handleArrayInputChange('achievements', e.target.value)}
                                    placeholder="Enter achievements separated by commas"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {director?.achievements?.length > 0 ? (
                                        director.achievements.map((achievement, index) => (
                                            <p key={index} className="text-gray-900">• {achievement}</p>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No achievements specified</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DirectorProfile; 