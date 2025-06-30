import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import type { User } from '../types';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


interface AuthState {
  user: User | null;
  token: string | null;
  socket: Socket | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  connectSocket: (userId: string) => void; 
  checkAuth: () => Promise<void>;

}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  socket: null,

  login: async (data) => {
    const res = await axiosInstance.post('/auth/login', data);
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    set({ user, token });
    get().connectSocket(user._id); 
    toast.success('Login successful');
    // console.log(user);
    
  },

  register: async (data) => {
    const res = await axiosInstance.post('/auth/register', data);
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    set({ user, token });
    get().connectSocket(user._id);
    toast.success('Account created');
  },

  logout: () => {
    localStorage.removeItem('token');
    get().socket?.disconnect();
    set({ user: null, token: null, socket: null });
    toast.success('Logged out');
  },

// store/authStore.ts

connectSocket: (userId: string) => {
  const existing = get().socket;
  if (existing) return;

  const socket = io(BASE_URL, { query: { userId } });
  socket.connect();
  set({ socket });
}
,

checkAuth: async () => {
  const token = get().token;
  if (!token) {
    set({ user: null, token: null });
    return;
  }

  try {
    const res = await axiosInstance.get('/auth/check'); 
    const user = res.data;
    set({ user });
    get().connectSocket(user._id);
  } catch (err) {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  }
},



}));