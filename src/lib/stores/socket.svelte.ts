// src/lib/stores/socket.svelte.ts
import { io, type Socket } from 'socket.io-client';
import { browser } from '$app/environment';

class SocketStore {
  private socket: Socket | null = $state(null);
  public connected = $state(false);
  
  constructor() {
    if (browser) {
      this.connect();
    }
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(window.location.origin, {
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export a singleton instance
export const socketStore = new SocketStore();