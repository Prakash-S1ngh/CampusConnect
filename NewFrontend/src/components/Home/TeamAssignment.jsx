import React, { useState, useEffect, useContext } from 'react';
import { 
    Users, 
    Trophy, 
    Calendar, 
    Award,
    CheckCircle,
    Clock,
    AlertCircle,
    User,
    MessageSquare
} from 'lucide-react';
import { StudentContext } from '../Student/StudentContextProvider';
import { url } from '../../lib/PostUrl';
import axios from 'axios';
// import { toast } from 'react-hot-toast';
import toast, { Toaster } from 'react-hot-toast';

const TeamAssignment = () => {
    const { user } = useContext(StudentContext);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamAssignments();
    }, [user]);

    // Listen for real-time team assignment updates
    useEffect(() => {
        if (!user || !user._id) return;

        const handleTeamAssignment = (data) => {
            console.log('Real-time team assignment received:', data);
            toast.success(`🎉 You've been assigned to team "${data.teamName}" for "${data.bountyTitle}"!`);
            fetchTeamAssignments(); // Refresh the team list
        };

        // Listen for team assignment events
        const socket = window.socket || window.io?.();
        if (socket) {
            socket.on(`team:assignment:${user._id}`, handleTeamAssignment);
        }

        return () => {
            if (socket) {
                socket.off(`team:assignment:${user._id}`, handleTeamAssignment);
            }
        };
    }, [user]);

    const fetchTeamAssignments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/student/v2/getTeams`, {
                withCredentials: true
            });

            if (response.data.success) {
                setTeams(response.data.participation || []);
            }
        } catch (error) {
            console.error('Error fetching team assignments:', error);
            toast.error('Failed to load team assignments');
        } finally {
            setLoading(false);
        }
    };

    const getTeamStatus = (team) => {
        if (team.isApproved) return { status: 'Approved', color: 'text-green-600 bg-green-100', icon: <CheckCircle size={16} /> };
        if (team.submittedAt) return { status: 'Pending Approval', color: 'text-yellow-600 bg-yellow-100', icon: <Clock size={16} /> };
        return { status: 'Active', color: 'text-blue-600 bg-blue-100', icon: <AlertCircle size={16} /> };
    };

    const formatTimeLeft = (deadline) => {
        if (!deadline) return "No deadline";
        
        try {
            const diff = new Date(deadline) - new Date();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (diff < 0) return "Ended";
            if (days > 0) return `${days}d ${hours}h left`;
            return `${hours}h left`;
        } catch (error) {
            return "Invalid deadline";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading team assignments...</span>
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Team Assignments</h3>
                <p className="text-gray-500 mb-4">You haven't been assigned to any teams yet.</p>
                <button
                    onClick={() => window.location.href = '/bounty'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Join a Bounty
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Your Team Assignments</h2>
                <span className="text-sm text-gray-500">{teams.length} team(s)</span>
            </div>

            <div className="grid gap-6">
                {teams.map((team, index) => {
                    const teamStatus = getTeamStatus(team);
                    const isExpired = team.bounty?.deadline && new Date(team.bounty.deadline) < new Date();
                    
                    return (
                        <div 
                            key={team._id || index} 
                            className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${
                                isExpired ? 'opacity-60' : ''
                            }`}
                        >
                            {/* Team Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-100 rounded-full p-2">
                                        <Users size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{team.teamName}</h3>
                                        <p className="text-sm text-gray-600">{team.bounty?.title || 'Unknown Bounty'}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${teamStatus.color}`}>
                                    {teamStatus.icon}
                                    <span>{teamStatus.status}</span>
                                </span>
                            </div>

                            {/* Bounty Details */}
                            {team.bounty && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Trophy className="text-yellow-500" size={16} />
                                            <div>
                                                <p className="text-sm font-medium">{team.bounty.title}</p>
                                                <p className="text-xs text-gray-600">{team.bounty.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Award className="text-green-500" size={16} />
                                            <div>
                                                <p className="text-sm font-medium">₹{team.bounty.amount}</p>
                                                <p className="text-xs text-gray-600">Reward</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="text-red-500" size={16} />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {formatTimeLeft(team.bounty.deadline)}
                                                </p>
                                                <p className="text-xs text-gray-600">Deadline</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Team Members */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members ({team.members?.length || 0})</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {team.members?.map((member, memberIndex) => (
                                        <div key={member._id || memberIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                            <img
                                                src={member.profileImage || '/default-avatar.png'}
                                                alt={member.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {member.name || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {member.role || 'Member'}
                                                </p>
                                            </div>
                                            {member._id === user._id && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Actions */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>Team ID: {team._id}</span>
                                        {team.submittedAt && (
                                            <span>Submitted: {new Date(team.submittedAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => window.location.href = `/team-panel`}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                                        >
                                            <MessageSquare size={14} />
                                            <span>Team Chat</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamAssignment; 