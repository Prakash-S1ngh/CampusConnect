import React, { useContext, useEffect, useState } from 'react';
import { Search, Filter, Clock, Users, Briefcase } from 'lucide-react';
import axios from 'axios';
import { url } from '../../lib/PostUrl';
import PostBounty from './PostBounty';
import { StudentContext } from '../Student/StudentContextProvider';
import toast from 'react-hot-toast';
import "react-toastify/dist/ReactToastify.css";

const difficultyColors = {
    "Beginner": "bg-green-100 text-green-800",
    "Intermediate": "bg-blue-100 text-blue-800",
    "Advanced": "bg-orange-100 text-orange-800"
};

const BountyBoard = () => {
    const { socket } = useContext(StudentContext);
    const [bounties, setBounties] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const [bountyId, setBountyId] = useState(null);

    useEffect(() => {
        if (!bountyId) return;

        const listener = ({ count }) => {
            setParticipantCount(count);
        };

        socket.on(`bounty:participants:${bountyId}`, listener);

        return () => {
            socket.off(`bounty:participants:${bountyId}`, listener);
        };
    }, [bountyId]);

    useEffect(() => {
        if (!socket || !bounties.length) return;
        const listeners = [];

        bounties.forEach((bounty) => {
            const eventKey = `bounty:participants:${bounty.bountyId}`;

            const handler = (data) => {
                setBounties(prev =>
                    prev.map(b =>
                        b.bountyId === bounty.bountyId ? { ...b, totalParticipants: data.count } : b
                    )
                );
            };

            socket.on(eventKey, handler);
            listeners.push({ eventKey, handler });
        });

        return () => {
            listeners.forEach(({ eventKey, handler }) => {
                socket.off(eventKey, handler);
            });
        };
    }, [socket, bounties]);

    useEffect(() => {
        socket.on("newBounty", (newBounty) => {
            setBounties((prevBounties) => [newBounty, ...prevBounties]);
            toast.success("New bounty posted!");
        });

        return () => {
            socket.off("newBounty");
        };
    }, [socket]);

    useEffect(() => {
        const fetchBounty = async () => {
            try {
                const response = await axios.get(`${url}/bounty/v2/getBounty`, {
                    withCredentials: true
                });
                setBounties(response.data.bounties);
            } catch (error) {
                console.error("Error fetching bounties:", error);
                toast.error("Failed to fetch bounties.");
            }
        };

        fetchBounty();
    }, []);

    const applyHandler = async (bountyId) => {
        try {
            console.log(`[FRONTEND] Applying for bounty: ${bountyId}`);
            const response = await axios.post(
                `${url}/bounty/v2/applying/${bountyId}`,
                {},
                { withCredentials: true }
            );

            const { message, teamsFormed, remainingUsers } = response.data;
            console.log(`[FRONTEND] Application response:`, response.data);
            
            if (teamsFormed > 0) {
                toast.success(`${message} ${teamsFormed} team(s) formed!`);
            } else {
                toast.success(message || "Applied successfully!");
            }
        } catch (error) {
            console.error("Error applying for bounty:", error.response);
            const message = error.response?.data?.message || "Failed to apply";
            toast.error(message);
        }
    };

    const handleDelete = async (bountyId) => {
        try {
            await axios.delete(`${url}/bounty/v2/deleteBounty/${bountyId}`, {
                withCredentials: true
            });
            setBounties(prev => prev.filter(bounty => bounty.bountyId !== bountyId));
            toast.success("Bounty deleted successfully!");
        } catch (error) {
            console.error("Failed to delete bounty:", error);
            toast.error("Failed to delete bounty.");
        }
    };

    const allTags = [...new Set(bounties.flatMap(bounty => bounty.tags || []))];

    const filteredBounties = bounties.filter((bounty) => {
        const matchesSearch =
            bounty.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bounty.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTags =
            selectedTags.length === 0 || selectedTags.every((tag) => bounty.tags?.includes(tag));

        return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
        const daysA = a.daysLeft || 0;
        const daysB = b.daysLeft || 0;

        const isExpiredA = daysA <= 0;
        const isExpiredB = daysB <= 0;

        return isExpiredA - isExpiredB;
    });

    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Helper function to check if bounty is expired
    const isExpired = (bounty) => {
        return (bounty.daysLeft || 0) <= 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-indigo-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">BountyBoard</h1>
                            <p className="text-indigo-200">Find freelance opportunities and bounties</p>
                        </div>
                        <div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center"
                            >
                                <Briefcase className="mr-2 h-5 w-5" />
                                Post Bounty
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search bounties..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {allTags.slice(0, 12).map((tag, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTags.includes(tag)
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBounties.map((bounty) => {
                        const expired = isExpired(bounty);
                        
                        return (
                            <div 
                                key={bounty.bountyId} 
                                className={`bg-white rounded-xl shadow-md overflow-hidden relative ${
                                    expired ? 'opacity-60' : ''
                                }`}
                            >
                                {/* Expired overlay */}
                                {expired && (
                                    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-sm font-medium z-10">
                                        EXPIRED
                                    </div>
                                )}
                                
                                <div className={`p-6 ${expired ? 'pt-8' : ''}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold ${expired ? 'text-gray-500' : 'text-gray-900'}`}>
                                                {bounty.title}
                                            </h3>
                                            <div className={`flex items-center text-sm mt-1 ${expired ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <Clock className="h-4 w-4 mr-1" />
                                                <span>{bounty.postedAgo || 'Recently'}</span>
                                                <span className="mx-2">•</span>
                                                <span>{bounty.deadline || 'N/A'}</span>
                                                {expired && (
                                                    <>
                                                        <span className="mx-2">•</span>
                                                        <span className="text-red-500 font-medium">Expired</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`font-bold text-lg ${expired ? 'text-gray-400' : 'text-indigo-600'}`}>
                                            {bounty.amount}
                                        </div>
                                    </div>

                                    <p className={`text-sm mb-4 ${expired ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {bounty.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {bounty.tags?.map((tag, index) => (
                                            <span 
                                                key={index} 
                                                className={`px-2 py-1 rounded-md text-xs ${
                                                    expired 
                                                        ? 'bg-gray-100 text-gray-500' 
                                                        : 'bg-indigo-50 text-indigo-700'
                                                }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <div className="flex items-center">
                                            {bounty.profileImage ? (
                                                <img
                                                    src={bounty.profileImage}
                                                    alt="profile"
                                                    className={`w-8 h-8 rounded-full object-cover ${expired ? 'grayscale' : ''}`}
                                                />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                                    expired 
                                                        ? 'bg-gray-200 text-gray-500' 
                                                        : 'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                    {bounty.creator?.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <span className={`ml-2 text-sm ${expired ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {bounty.createdBy || 'Unknown'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center text-sm ${expired ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <Users className="h-4 w-4 mr-1" />
                                                <span>{bounty.totalParticipants}</span>
                                                <span className="ml-1 text-xs">participants</span>
                                            </div>
                                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                expired 
                                                    ? 'bg-gray-100 text-gray-500'
                                                    : difficultyColors[bounty.difficulty] || 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {bounty.difficulty || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-6 py-3 flex justify-between gap-2 ${expired ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                    <button 
                                        onClick={() => !expired && applyHandler(bounty.bountyId)} 
                                        disabled={expired}
                                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                            expired 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                        title={expired ? 'This bounty has expired' : 'Apply for this bounty'}
                                    >
                                        {expired ? 'Expired' : 'Apply Now'}
                                    </button>
                                    <button
                                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                            expired 
                                                ? 'bg-gray-400 text-gray-600 hover:bg-gray-500' 
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                        }`}
                                        onClick={() => handleDelete(bounty.bountyId)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && <PostBounty isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default BountyBoard;