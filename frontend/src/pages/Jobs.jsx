import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Search, MapPin, Briefcase, DollarSign, Filter, ArrowRight, X } from 'lucide-react';

export default function Jobs({ setSelectedJobId, setCurrentTab }) {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [minSalary, setMinSalary] = useState('');

  // Dropdown Categories
  const categories = ['Python', 'Java', 'Web Development', 'SQL', 'AI Basics'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior'];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let queryParams = `page=${currentPage}&limit=6`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;
      if (category) queryParams += `&category=${encodeURIComponent(category)}`;
      if (location) queryParams += `&location=${encodeURIComponent(location)}`;
      if (experience) queryParams += `&experience=${encodeURIComponent(experience)}`;
      if (minSalary) queryParams += `&minSalary=${encodeURIComponent(minSalary)}`;

      const res = await fetch(`http://localhost:5000/api/jobs?${queryParams}`);
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobs);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, category, experience]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setExperience('');
    setMinSalary('');
    setCurrentPage(1);
    // Fetch with cleared state immediately
    setTimeout(() => {
      fetchJobs();
    }, 50);
  };

  const handleViewDetails = (id) => {
    setSelectedJobId(id);
    setCurrentTab('job-details');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* Search & Filter Sidebar */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-150 dark:border-slate-700 space-y-6 h-fit">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
          <span className="font-bold text-lg flex items-center text-slate-900 dark:text-white">
            <Filter size={18} className="mr-2 text-brand-500" />
            Filters
          </span>
          <button
            onClick={handleClearFilters}
            className="text-xs text-rose-500 hover:underline font-bold"
          >
            Clear All
          </button>
        </div>

        {/* Filters Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Job title, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category / Role
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Remote, Austin..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Experience Level
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">All Levels</option>
              {experienceLevels.map((lvl, idx) => (
                <option key={idx} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Min Salary Keyword
            </label>
            <input
              type="text"
              placeholder="e.g. $100,000"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 shadow transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Jobs Listing Main Section */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-150 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-bold">{jobs.length}</span> positions match your criteria
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            <p className="text-sm text-slate-500 mt-4">Discovering outstanding jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-xl border border-slate-150 dark:border-slate-700">
            <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">No Jobs Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn't find any job openings matching your filters. Try clearing some constraints or try generic search queries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-150 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-100 px-2.5 py-1 rounded-full font-bold">
                      {job.role_category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {job.experience_level}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-semibold">{job.company}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1 text-slate-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign size={14} className="mr-0.5" />
                      {job.salary}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={() => handleViewDetails(job.id)}
                    className="text-sm text-brand-500 hover:text-brand-600 font-bold flex items-center space-x-1"
                  >
                    <span>View Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 border rounded-md disabled:opacity-50 text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 border rounded-md disabled:opacity-50 text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
