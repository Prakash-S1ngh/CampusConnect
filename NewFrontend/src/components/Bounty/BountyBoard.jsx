import React, { useContext, useEffect, useState } from 'react';
import { Search, Filter, Clock, Users, Briefcase } from 'lucide-react';
import axios from 'axios';
import { url } from '../../lib/PostUrl';
import PostBounty from './PostBounty';
import { StudentContext } from '../Student/StudentContextProvider';
import toast from 'react-hot-toast'; // 👈 add toast import

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
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching bounties:", error);
                toast.error("Failed to fetch bounties.");
            }
        };

        fetchBounty();
    }, []);

    
    const applyHandler = async (bountyId) => {
        try {
            const response = await axios.post(
                `${url}/bounty/v2/applying/${bountyId}`,
                {}, // body is empty
                { withCredentials: true }
            );
    
            // 📦 Extract backend message
            const { message } = response.data;
    
            // ✅ Show success message
            toast.success(message || "Applied successfully!");
        } catch (error) {
            console.error("Error applying for bounty:", error);
    
            // ❌ Get proper error message from backend (safe check for structure)
            const message = error?.response?.data?.message || "Failed to apply for bounty.";
    
            // ❌ Show error toast
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

    const filteredBounties = bounties.filter(bounty => {
        const matchesSearch = bounty.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bounty.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTags = selectedTags.length === 0 ||
            selectedTags.every(tag => bounty.tags?.includes(tag));

        return matchesSearch && matchesTags;
    });

    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
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
                    {filteredBounties.map((bounty) => (
                        <div key={bounty.bountyId} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900">{bounty.title}</h3>
                                        <div className="flex items-center text-gray-500 text-sm mt-1">
                                            <Clock className="h-4 w-4 mr-1" />
                                            <span>{bounty.postedAgo || 'Recently'}</span>
                                            <span className="mx-2">•</span>
                                            <span>{bounty.deadline || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-lg text-indigo-600">{bounty.amount}</div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">{bounty.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {bounty.tags?.map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs">
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
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                                                {bounty.creator?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span className="ml-2 text-sm text-gray-600">{bounty.createdBy || 'Unknown'}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span>{bounty.participants || 0}</span>
                                        </div>
                                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColors[bounty.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                                            {bounty.difficulty || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-3 flex justify-between gap-2">
                                <button   onClick={() => applyHandler(bounty.bountyId)} className="w-full py-2 bg-indigo-600 text-white rounded-lg">
                                    Apply Now
                                </button>
                                <button
                                    className="w-full py-2 bg-red-600 text-white rounded-lg"
                                    onClick={() => handleDelete(bounty.bountyId)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && <PostBounty isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default BountyBoard;