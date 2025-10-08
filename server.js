import { handler } from './build/handler.js'; // adjust path if server.ts is outside /build
import { createServer } from 'http';
import { Server } from 'socket.io';

// Create an HTTP server and attach SvelteKit's handler
const httpServer = createServer((req, res) => {
  // Let SvelteKit handle all non-WebSocket requests
  handler(req, res);
});

// Initialize Socket.IO
const io = new Server(httpServer, {
  path: '/api/socketio',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {

  socket.on('message', (data) => {
    io.emit('message', {
      id: socket.id,
      ...data
    });
  });

  socket.on('private-message', (data) => {
    if (data.to) {
      socket.to(data.to).emit('private-message', {
        from: socket.id,
        message: data.message
      });
    }
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    io.to(room).emit('user-joined', { socketId: socket.id, room });
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    io.to(room).emit('user-left', { socketId: socket.id, room });
  });

  socket.on('room-message', (data) => {
    io.to(data.room).emit('room-message', {
      from: socket.id,
      message: data.message
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`✅ Socket.IO server listening at ws://localhost:${port}/api/socketio`);
});
