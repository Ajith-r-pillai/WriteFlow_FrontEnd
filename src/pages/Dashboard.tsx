import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../store/noteStore';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import type { Note } from '../types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const getAllNotes = useNoteStore((s) => s.getAllNotes);
  const deleteNotes = useNoteStore((s) => s.deleteNotes);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getAllNotes();
        setNotes(data || []);
      } catch (err) {
        toast.error('Failed to fetch notes');
      }
    };
    fetchNotes();
  }, []);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((nid) => nid !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    try {
      await deleteNotes(selected);
      toast.success('Notes deleted');
      setNotes((prev) => prev.filter((n) => !selected.includes(n._id)));
      setSelected([]);
    } catch (err) {
      toast.error('Error deleting notes');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <Header
          title="WriteFlow"
          showDelete
          onDelete={handleDeleteSelected}
          disableDelete={selected.length === 0}
        />
        
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Get started by creating your first note. All your ideas and thoughts will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
                </h2>
                {selected.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {selected.length} selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map((note) => {
                const isOwner = note.owner?._id === user?._id;
                const isSelected = selected.includes(note._id);
                
                return (
                  <div
                    key={note._id}
                    className={`group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                      isSelected
                        ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20 ring-2 ring-blue-100 dark:ring-blue-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {isOwner && (
                      <div className="absolute top-4 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(note._id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                        />
                      </div>
                    )}
                    
                    <div
                      onClick={() => navigate(`/note/${note._id}`)}
                      className="cursor-pointer p-6 pt-12"
                    >
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-2">
                          {note.title || 'Untitled Note'}
                        </h3>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {(note.owner?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{note.owner?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>Click to view</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {isOwner && isSelected && (
                      <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 rounded-xl pointer-events-none"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}