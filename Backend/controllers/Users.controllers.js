const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const uploadOnCloudinary = require('../config/Cloudinary.config');
require('dotenv').config();

// Signup Controller
exports.signup = async (req, res) => {
    try {
        const { name, email, password, image , role, college, alumniDetails, userInfo } = req.body;

        // Validate input fields
        if (!name || !email || !password || !college || !image) {
            return res.status(400).json({ message: 'Please provide all required fields: name, email, password, and college' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const profileImage = await uploadOnCloudinary(image.path, 'campus');
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImage,
            role,
            college,
            alumniDetails,
            userInfo
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Update Login Controller to include additional fields
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Check if user exists
        const user = await User.findOne({ email }).populate('college alumniDetails userInfo');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
