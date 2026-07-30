import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Quizzes from './pages/Quizzes';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState(null);

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home setCurrentTab={setCurrentTab} />;
      case 'login':
        return <Login setCurrentTab={setCurrentTab} />;
      case 'register':
        return <Register setCurrentTab={setCurrentTab} />;
      case 'jobs':
        return <Jobs setSelectedJobId={setSelectedJobId} setCurrentTab={setCurrentTab} />;
      case 'job-details':
        return <JobDetails jobId={selectedJobId} setCurrentTab={setCurrentTab} />;
      case 'quizzes':
        return <Quizzes setCurrentTab={setCurrentTab} />;
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} setSelectedJobId={setSelectedJobId} />;
      case 'admin':
        return <AdminPanel />;
      case 'contact':
        return <Contact />;
      case 'about':
        return <About setCurrentTab={setCurrentTab} />;
      case 'faq':
        return <FAQ />;
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content View with transition wrappers */}
      <main className="flex-grow flex flex-col">
        {renderContent()}
      </main>

      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}
