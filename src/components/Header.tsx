import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  title: string;
  showDelete?: boolean;
  onDelete?: () => void;
  disableDelete?: boolean;
}

export default function Header({ title, showDelete = false, onDelete, disableDelete = false }: HeaderProps) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-gradient-to-r from-slate-50 to-amber-50 border-b border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {location.pathname.startsWith('/note') && (
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
                </svg>
                <span className="hidden xs:inline sm:inline">Dashboard</span>
              </span>
            </button>
          )}
          
          <button
            onClick={() => navigate('/note/new')}
            className="group relative px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden xs:inline sm:inline">New Note</span>
              <span className="xs:hidden sm:hidden">New</span>
            </span>
          </button>
          
          {showDelete && (
            <button
              onClick={onDelete}
              disabled={disableDelete}
              className={`group relative px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                disableDelete 
                  ? 'text-red-300 bg-red-50 border border-red-200 cursor-not-allowed opacity-60' 
                  : 'text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete Selected</span>
                <span className="sm:hidden">Delete</span>
              </span>
            </button>
          )}
          
          <div className="hidden sm:block w-px h-8 bg-slate-300 mx-2"></div>
          
          <button
            onClick={logout}
            className="group relative px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg hover:from-slate-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden xs:inline sm:inline">Logout</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}