const express = require('express');
const { connectDB } = require('./config/Db.config');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const UserRouter = require('./routes/User.routes');
const http = require('http');
const setupSocket = require('./Socket/Socket');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Database Connection
connectDB();

// User Routes
app.use('/student/v2', UserRouter);

// Initialize WebSocket
setupSocket(server); // Initialize socket with the server

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});