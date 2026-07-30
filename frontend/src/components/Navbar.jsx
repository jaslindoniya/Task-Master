import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Sun, Moon, Briefcase, GraduationCap, Award, User, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Briefcase },
    { id: 'jobs', label: 'Find Jobs', icon: Briefcase },
    { id: 'quizzes', label: 'Quizzes', icon: GraduationCap },
    { id: 'about', label: 'About', icon: GraduationCap },
    { id: 'contact', label: 'Contact Us', icon: GraduationCap },
    { id: 'faq', label: 'FAQ', icon: GraduationCap },
  ];

  const handleNav = (tabId) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
            <div className="bg-brand-500 text-white p-2 rounded-lg flex items-center justify-center mr-2">
              <GraduationCap size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-brand-500 dark:text-brand-100">
              Way to Success
            </span>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-150 ${
                  currentTab === item.id
                    ? 'bg-brand-50 text-brand-500 dark:bg-brand-600/20 dark:text-brand-100'
                    : 'text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Controls / Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Admin Panel Button */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="flex items-center text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 px-2.5 py-1.5 rounded-md hover:bg-amber-500/20 font-bold transition-all"
                  >
                    <ShieldAlert size={14} className="mr-1" />
                    Admin
                  </button>
                )}

                {/* Dashboard / Profile */}
                <button
                  onClick={() => handleNav('dashboard')}
                  className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-100 transition-colors"
                >
                  <User size={18} className="mr-1" />
                  Dashboard
                </button>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-2 pt-2 pb-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                currentTab === item.id
                  ? 'bg-brand-50 text-brand-500 dark:bg-brand-600/20 dark:text-brand-100'
                  : 'text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 pb-2">
            {user ? (
              <div className="px-3 space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white px-3 py-1">Logged in as {user.name}</p>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="block w-full text-left px-3 py-2 text-amber-500 font-semibold"
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={() => handleNav('dashboard')}
                  className="block w-full text-left px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-500"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-3">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2 text-center text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="w-full py-2 text-center text-sm font-semibold bg-brand-500 text-white rounded-md hover:bg-brand-600"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
