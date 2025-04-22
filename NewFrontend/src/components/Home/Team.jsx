import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, User, Users, Award,
  ChevronDown, ChevronUp, Search,
  AlertCircle, Loader,
} from 'lucide-react';
import { url } from '../../lib/PostUrl';

const Team = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeamDetails();
  }, []);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/student/v2/getTeams`, {
        withCredentials: true,
      });
      console.log(response.data.participation);
      setParticipations(response.data.participation || []);
    } catch (error) {
      console.error('Error fetching team details:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipations = participations.filter(p =>
    p.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bounty?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpandedTeam(expandedTeam === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader className="animate-spin text-blue-600 w-12 h-12 mb-4" />
        <p className="text-lg text-gray-600">Loading team details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg">Error: {error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={fetchTeamDetails}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Team Participation Dashboard</h1>
        <p className="text-gray-600 mb-8">View all your bounty participations and team details</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by team or bounty name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={<Users size={24} className="text-blue-600" />}
            title="Total Teams"
            value={participations.length}
            color="bg-blue-100"
          />
          <StatsCard
            icon={<Award size={24} className="text-green-600" />}
            title="Bounties Joined"
            value={new Set(participations.map(p => p.bounty?._id)).size}
            color="bg-green-100"
          />
          <StatsCard
            icon={<User size={24} className="text-purple-600" />}
            title="Team Members"
            value={participations.reduce((sum, p) => sum + (p.members?.length || 0), 0)}
            color="bg-purple-100"
          />
        </div>

        {/* Teams List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Your Teams</h2>
          </div>

          {filteredParticipations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <PieChart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg">No team participations found</p>
              <p>You haven't joined any teams or bounties yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredParticipations.map((participation) => (
                <div key={participation._id} className="hover:bg-gray-50">
                  <div
                    className="px-6 py-4 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleExpand(participation._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Users size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{participation.teamName || 'Unnamed Team'}</h3>
                        <p className="text-sm text-gray-500">
                          {participation.bounty?.title || 'Unknown Bounty'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                        {participation.members?.length || 0} members
                      </span>
                      {expandedTeam === participation._id ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedTeam === participation._id && (
                    <div className="px-6 py-4 bg-gray-50 space-y-4">
                      {/* Bounty Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Bounty Details</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h3 className="font-medium">{participation.bounty?.title}</h3>
                          <p className="text-sm text-gray-600">{participation.bounty?.description}</p>
                        </div>
                      </div>

                      {/* Members */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Team Members</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {participation.members?.map((member) => (
                            <div key={member._id} className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                              <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden mr-3">
                                {member.profileImage ? (
                                  <img src={member.profileImage} alt={member.name}  className="w-full h-full object-cover" />
                                ) : (
                                  <User size={20} className="text-gray-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{member.name || 'Anonymous'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function StatsCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`rounded-full p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;