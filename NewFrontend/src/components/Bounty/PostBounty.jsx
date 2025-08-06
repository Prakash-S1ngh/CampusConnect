import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { url } from '../../lib/PostUrl';

const PostBounty = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    description: '',
    amount: '',
    deadline: '',
    difficulty: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim());
      
      // Ensure deadline is properly formatted
      const deadlineDate = new Date(formData.deadline);
      console.log('Deadline being sent:', formData.deadline);
      console.log('Deadline as Date object:', deadlineDate);
      
      const res = await axios.post(`${url}/bounty/v2/createBounty`, {
        ...formData,
        tags: tagsArray,
        deadline: deadlineDate.toISOString(), // Send as ISO string
      },
    {
      withCredentials: true,
    });
      if (res.data.success) {
        alert('Bounty posted!');
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Error posting bounty');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg relative">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Post a Bounty</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" onChange={handleChange} value={formData.title} placeholder="Title" required className="w-full p-2 border rounded" />
          <input name="tags" onChange={handleChange} value={formData.tags} placeholder="Tags (comma-separated)" className="w-full p-2 border rounded" />
          <textarea name="description" onChange={handleChange} value={formData.description} placeholder="Description" required className="w-full p-2 border rounded" />
          <input name="amount" type="number" onChange={handleChange} value={formData.amount} placeholder="Reward Amount" required className="w-full p-2 border rounded" />
          <input 
            name="deadline" 
            type="date" 
            onChange={handleChange} 
            value={formData.deadline} 
            min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
            required 
            className="w-full p-2 border rounded" 
          />

          <select name="difficulty" onChange={handleChange} value={formData.difficulty} required className="w-full p-2 border rounded">
            <option value="">Select Difficulty</option>
            <option value="Basic">Basic</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advance">Advance</option>
          </select>

          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Submit Bounty
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostBounty;