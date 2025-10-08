import { Server } from 'socket.io';
import type { ViteDevServer } from 'vite';

let io: Server | null = null;

export function webSocketServer() {
    return {
        name: 'webSocketServer',
        configureServer(server: ViteDevServer) {
            if (!server.httpServer) return;

            io = new Server(server.httpServer, {
                path: '/api/socketio',
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST']
                }
            });

            io.on('connection', (socket) => {

                // Handle custom events
                socket.on('message', (data) => {
                    // Broadcast to all clients
                    io?.emit('message', {
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

                // Handle room joining
                socket.on('join-room', (room: string) => {
                    socket.join(room);
                    io?.to(room).emit('user-joined', { socketId: socket.id, room });
                });

                socket.on('leave-room', (room: string) => {
                    socket.leave(room);
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

            console.log('Socket.IO server initialized on path: /api/socketio');
        }
    };
}

export function getIO(): Server | null {
    return io;
}