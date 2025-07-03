import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LoginModal from '../Auth/LoginModal';
import ProfileModal from '../Auth/ProfileModal';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/problems" className="flex items-center space-x-2 text-xl font-semibold">
                <Code className="h-6 w-6" />
                <span>CodeJudge</span>
              </Link>
              
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                <Link
                  to="/problems"
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive('/problems')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Problems
                </Link>
                <Link
                  to="/submissions"
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive('/submissions')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Submissions
                </Link>
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
              <div className="space-y-1">
                <Link
                  to="/problems"
                  className={`block px-3 py-2 text-sm font-medium ${
                    isActive('/problems')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Problems
                </Link>
                <Link
                  to="/submissions"
                  className={`block px-3 py-2 text-sm font-medium ${
                    isActive('/submissions')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Submissions
                </Link>
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  {user ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-1 w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-blue-600 text-white px-3 py-2 text-sm font-medium"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Navbar;