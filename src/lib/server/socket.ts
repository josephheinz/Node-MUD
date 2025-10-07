import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: Server | null = null;

export function initSocketServer(server: HTTPServer) {
  if (io) return io;

  io = new Server(server, {
    path: '/api/socketio',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Example: Handle custom events
    socket.on('message', (data) => {
      console.log('Received message:', data);
      // Broadcast to all clients
      io?.emit('message', {
        id: socket.id,
        ...data
      });
    });

    socket.on('private-message', (data) => {
      console.log('Private message:', data);
      // Send to specific client
      if (data.to) {
        socket.to(data.to).emit('private-message', {
          from: socket.id,
          message: data.message
        });
      }
    });

    // Handle room joining
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
      io?.to(room).emit('user-joined', { socketId: socket.id, room });
    });

    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
      io?.to(room).emit('user-left', { socketId: socket.id, room });
    });

    // Room-specific messages
    socket.on('room-message', (data: { room: string; message: any }) => {
      io?.to(data.room).emit('room-message', {
        from: socket.id,
        message: data.message
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getSocketServer(): Server | null {
  return io;
}