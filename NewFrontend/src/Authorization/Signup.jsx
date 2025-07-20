import React, { useState } from 'react';
import axios from 'axios';
import { Camera, AlertCircle, CheckCircle } from 'lucide-react';
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

  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadStatus, setImageUploadStatus] = useState('none'); // 'none', 'success', 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (!file) {
      toast.error("No file selected.");
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or GIF).");
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB.");
      return false;
    }
    
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setImageUploadStatus('none');
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, image: null, imageUrl: '' }));
      return;
    }

    // Validate image file
    if (!validateImageFile(file)) {
      setImageUploadStatus('error');
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, image: null, imageUrl: '' }));
      e.target.value = ''; // Clear the input
      return;
    }

    try {
      // Create image preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData((prev) => ({ ...prev, image: file, imageUrl: '' }));
      setImageUploadStatus('success');
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error creating image preview:", error);
      setImageUploadStatus('error');
      toast.error("Failed to process the image. Please try again.");
    }
  };

  const handleImageUrlChange = (e) => {
    const imageUrl = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: imageUrl, image: null }));
    
    if (imageUrl) {
      // Simple URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(imageUrl)) {
        setImageUploadStatus('error');
        toast.error("Please enter a valid image URL.");
        return;
      }
      
      // Test if the URL actually loads an image
      const img = new Image();
      img.onload = () => {
        setImagePreview(imageUrl);
        setImageUploadStatus('success');
        toast.success("Image URL validated successfully!");
      };
      img.onerror = () => {
        setImageUploadStatus('error');
        setImagePreview(null);
        toast.error("Failed to load image from URL. Please check the URL.");
      };
      img.src = imageUrl;
    } else {
      setImageUploadStatus('none');
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate image upload
    if (!formData.image && !formData.imageUrl) {
      toast.error("Please upload an image or provide an image URL.");
      setIsSubmitting(false);
      return;
    }

    if (imageUploadStatus === 'error') {
      toast.error("Please fix the image upload error before submitting.");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('college', formData.college);
    data.append('role', formData.role);

    if (formData.role === 'Student') {
      data.append('bio', formData.bio);
      data.append('skills', formData.skills);
    }

    if (formData.image) {
      data.append('image', formData.image);
    } else if (formData.imageUrl) {
      data.append('imageUrl', formData.imageUrl);
    }

    try {
      let endpoint = '';
      switch (formData.role) {
        case 'Student':
          endpoint = '/student/v2/signup';
          break;
        case 'Alumni':
          endpoint = '/alumni/v2/signup';
          break;
        case 'Faculty':
          endpoint = '/faculty/v2/signup';
          break;
        default:
          toast.error('Please select a valid role');
          setIsSubmitting(false);
          return;
      }

      console.log("Form Data:", `${url}${endpoint}`);
      const response = await axios.post(`${url}${endpoint}`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message);
      
      // Small delay to show the success message before navigation
      setTimeout(() => {
        navigate('/Login');
      }, 1500);
      
    } catch (error) {
      console.error("Signup error:", error);
      
      // Check if it's an image upload error specifically
      if (error.response?.data?.message?.toLowerCase().includes('image')) {
        toast.error("Image upload failed: " + (error.response?.data?.message || 'Please try again.'));
      } else {
        toast.error(error.response?.data?.message || 'An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const getImageUploadStatusIcon = () => {
    switch (imageUploadStatus) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500 absolute top-1 right-1" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 absolute top-1 right-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="relative max-w-lg w-full backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-[1.01] duration-300">

        {/* Circular Image Upload Button */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <label 
              htmlFor="image" 
              className={`w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 shadow-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden ${
                imageUploadStatus === 'success' ? 'border-green-400' : 
                imageUploadStatus === 'error' ? 'border-red-400' : 'border-blue-400'
              }`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Uploaded" className="w-full h-full object-cover rounded-full" />
              ) : (
                <Camera className={`w-8 h-8 ${
                  imageUploadStatus === 'error' ? 'text-red-500' : 'text-blue-500'
                }`} />
              )}
            </label>
            <input 
              type="file" 
              id="image" 
              name="image" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange} 
            />
            {getImageUploadStatusIcon()}
          </div>
          <p className="text-xs text-gray-300 text-center mt-2">
            Max 5MB • JPG, PNG, GIF
          </p>
        </div>

        <h2 className="text-3xl font-bold text-white text-center mt-10 mb-8">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField name="name" label="Full Name" type="text" onChange={handleChange} />
          <InputField name="email" label="Email Address" type="email" onChange={handleChange} />
          <InputField name="password" label="Password" type="password" onChange={handleChange} />
          <InputField name="college" label="College Name" type="text" onChange={handleChange} />


          {/* Role Dropdown */}
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
              <option value="Faculty" className="text-gray-900">Faculty</option>
            </select>
          </div>

          {/* Additional Fields for Students only */}
          {formData.role === 'Student' && (
            <>
              <InputField name="bio" label="Bio" type="text" onChange={handleChange} />
              <InputField name="skills" label="Skills (comma separated)" type="text" onChange={handleChange} />
            </>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting || imageUploadStatus === 'error'}
            className={`w-full rounded-lg px-4 py-3 font-medium transform transition-all duration-300 ${
              isSubmitting || imageUploadStatus === 'error'
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-[1.02] hover:shadow-lg'
            } text-white`}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>

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

// Reusable Input Component
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