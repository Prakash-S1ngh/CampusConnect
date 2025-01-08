const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage:{
        type: String,  
    },
    role: {
        type: String,
        enum: ['Student', 'Alumni'], // Restrict role to specific values
        default: 'Student',
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true,
    },
    alumniDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alumni',
    },
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserInfo',
    }
});

const User = mongoose.model('User', UserSchema);
exports.module = User;
