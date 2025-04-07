import React, { useState } from 'react';
import axios from 'axios';
import { Camera } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { url } from '../lib/PostUrl';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    role: '',
    image: null,
    imageUrl: '',
    bio: '',
    skills: ''
  });

  const [imagePreview, setImagePreview] = useState(null); // ✅ Store image preview
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file, imageUrl: '' })); // ✅ Clear imageUrl when uploading
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      console.log("Image is ", file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.image && !formData.imageUrl) {
      toast.error("Please upload an image or provide an image URL.");
      return;
    }
  
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('college', formData.college);
    data.append('role', formData.role);
    data.append('bio', formData.bio);
    data.append('skills', formData.skills);
  
    if (formData.image) {
      data.append('image', formData.image);
    } else if (formData.imageUrl) {
      data.append('imageUrl', formData.imageUrl);
    }
  
    // ✅ Debugging: Log FormData contents
    for (let pair of data.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  
    try {
      const response = await axios.post(`${url}/student/v2/signup`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      toast.success(response.data.message);
      navigate('/Login');
  
    } catch (error) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen w-full py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <ToastContainer />
      <div className="relative max-w-lg w-full backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-[1.01] duration-300">

        {/* Circular Image Upload Button */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <label htmlFor="image" className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-blue-400 shadow-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} alt="Uploaded" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Camera className="w-8 h-8 text-blue-500" />
            )}
          </label>
          <input type="file" id="image" name="image" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Form Heading */}
        <h2 className="text-3xl font-bold text-white text-center mt-10 mb-8">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField name="name" label="Full Name" type="text" onChange={handleChange} />
          <InputField name="email" label="Email Address" type="email" onChange={handleChange} />
          <InputField name="password" label="Password" type="password" onChange={handleChange} />
          <InputField name="college" label="College Name" type="text" onChange={handleChange} />

          {/* Role Select */}
          <div className="group relative">
            <select
              name="role"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              onChange={handleChange}
              defaultValue=""
            >
              <option value="" disabled className="text-gray-500">Select Role</option>
              <option value="Student" className="text-gray-900">Student</option>
              <option value="Alumni" className="text-gray-900">Alumni</option>
            </select>
          </div>

          {/* Additional UserInfo Fields for Students */}
          {formData.role === 'Student' && (
            <>
              <InputField name="bio" label="Bio" type="text" onChange={handleChange} />
              <InputField name="skills" label="Skills (comma separated)" type="text" onChange={handleChange} />
            </>
          )}

          {/* Image Upload OR URL */}
          <div className="flex flex-col space-y-4">
            <div className="text-center text-white">OR</div>
            <InputField
              name="imageUrl"
              label="Image URL (Optional)"
              type="text"
              onChange={(e) => {
                handleChange(e);

                // ✅ Check if the input is a valid URL
                const urlPattern = /^(http|https):\/\/[^ "]+$/;
                if (urlPattern.test(e.target.value)) {
                  setImagePreview(e.target.value); // ✅ Update preview only for valid URLs
                }
              }}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-4 py-3 font-medium transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
            Sign Up
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to='/Login' className="text-blue-400 hover:text-blue-300 transition-colors duration-300">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Field Component
const InputField = ({ name, label, type, onChange }) => (
  <div className="group relative">
    <input
      type={type}
      name={name}
      required
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 peer"
      placeholder=" "
      onChange={onChange}
    />
    <label className="absolute left-2 top-2 text-gray-400 transition-all duration-300 transform -translate-y-8 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-8 peer-focus:scale-75">
      {label}
    </label>
  </div>
);

export default SignupForm;