import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export const useSocket = (
  noteId: string | undefined,
  onTyping: (username: string) => void,
  onStopTyping: () => void,
  onNoteUpdate: (data: { title: string; content: string }) => void,
  onCollaboratorChange: () => void
): Socket | null => {
  const user = useAuthStore.getState().user;
  const socketRef = useRef<Socket | null>(null);

  const BASE_URL = import.meta.env.VITE_API_SOCKET_BASE_URL;
  console.log('✅ BASE_URL used in socket:', BASE_URL);
console.log('🌍 ENV:', import.meta.env);

  useEffect(() => {
    if (!noteId || !user) return;

    const socket: Socket = io(BASE_URL, {
      query: { userId: user._id },
    });

    socket.emit('joinNote', noteId);

    socket.on('typing', onTyping);
    socket.on('stopTyping', onStopTyping);
    socket.on('noteUpdated', onNoteUpdate);
    socket.on('collaboratorUpdated', (data) => {
      toast.success(data.message || 'Collaborator list updated');
      onCollaboratorChange();
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leaveNote', noteId);
      socket.disconnect();
    };
  }, [noteId, user, BASE_URL]);

  return socketRef.current;
};
