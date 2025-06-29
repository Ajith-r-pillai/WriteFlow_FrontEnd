import { create } from 'zustand';
import type { Note, User } from '../types';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

interface NoteStore {
  notes: Note[];
  getAllNotes: () => Promise<Note[]>;
  getNoteById: (id: string) => Promise<Note>;
  createNote: (data: { title: string; content: string }) => Promise<Note>;
  updateNote: (id: string, data: { title: string; content: string }) => Promise<void>;
  deleteNotes: (ids: string[]) => Promise<void>;

  getCollaborators: (id: string) => Promise<User[]>;
  addCollaborator: (noteId: string, userId: string) => Promise<User[]>;
  removeCollaborator: (noteId: string, userId: string) => Promise<User[]>;
  leaveNote: (noteId: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],

  getAllNotes: async () => {
    const res = await axiosInstance.get('/notes');
    set({ notes: res.data });
    return res.data;
  },

  getNoteById: async (id) => {
    const res = await axiosInstance.get(`/notes/${id}`);
    return res.data;
  },

  createNote: async (data) => {
    const res = await axiosInstance.post('/notes', data);
    toast.success('Note created!');
    return res.data;
  },

  updateNote: async (id, data) => {
    await axiosInstance.put(`/notes/${id}`, data);
    toast.success('Note updated!');
  },

  deleteNotes: async (noteIds) => {
    await axiosInstance.post('/notes/bulk-delete', { noteIds });

    // Optimistically update UI
    set((state) => ({
      notes: state.notes.filter((note) => !noteIds.includes(note._id)),
    }));

    toast.success('Selected notes deleted');
  },

  getCollaborators: async (id) => {
    const res = await axiosInstance.get(`/notes/${id}/collaborators`);
    return res.data;
  },

  addCollaborator: async (noteId, userId) => {
    const res = await axiosInstance.post(`/notes/${noteId}/collaborators`, { userId });
    toast.success('Collaborator added');
    return res.data;
  },

  removeCollaborator: async (noteId, userId) => {
    const res = await axiosInstance.delete(`/notes/${noteId}/collaborators/${userId}`);
    toast.success('Collaborator removed');
    return res.data;
  },

  leaveNote: async (noteId) => {
    await axiosInstance.post(`/notes/${noteId}/leave`);
    toast.success('You left the note');
  },
}));
