const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*', // Allow all origins for local testing, update in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Pass Socket.io engine to express requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Route files
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const transactionRoutes = require('./routes/transactions');
const notificationRoutes = require('./routes/notifications');
const errorHandler = require('./middleware/error');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Food Rescue Connect API' });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Socket.io Real-Time Coordination Engine
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Room Join (For specific listing coordination/chat between Donor, NGO, Volunteer)
  socket.on('join_room', ({ listingId }) => {
    socket.join(listingId);
    console.log(`👤 Client ${socket.id} joined room for listing: ${listingId}`);
  });

  // Handle live coordinate tracking from Volunteer
  socket.on('volunteer_location_update', ({ listingId, volunteerId, latitude, longitude }) => {
    // Broadcast volunteer location to all other users in the room (Donor/NGO)
    socket.to(listingId).emit('volunteer_location_changed', {
      volunteerId,
      latitude,
      longitude,
      timestamp: new Date(),
    });
  });

  // Handle Coordination Chat Messages
  socket.on('send_message', ({ listingId, senderName, message, senderId }) => {
    // Emit message to everyone in the listing room
    io.to(listingId).emit('new_message', {
      senderId,
      senderName,
      message,
      timestamp: new Date(),
    });
  });

  // Handle Disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in developer mode on port ${PORT}`);
});
