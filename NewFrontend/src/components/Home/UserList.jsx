import React, { useState } from 'react';
import { Search, Filter, User, Mail, Building, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserList = ({ 
    users, 
    title, 
    loading = false, 
    emptyMessage = "No users found",
    userType = "users" // "students", "alumni", "faculty"
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const navigate = useNavigate();

    // Get unique departments and years for filtering
    const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
    const years = [...new Set(users.map(user => user.year).filter(Boolean))];

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = !filterDepartment || user.department === filterDepartment;
        const matchesYear = !filterYear || user.year === filterYear;

        return matchesSearch && matchesDepartment && matchesYear;
    });

    const getUserIcon = (role) => {
        switch (role) {
            case 'Student':
                return <User size={16} className="text-blue-500" />;
            case 'Alumni':
                return <GraduationCap size={16} className="text-green-500" />;
            case 'Faculty':
                return <Building size={16} className="text-purple-500" />;
            default:
                return <User size={16} className="text-gray-500" />;
        }
    };

    const getUserBadge = (role) => {
        switch (role) {
            case 'Student':
                return 'bg-blue-100 text-blue-800';
            case 'Alumni':
                return 'bg-green-100 text-green-800';
            case 'Faculty':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading {title}...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <span className="text-sm text-gray-500">{filteredUsers.length} {userType}</span>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={`Search ${userType}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Department Filter */}
                    {departments.length > 0 && (
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Year Filter */}
                    {years.length > 0 && (
                        <div className="relative">
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                    <User size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">{emptyMessage}</h3>
                    <p className="text-gray-500">
                        {searchTerm || filterDepartment || filterYear 
                            ? "Try adjusting your search or filters"
                            : `No ${userType} found in your network`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.userId || user._id}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleUserClick(user.userId || user._id)}
                        >
                            <div className="flex items-center space-x-4">
                                {/* Profile Image */}
                                <img
                                    src={user.profileImage || '/default-avatar.png'}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        {getUserIcon(user.role)}
                                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        {user.email && (
                                            <div className="flex items-center space-x-1">
                                                <Mail size={14} />
                                                <span>{user.email}</span>
                                            </div>
                                        )}
                                        
                                        {user.department && (
                                            <div className="flex items-center space-x-1">
                                                <Building size={14} />
                                                <span>{user.department}</span>
                                            </div>
                                        )}
                                        
                                        {user.year && (
                                            <span>Year {user.year}</span>
                                        )}
                                        
                                        {user.currentCompany && (
                                            <span>• {user.currentCompany}</span>
                                        )}
                                        
                                        {user.jobTitle && (
                                            <span>• {user.jobTitle}</span>
                                        )}
                                        
                                        {user.graduationYear && (
                                            <span>• Class of {user.graduationYear}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUserClick(user.userId || user._id);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserList; 