const { uploadOnCloudinary } = require("../config/Cloudinary.config");
const College = require("../models/College.models");
const Message = require("../models/Messages.models");
const User = require("../models/User.models");
const Director = require("../models/Director.model");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Director login
exports.loginDirector = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find director by email
        const director = await User.findOne({ email, role: 'Director' });
        if (!director) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, director.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token (you'll need to implement this based on your auth system)
        // For now, we'll return the user data
        return res.status(200).json({
            success: true,
            message: "Director logged in successfully",
            user: {
                _id: director._id,
                name: director.name,
                email: director.email,
                role: director.role,
                profileImage: director.profileImage,
                college: director.college
            }
        });

    } catch (error) {
        console.error("Error logging in director:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Director logout
exports.logoutDirector = async (req, res) => {
    try {
        // Clear session/token (implement based on your auth system)
        res.clearCookie('auth_token');
        
        return res.status(200).json({
            success: true,
            message: "Director logged out successfully"
        });
    } catch (error) {
        console.error("Error logging out director:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create a new director
exports.createDirector = async (req, res) => {
    try {
        const { name, email, password, college, directorRole } = req.body;
        const image = req.file;

        if (!name || !email || !password || !college || !directorRole) {
            return res.status(400).json({ message: "All required fields are missing" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const directorExists = await User.findOne({ email });
        if (directorExists) {
            return res.status(400).json({ message: "Director already exists with this email" });
        }

        const imageUrl = await uploadOnCloudinary(image.path);
        if (!imageUrl) {
            return res.status(500).json({ message: "Image upload failed" });
        }

        let collegeDoc = await College.findOne({ name: college });

        // Create college if not found
        if (!collegeDoc) {
            collegeDoc = new College({ name: college });
            await collegeDoc.save();
        }

        // Create director details
        const directorDetails = new Director({
            directorRole,
            department: '', // Directors manage entire campus
            title: 'Director'
        });
        await directorDetails.save();

        const newDirector = new User({
            name,
            email,
            password: hashedPassword,
            profileImage: imageUrl.url,
            role: 'Director',
            college: collegeDoc._id,
            directorDetails: directorDetails._id
        });

        await newDirector.save();

        return res.status(201).json({
            message: "Director created successfully",
            director: newDirector
        });

    } catch (error) {
        console.error("Error creating director:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get director connections (other directors and faculty in same campus)
exports.getDirectorConnections = async (req, res) => {
    try {
        const userId = req.userId;

        const loggedInUser = await User.findById(userId).select("college role");
        if (!loggedInUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userCollege = loggedInUser.college;

        // Get all directors and faculty from the same campus
        const connections = await User.find({
            college: userCollege,
            _id: { $ne: userId },
            role: { $in: ['Director', 'Faculty'] }
        }).select("name profileImage role");

        const result = connections.map(user => ({
            userId: user._id,
            name: user.name,
            profileImage: user.profileImage,
            role: user.role,
        }));

        return res.status(200).json({ success: true, users: result });
    } catch (error) {
        console.error("Error fetching director connections:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get director by ID
exports.getDirectorById = async (req, res) => {
    try {
        const id = req.userId;

        const director = await User.findById(id);
        if (!director) {
            return res.status(404).json({ message: 'Director not found' });
        }

        if (!director.directorDetails) {
            return res.status(200).json({
                success: true,
                message: 'No director details found for this director yet',
                director: director
            });
        }

        const directorInfo = await Director.findById(director.directorDetails);
    
        if (!directorInfo) {
            return res.status(404).json({ message: 'Director information not found' });
        }

        return res.status(200).json({
            success: true,
            director: {
                ...directorInfo.toObject(),
                name: director.name,
                email: director.email,
                profileImage: director.profileImage
            }
        });
    } catch (error) {
        console.error('Error fetching director data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update director information
exports.updateDirectorById = async (req, res) => {
    try {
        const id = req.userId;

        const allowedUpdates = [
            'title', 'department', 'expertise', 'officeLocation',
            'contactEmail', 'researchInterests', 'publications',
            'teachingSubjects', 'officeHours', 'achievements', 'guidance',
            'directorRole', 'managedDepartments', 'reportingTo'
        ];

        const updateData = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
        );

        const isValidOperation = Object.keys(updateData).every(key =>
            allowedUpdates.includes(key)
        );

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates!' });
        }

        const director = await User.findById(id);

        let directorDetails = await Director.findByIdAndUpdate(
            director.directorDetails,
            updateData,
            { new: true, runValidators: true }
        );

        if (!directorDetails) {
            directorDetails = new Director(updateData);
            await directorDetails.save();

            director.directorDetails = directorDetails._id;
            await director.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Director information updated successfully',
            director: directorDetails
        });
    } catch (error) {
        console.error('Error updating director data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove user from campus (students, faculty, alumni)
exports.removeUserFromCampus = async (req, res) => {
    try {
        const directorId = req.userId;
        const { userId, reason } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Verify the director has permission
        const director = await User.findById(directorId).populate('directorDetails');
        if (!director || director.role !== 'Director') {
            return res.status(403).json({ message: "Only directors can remove users" });
        }

        // Check if director has permission to remove users
        if (!director.directorDetails || !director.directorDetails.permissions.canRemoveFaculty) {
            return res.status(403).json({ message: "You don't have permission to remove users" });
        }

        // Verify both users are from the same campus
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (targetUser.college.toString() !== director.college.toString()) {
            return res.status(403).json({ message: "You can only remove users from your own campus" });
        }

        // Prevent directors from removing other directors
        if (targetUser.role === 'Director') {
            return res.status(403).json({ message: "Directors cannot remove other directors" });
        }

        // Remove the user (soft delete by updating role or hard delete)
        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: `User ${targetUser.name} has been removed from the campus`,
            reason: reason || "No reason provided"
        });

    } catch (error) {
        console.error('Error removing user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get campus analytics (only for directors)
exports.getCampusAnalytics = async (req, res) => {
    try {
        const directorId = req.userId;

        const director = await User.findById(directorId).populate('directorDetails');
        if (!director || director.role !== 'Director') {
            return res.status(403).json({ message: "Only directors can view analytics" });
        }

        // Get campus statistics
        const totalStudents = await User.countDocuments({ 
            college: director.college, 
            role: 'Student' 
        });
        
        const totalFaculty = await User.countDocuments({ 
            college: director.college, 
            role: 'Faculty' 
        });
        
        const totalAlumni = await User.countDocuments({ 
            college: director.college, 
            role: 'Alumni' 
        });
        
        const totalDirectors = await User.countDocuments({ 
            college: director.college, 
            role: 'Director' 
        });

        const onlineUsers = await User.countDocuments({ 
            college: director.college, 
            isOnline: true 
        });

        return res.status(200).json({
            success: true,
            analytics: {
                totalStudents,
                totalFaculty,
                totalAlumni,
                totalDirectors,
                onlineUsers,
                totalUsers: totalStudents + totalFaculty + totalAlumni + totalDirectors
            }
        });

    } catch (error) {
        console.error('Error fetching campus analytics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all users in campus for management
exports.getCampusUsers = async (req, res) => {
    try {
        const directorId = req.userId;
        const { role, department } = req.query;

        const director = await User.findById(directorId);
        if (!director || director.role !== 'Director') {
            return res.status(403).json({ message: "Only directors can view campus users" });
        }

        let query = { college: director.college };
        
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('name email role profileImage isOnline lastSeen')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            users: users
        });

    } catch (error) {
        console.error('Error fetching campus users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Send message to campus members
exports.sendCampusMessage = async (req, res) => {
    try {
        const directorId = req.userId;
        const { recipients, message, messageType } = req.body;

        const director = await User.findById(directorId);
        if (!director || director.role !== 'Director') {
            return res.status(403).json({ message: "Only directors can send campus messages" });
        }

        if (!recipients || !message) {
            return res.status(400).json({ message: "Recipients and message are required" });
        }

        // Create messages for each recipient
        const messages = [];
        for (const recipientId of recipients) {
            const newMessage = new Message({
                sender: directorId,
                recipient: recipientId,
                content: message,
                messageType: messageType || 'text',
                isCampusMessage: true
            });
            messages.push(newMessage);
        }

        await Message.insertMany(messages);

        return res.status(200).json({
            success: true,
            message: "Campus message sent successfully",
            sentTo: recipients.length
        });

    } catch (error) {
        console.error('Error sending campus message:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 