const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB Connected');
  seedAdmin();
}).catch(err => console.error('MongoDB Connection Error:', err));

const User = require('./models/User');
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@ace.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@ace.com',
        password: 'adminpassword',
        role: 'admin',
        department: 'Administration'
      });
      console.log('Default Admin seeded: admin@ace.com / adminpassword');
    }
  } catch (e) {
    console.error('Error seeding admin:', e);
  }
};

// Basic Routes
app.get('/', (req, res) => {
  res.send('ACE College Platform API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const clubRoutes = require('./routes/clubRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const requestRoutes = require('./routes/requestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/requests', requestRoutes);

// Socket.io for Chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', async (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
    
    // Fetch and send chat history
    try {
      const history = await Message.find({ room }).sort({ createdAt: 1 });
      socket.emit('chatHistory', history);
    } catch (e) {
      console.error('Error fetching history:', e);
    }
  });

  socket.on('sendMessage', async (data) => {
    // data: { room, senderName, text }
    try {
      const newMessage = await Message.create({
        room: data.room,
        senderName: data.senderName,
        text: data.text,
        timestamp: data.timestamp || new Date().toLocaleTimeString()
      });
      
      io.to(data.room).emit('receiveMessage', newMessage);
    } catch (e) {
      console.error('Error saving message:', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} (Bound to 0.0.0.0)`));
