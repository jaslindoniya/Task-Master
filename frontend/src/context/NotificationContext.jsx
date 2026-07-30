import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto dismiss
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      {/* Toast Overlay UI */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-lg shadow-lg border text-white transform transition-all duration-300 flex justify-between items-center ${
              n.type === 'success'
                ? 'bg-emerald-600 border-emerald-500'
                : n.type === 'error'
                ? 'bg-rose-600 border-rose-500'
                : 'bg-blue-600 border-blue-500'
            }`}
          >
            <p className="font-medium text-sm">{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="ml-4 text-white hover:text-slate-200 font-bold"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
