const mongoose = require("mongoose");
const Alumni = require("../models/Alumni.models");
const User = require("../models/User.models");
const College = require("../models/College.models");
const bcrypt = require("bcrypt");
const uploadOnCloudinary = require("../config/Cloudinary.config");

exports.signup = async (req, res) => {
    try {
        const { name, email, password, imageUrl, role, college } = req.body;
        const image = req.file;
        // Validate required fields
        if (!name || !email || !password || !college ) {
            return res.status(400).json({ message: 'Please provide all required fields: name, email, password, college, bio, and skills' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        console.log("Existing User:", existingUser);

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if the college exists, otherwise create a new one
        let collegeRecord = await College.findOne({ name: college });

        if (!collegeRecord) {
            collegeRecord = new College({
                name: college,
                location,
                departments,
                website
            });
            await collegeRecord.save();
        }

        // Upload image to Cloudinary if file exists
        let profileImage = imageUrl;
        if (!profileImage && image) {
            const uploadedImage = await uploadOnCloudinary(image.path, 'campus');
            profileImage = uploadedImage.secure_url;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new User
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImage,
            role,
            college: collegeRecord._id,
        });
        await newUser.save();
        console.log("New User:", newUser);

        res.status(201).json({ message: 'Alumni created successfully', user: newUser });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

