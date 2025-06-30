import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';

import Header from '../components/Header';
import CollaboratorList from '../components/CollaboratorList';
import { useNoteStore } from '../store/noteStore';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useSocket } from '../hooks/useSocket';
import type { User } from '../types';

export default function NoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [ownerId, setOwnerId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const user = useAuthStore((s) => s.user);
  const getNote = useNoteStore((s) => s.getNoteById);
  const createNote = useNoteStore((s) => s.createNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const deleteNote = useNoteStore((s) => s.deleteNotes);
  const getAllUsers = useUserStore((s) => s.getAllUsers);
  const getCollaborators = useNoteStore((s) => s.getCollaborators);
  const removeCollaborator = useNoteStore((s) => s.removeCollaborator);
  const leaveNote = useNoteStore((s) => s.leaveNote);
  const addCollaborator = useNoteStore((s) => s.addCollaborator);

  const refreshCollaborators = async () => {
    if (!noteId) return;
    const latest = await getCollaborators(noteId);
    setCollaborators(latest);
  };

  const socket = useSocket(
    noteId!,
    (username) => setTypingUser(username),
    () => setTypingUser(''),
    (data) => {
      setTitle(data.title);
      setContent(data.content);
    },
    async () => {
      await refreshCollaborators();
      toast('Collaborators updated 👥');
    }
  );

  const loadNote = async () => {
    if (!noteId || noteId === 'new') return;
    try {
      const note = await getNote(noteId);
      setTitle(note.title);
      setContent(note.content);
      setCollaborators(note.collaborators || []);
      setOwnerId(note.owner?._id || '');
    } catch {
      toast.error('Error loading note');
    }
  };

  const loadUsers = async () => {
    const users = await getAllUsers();
    setAllUsers(users);
    setFilteredUsers(users);
  };

  useEffect(() => {
    loadNote();
    loadUsers();
  }, [noteId]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [search, allUsers]);

  const handleTyping = () => {
    if (!socket || !noteId || !user) return;

    socket.emit('typing', { noteId, user: user.name });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', { noteId });
    }, 1500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!title && !content) {
        toast.error('Cannot save empty note');
        return;
      }

      if (!noteId || noteId === 'new') {
        const newNote = await createNote({ title, content });
        toast.success('Note created');
        navigate(`/note/${newNote._id}`);
      } else {
        await updateNote(noteId, { title, content });
        socket?.emit('noteUpdated', { noteId, data: { title, content } });
      
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedUserId || !noteId) {
      toast.error('Please select a user');
      return;
    }

    try {
      const updated = await addCollaborator(noteId, selectedUserId);
      setCollaborators(updated);
      setSearch('');
      setSelectedUserId('');
      socket?.emit('collaboratorUpdated', { noteId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error adding collaborator');
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!noteId) return;
    try {
      const updated = await removeCollaborator(noteId, userId);
      setCollaborators(updated);
      socket?.emit('collaboratorUpdated', { noteId });
    } catch {
      toast.error('Error removing collaborator');
    }
  };

  const handleLeaveNote = async () => {
    if (!noteId) return;
    try {
      await leaveNote(noteId);
      socket?.emit('collaboratorUpdated', { noteId });
      navigate('/dashboard');
    } catch {
      toast.error('Error leaving note');
    }
  };

  const handleDeleteNote = async () => {
    if (!noteId) return;
    await deleteNote([noteId]);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <Header
          title={noteId === 'new' ? 'New Note' : 'Edit Note'}
          showDelete={noteId !== 'new'}
          onDelete={handleDeleteNote}
          disableDelete={user?._id !== ownerId}
        />

        {/* Mobile Collaborators Toggle Button */}
        {noteId !== 'new' && (
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">
                {showCollaborators ? 'Hide' : 'Show'} Collaborators
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {collaborators.length}
              </span>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Editor Section */}
          <div className="flex-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Title Input */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Note Title
              </label>
              <input
                className="w-full border-0 bg-slate-50 rounded-lg px-4 py-3 text-lg sm:text-xl font-medium placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                placeholder="Enter your note title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleTyping();
                }}
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
                <label className="block text-sm font-medium text-slate-700">
                  Content
                </label>
              </div>
              <div className="w-full h-[250px] sm:h-[300px] md:h-[400px]">
                <ReactQuill
                  value={content}
                  onChange={(value) => {
                    setContent(value);
                    handleTyping();
                  }}
                  className="h-full"
                  theme="snow"
                  style={{ height: '100%', border: 'none' }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['blockquote', 'code-block'],
                      ['link', 'image'],
                      ['clean'],
                    ],
                  }}
                />
              </div>
            </div>

            {/* Typing Indicator */}
            {typingUser && typingUser !== user?.name && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-amber-700 font-medium">
                  {typingUser} is typing...
                </span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="group relative px-6 sm:px-8 py-3 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSaving}
              >
                <span className="flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden xs:inline">Save Note</span>
                      <span className="xs:hidden">Save</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Collaborators Sidebar */}
          {noteId !== 'new' && (
            <div className={`w-full lg:w-80 xl:w-96 space-y-4 sm:space-y-6 order-1 lg:order-2 ${showCollaborators || window.innerWidth >= 1024 ? 'block' : 'hidden lg:block'}`}>
              {/* Add Collaborator Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="font-semibold text-slate-800">Add Collaborator</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setSelectedUserId('');
                      }}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base"
                    />
                    <svg className="absolute right-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {search && (
                    <div className="max-h-32 sm:max-h-48 overflow-y-auto bg-slate-50 rounded-lg border border-slate-200">
                      {filteredUsers.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => {
                            setSelectedUserId(u._id);
                            setSearch(`${u.name} (${u.email})`);
                          }}
                          className={`px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-amber-50 border-b last:border-b-0 border-slate-200 transition-colors ${
                            selectedUserId === u._id ? 'bg-amber-50 border-amber-200' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-800 text-sm sm:text-base truncate">{u.name}</div>
                              <div className="text-xs text-slate-500 truncate">{u.email}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={handleAddCollaborator}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-2.5 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
                  >
                    Add Collaborator
                  </button>
                </div>
              </div>

              {/* Collaborators List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="font-semibold text-slate-800">Collaborators</h3>
                  <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {collaborators.length}
                  </span>
                </div>
                
                <CollaboratorList
                  collaborators={collaborators}
                  ownerId={ownerId}
                  currentUserId={user?._id || ''}
                  onRemove={handleRemoveCollaborator}
                  onLeave={handleLeaveNote}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}