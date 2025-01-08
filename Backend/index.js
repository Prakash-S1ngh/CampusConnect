const express = require('express');
const { connectDB } = require('./config/Db.config');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Database Connection
connectDB();

// Start the server
const port = process.env.PORT || 3000; // Use a default port if PORT is not defined
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
