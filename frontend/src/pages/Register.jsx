import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, User } from 'lucide-react';

export default function Register({ setCurrentTab }) {
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!name) tempErrors.name = 'Full Name is required';
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email address is invalid';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) tempErrors.confirmPassword = 'Passwords do not match';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        addNotification('Registration successful! Welcome.', 'success');
        setCurrentTab('dashboard');
      } else {
        addNotification(data.error || 'Registration failed.', 'error');
      }
    } catch (err) {
      addNotification('Server connection failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Create a New Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Or{' '}
            <button
              onClick={() => setCurrentTab('login')}
              className="font-medium text-brand-500 hover:text-brand-600 focus:outline-none"
            >
              sign in to your existing profile
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 block w-full border rounded-md py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white ${
                    errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 block w-full border rounded-md py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white ${
                    errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 block w-full border rounded-md py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white ${
                    errors.password ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 block w-full border rounded-md py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white ${
                    errors.confirmPassword ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:bg-brand-300 transition-colors"
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
