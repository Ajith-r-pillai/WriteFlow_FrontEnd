// store/userStore.ts
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import type { User } from '../types';

export const useUserStore = create(() => ({
  getAllUsers: async (): Promise<User[]> => {
    const res = await axiosInstance.get('/users');
    return res.data;
  },
}));
