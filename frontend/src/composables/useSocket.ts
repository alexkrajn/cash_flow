import { io, Socket } from 'socket.io-client';
import { ref, onUnmounted } from 'vue';
import type { SocketEvents } from '@/types';

const socket = ref<Socket | null>(null);
const isConnected = ref(false);

export function useSocket() {
  const connect = (url: string = 'http://localhost:5001') => {
    console.log('Connecting to socket server:', url);
    if (socket.value?.connected) {
      console.log('Socket already connected');
      return socket.value;
    }

    // Disconnect existing socket if any
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }

    socket.value = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true, // Force new connection
    });
    
    console.log('Socket created:', socket.value);
    console.log('Socket connecting state:', socket.value.connected);
    console.log('Socket connected state:', socket.value.connected);

    socket.value.on('connect', () => {
      isConnected.value = true;
      console.log('Connected to server, socket ID:', socket.value?.id);
      console.log('Socket connection established successfully');
      
      // Emit custom event for connection
      window.dispatchEvent(new CustomEvent('socket-connected', { 
        detail: { socketId: socket.value?.id } 
      }));
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      console.log('Disconnected from server');
      
      // Emit custom event for disconnection
      window.dispatchEvent(new CustomEvent('socket-disconnected', { 
        detail: { reason: 'disconnect' } 
      }));
    });

    socket.value.on('connect_error', (error) => {
      isConnected.value = false;
      console.error('Connection error:', error);
      console.error('Failed to connect to socket server at:', url);
      
      // Emit custom event for connection error
      window.dispatchEvent(new CustomEvent('socket-connection-error', { 
        detail: { error } 
      }));
    });

    socket.value.on('reconnect', (attemptNumber) => {
      isConnected.value = true;
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      
      // Emit custom event for reconnection
      window.dispatchEvent(new CustomEvent('socket-reconnected', { 
        detail: { attemptNumber } 
      }));
    });

    socket.value.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.value.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server');
    });

    return socket.value;
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  const emit = <K extends keyof SocketEvents>(
    event: K,
    data: SocketEvents[K]
  ) => {
    console.log('Emitting event:', event, 'with data:', data);
    console.log('Socket connected:', socket.value?.connected);
    console.log('Socket ID:', socket.value?.id);
    
    // Ensure socket is connected before emitting
    if (!socket.value) {
      console.log('Socket not initialized, connecting...');
      connect();
    }
    
    if (socket.value?.connected) {
      socket.value.emit(event, data);
      console.log('Event emitted successfully:', event);
    } else {
      console.warn('Socket not connected, waiting for connection...');
      // Wait for connection and then emit with timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const waitForConnection = () => {
        attempts++;
        if (socket.value?.connected) {
          socket.value.emit(event, data);
          console.log('Event emitted after waiting for connection:', event);
        } else if (attempts < maxAttempts) {
          setTimeout(waitForConnection, 100);
        } else {
          console.error('Failed to emit event after waiting for connection:', event);
          // Try to emit anyway - socket might still work
          if (socket.value) {
            socket.value.emit(event, data);
            console.log('Event emitted despite connection status:', event);
          }
        }
      };
      waitForConnection();
    }
  };

  const on = <K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ) => {
    if (socket.value) {
      console.log('Setting up event listener for:', event, 'at', new Date().toISOString());
      // Remove existing listener first to prevent duplicates
      socket.value.off(event as string, callback as any);
      socket.value.on(event as string, callback as any);
      console.log('Event listener setup completed for:', event);
    } else {
      console.warn('Socket not available when setting up event listener for:', event);
      // If socket is not available, set up the listener when it becomes available
      const setupListener = () => {
        if (socket.value) {
          console.log('Setting up delayed event listener for:', event, 'at', new Date().toISOString());
          // Remove existing listener first to prevent duplicates
          socket.value.off(event as string, callback as any);
          socket.value.on(event as string, callback as any);
          console.log('Delayed event listener setup completed for:', event);
        } else {
          setTimeout(setupListener, 100);
        }
      };
      setupListener();
    }
  };

  const off = <K extends keyof SocketEvents>(
    event: K,
    callback?: (data: SocketEvents[K]) => void
  ) => {
    if (socket.value) {
      socket.value.off(event as string, callback as any);
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket: socket.value,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
