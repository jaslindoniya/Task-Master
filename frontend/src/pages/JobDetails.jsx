import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Briefcase, MapPin, DollarSign, Calendar, Star, FileText, ArrowLeft, Send } from 'lucide-react';

export default function JobDetails({ jobId, setCurrentTab }) {
  const { user, token } = useAuth();
  const { addNotification } = useNotification();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setCurrentTab('jobs');
      return;
    }

    const fetchJobDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
        const data = await res.json();
        if (res.ok) {
          setJob(data.job);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // Check saved/applied state if user is logged in
  useEffect(() => {
    if (user && user.saved_jobs) {
      const savedList = user.saved_jobs.split(',').filter(Boolean);
      setIsSaved(savedList.includes(String(jobId)));
    }

    if (user && token) {
      // Fetch user's applications to see if they've applied
      fetch('http://localhost:5000/api/applications/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.applications) {
            const hasApplied = data.applications.some(app => String(app.job_id) === String(jobId));
            setApplied(hasApplied);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user, jobId, token]);

  const handleApply = async () => {
    if (!user) {
      addNotification('Please log in or register to apply to jobs.', 'info');
      setCurrentTab('login');
      return;
    }

    setApplying(true);
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/apply/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setApplied(true);
        addNotification('Application submitted successfully! Track it in your dashboard.', 'success');
      } else {
        addNotification(data.error || 'Failed to submit application.', 'error');
      }
    } catch (err) {
      addNotification('Network error, please try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      addNotification('Please log in to save jobs.', 'info');
      setCurrentTab('login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/jobs/save/${jobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setIsSaved(!isSaved);
        // Dispatch local profile updates
        user.saved_jobs = data.saved_jobs;
        addNotification(!isSaved ? 'Job saved to favorites' : 'Job removed from favorites', 'success');
      }
    } catch (err) {
      addNotification('Failed to toggle save job.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-sm text-slate-500 mt-4">Gathering job criteria...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 text-center py-20 bg-slate-50 dark:bg-slate-900">
        <h3 className="text-xl font-bold">Job Not Found</h3>
        <button onClick={() => setCurrentTab('jobs')} className="mt-4 text-brand-500 font-bold flex items-center justify-center gap-1 mx-auto">
          <ArrowLeft size={16} /> Go Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 py-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back Link */}
        <button
          onClick={() => setCurrentTab('jobs')}
          className="mb-6 text-sm text-slate-500 hover:text-brand-500 font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Jobs Catalog</span>
        </button>

        {/* Core Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {job.role_category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {job.title}
              </h1>
              <p className="text-md text-slate-500 font-bold">{job.company}</p>
            </div>

            {/* Application CTAs */}
            <div className="flex items-center space-x-3 sm:self-start">
              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-lg border transition-all ${
                  isSaved
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-400 dark:text-slate-500'
                }`}
                title={isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
              >
                <Star size={20} fill={isSaved ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={handleApply}
                disabled={applied || applying}
                className={`px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center space-x-2 ${
                  applied
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-brand-500 hover:bg-brand-600 text-white hover:shadow-lg'
                }`}
              >
                <Send size={18} />
                <span>{applied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}</span>
              </button>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm">
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <MapPin size={18} className="mr-2 text-slate-400" />
              <div>
                <span className="block text-xs text-slate-400">Location</span>
                <span className="font-semibold">{job.location}</span>
              </div>
            </div>

            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Briefcase size={18} className="mr-2 text-slate-400" />
              <div>
                <span className="block text-xs text-slate-400">Experience</span>
                <span className="font-semibold">{job.experience_level}</span>
              </div>
            </div>

            <div className="flex items-center text-emerald-600 dark:text-emerald-400">
              <DollarSign size={18} className="mr-1.5" />
              <div>
                <span className="block text-xs text-slate-400">Compensation</span>
                <span className="font-semibold">{job.salary}</span>
              </div>
            </div>

            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Calendar size={18} className="mr-2 text-slate-400" />
              <div>
                <span className="block text-xs text-slate-400">Date Posted</span>
                <span className="font-semibold">Recently</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Full Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 text-left">
          <div className="md:col-span-2 space-y-8 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-150 dark:border-slate-700 shadow-sm">

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <FileText size={18} className="mr-2 text-brand-500" />
                Job Overview
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <FileText size={18} className="mr-2 text-brand-500" />
                Core Requirements
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
            </div>

          </div>

          {/* Quick Informational Panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-2xl p-6 shadow-md space-y-4">
              <h4 className="font-extrabold text-lg leading-snug">Boost Your Matching score!</h4>
              <p className="text-xs text-brand-100 leading-relaxed">
                Applicants who pass the {job.role_category} Skill-Based Quiz with 70% or more are 4x more likely to secure an immediate review from our matching recruiters.
              </p>
              <button
                onClick={() => setCurrentTab('quizzes')}
                className="w-full py-2.5 bg-white text-brand-600 font-bold text-xs rounded-lg hover:bg-brand-50 shadow transition-colors"
              >
                Go to Quizzes Section
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
