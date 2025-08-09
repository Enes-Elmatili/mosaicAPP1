// Minimal Socket.io client setup for frontend real-time notifications
import { io } from 'socket.io-client';

// Connect to the backend Socket.io server (fallback to same origin)
const socket = io(process.env.REACT_APP_SOCKET_URL || '/');

export default socket;
