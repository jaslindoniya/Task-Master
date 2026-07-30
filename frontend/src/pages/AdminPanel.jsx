import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Shield, Plus, Trash2, Edit2, Users, Briefcase, Award, GraduationCap, X } from 'lucide-react';

export default function AdminPanel() {
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState('jobs'); // 'jobs', 'quizzes', 'users', 'certificates'

  // Admin Data states
  const [jobs, setJobs] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Form Modals states
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [showQuizModal, setShowQuizModal] = useState(false);

  // Job Form Inputs
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobCategory, setJobCategory] = useState('Python');
  const [jobExp, setJobExp] = useState('Entry Level');
  const [jobSalary, setJobSalary] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReq, setJobReq] = useState('');

  // Quiz Form Inputs
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('Python');
  const [quizDuration, setQuizDuration] = useState(10);
  const [quizQuestions, setQuizQuestions] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
  ]);

  useEffect(() => {
    fetchJobs();
    fetchQuizzes();
    fetchUsers();
    fetchCertificates();
  }, []);

  const fetchJobs = async () => {
    const res = await fetch('http://localhost:5000/api/jobs?limit=100');
    const data = await res.json();
    if (res.ok) setJobs(data.jobs || []);
  };

  const fetchQuizzes = async () => {
    const res = await fetch('http://localhost:5000/api/quizzes');
    const data = await res.json();
    if (res.ok) setQuizzes(data.quizzes || []);
  };

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setUsers(data.users || []);
  };

  const fetchCertificates = async () => {
    const res = await fetch('http://localhost:5000/api/admin/certificates', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setCertificates(data.certificates || []);
  };

  // Job CRUD API Handlers
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: jobTitle,
      company: jobCompany,
      location: jobLocation,
      role_category: jobCategory,
      experience_level: jobExp,
      salary: jobSalary,
      description: jobDesc,
      requirements: jobReq
    };

    const url = editingJob ? `http://localhost:5000/api/jobs/${editingJob.id}` : 'http://localhost:5000/api/jobs';
    const method = editingJob ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        addNotification(editingJob ? 'Job updated successfully' : 'New job added successfully', 'success');
        setShowJobModal(false);
        setEditingJob(null);
        clearJobForm();
        fetchJobs();
      } else {
        const d = await res.json();
        addNotification(d.error || 'Operation failed', 'error');
      }
    } catch (err) {
      addNotification('Could not connect to backend', 'error');
    }
  };

  const handleEditJobClick = (job) => {
    setEditingJob(job);
    setJobTitle(job.title);
    setJobCompany(job.company);
    setJobLocation(job.location);
    setJobCategory(job.role_category);
    setJobExp(job.experience_level);
    setJobSalary(job.salary);
    setJobDesc(job.description);
    setJobReq(job.requirements);
    setShowJobModal(true);
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job vacancy?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification('Job vacancy deleted.', 'success');
        fetchJobs();
      }
    } catch (err) {
      addNotification('Failed to delete job.', 'error');
    }
  };

  const clearJobForm = () => {
    setJobTitle('');
    setJobCompany('');
    setJobLocation('');
    setJobCategory('Python');
    setJobExp('Entry Level');
    setJobSalary('');
    setJobDesc('');
    setJobReq('');
  };

  // Quiz CRUD API Handlers
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: quizTitle,
      category: quizCategory,
      duration: parseInt(quizDuration),
      questions: quizQuestions
    };

    try {
      const res = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        addNotification('New quiz and associated questions added successfully.', 'success');
        setShowQuizModal(false);
        clearQuizForm();
        fetchQuizzes();
      } else {
        const d = await res.json();
        addNotification(d.error || 'Could not add quiz.', 'error');
      }
    } catch (err) {
      addNotification('Failed to submit new quiz.', 'error');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz entirely?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification('Quiz deleted successfully.', 'success');
        fetchQuizzes();
      }
    } catch (err) {
      addNotification('Error deleting quiz.', 'error');
    }
  };

  const handleAddQuestionRow = () => {
    setQuizQuestions(prev => [
      ...prev,
      { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
    ]);
  };

  const handleQuestionFieldChange = (index, field, value) => {
    setQuizQuestions(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const clearQuizForm = () => {
    setQuizTitle('');
    setQuizCategory('Python');
    setQuizDuration(10);
    setQuizQuestions([
      { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
    ]);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left space-y-8">

      {/* Admin Panel Header */}
      <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-700 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Shield size={28} className="mr-2 text-amber-500" />
            Administrative Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system jobs, validate custom quizzes, view registered users, and audit certifications.
          </p>
        </div>
      </div>

      {/* Navigation Sub tabs */}
      <div className="flex space-x-2 border-b border-slate-100 dark:border-slate-700 pb-2">
        {[
          { id: 'jobs', label: 'Job Positions', count: jobs.length, icon: Briefcase },
          { id: 'quizzes', label: 'Assessments', count: quizzes.length, icon: GraduationCap },
          { id: 'users', label: 'Registered Users', count: users.length, icon: Users },
          { id: 'certificates', label: 'Credentials Issued', count: certificates.length, icon: Award }
        ].map(sub => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                activeSubTab === sub.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon size={14} />
              <span>{sub.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeSubTab === sub.id ? 'bg-white text-amber-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
              }`}>
                {sub.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- SUB TAB PANELS --- */}

      {/* Jobs CRUD Sub tab */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Active Job Posts</h3>
            <button
              onClick={() => { clearJobForm(); setEditingJob(null); setShowJobModal(true); }}
              className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Create Vacancy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(j => (
              <div key={j.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-150 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase bg-brand-50 text-brand-500 px-2.5 py-1 rounded-full">{j.role_category}</span>
                  <h4 className="font-bold text-md text-slate-900 dark:text-white leading-tight mt-2">{j.title}</h4>
                  <p className="text-xs text-slate-500">{j.company} • {j.location}</p>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <button
                    onClick={() => handleEditJobClick(j)}
                    className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(j.id)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes CRUD Sub tab */}
      {activeSubTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Validated Assessments</h3>
            <button
              onClick={() => { clearQuizForm(); setShowQuizModal(true); }}
              className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Create Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(q => (
              <div key={q.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-150 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-500 px-2.5 py-1 rounded-full">{q.category}</span>
                  <h4 className="font-bold text-md text-slate-900 dark:text-white leading-tight mt-2">{q.title}</h4>
                  <p className="text-xs text-slate-400">Duration: {q.duration} mins</p>
                </div>
                <div className="flex justify-end border-t border-slate-100 dark:border-slate-700 pt-3">
                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users View */}
      {activeSubTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Key Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 dark:text-white">{u.name}</td>
                  <td className="p-4 font-mono text-slate-500 text-xs">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{u.skills || 'Not specified'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certificates View */}
      {activeSubTab === 'certificates' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-150 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4">Candidate</th>
                <th className="p-4">Credential Name</th>
                <th className="p-4">Score</th>
                <th className="p-4">Certificate ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {certificates.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 dark:text-white">{c.user_name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{c.course_name}</td>
                  <td className="p-4 font-bold text-emerald-600">{parseFloat(c.score).toFixed(1)}%</td>
                  <td className="p-4 font-mono text-slate-500 text-xs">{c.certificate_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- FORMS & MODALS --- */}

      {/* Job Create/Edit Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full border dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-6">
              <h3 className="font-extrabold text-xl">{editingJob ? 'Edit Vacancy' : 'Create New Job Position'}</h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Job Title</label>
                  <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Company Name</label>
                  <input type="text" value={jobCompany} onChange={(e) => setJobCompany(e.target.value)} required className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Location</label>
                  <input type="text" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} required className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Salary Package</label>
                  <input type="text" value={jobSalary} onChange={(e) => setJobSalary(e.target.value)} required placeholder="e.g. $90k - $110k" className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Category / Role</label>
                  <select value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900">
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="Web Development">Web Development</option>
                    <option value="SQL">SQL</option>
                    <option value="AI Basics">AI Basics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Experience level</label>
                  <select value={jobExp} onChange={(e) => setJobExp(e.target.value)} className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900">
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500">Full Description</label>
                <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} required rows="4" className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500">Core Requirements</label>
                <textarea value={jobReq} onChange={(e) => setJobReq(e.target.value)} required rows="3" className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900"></textarea>
              </div>

              <button type="submit" className="w-full py-3 bg-brand-500 text-white font-bold text-xs uppercase rounded-lg shadow hover:bg-brand-600">
                {editingJob ? 'Save Job Changes' : 'Publish Job Position'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Create Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full border dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-6">
              <h3 className="font-extrabold text-xl">Create Skill Quiz</h3>
              <button onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleQuizSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500">Quiz Title</label>
                  <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Duration (mins)</label>
                  <input type="number" value={quizDuration} onChange={(e) => setQuizDuration(e.target.value)} required className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500">Category</label>
                <select value={quizCategory} onChange={(e) => setQuizCategory(e.target.value)} className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900">
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="Web Development">Web Development</option>
                  <option value="SQL">SQL</option>
                  <option value="AI Basics">AI Basics</option>
                </select>
              </div>

              {/* Questions row list */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">Multiple Choice Questions</h4>
                  <button type="button" onClick={handleAddQuestionRow} className="text-xs text-brand-500 hover:underline font-bold">
                    + Add Question
                  </button>
                </div>

                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3 border">
                    <p className="text-xs font-bold text-slate-400">Question #{idx + 1}</p>
                    <input
                      type="text"
                      placeholder="Question prompt..."
                      value={q.question_text}
                      onChange={(e) => handleQuestionFieldChange(idx, 'question_text', e.target.value)}
                      required
                      className="w-full text-sm border rounded-lg p-2.5 bg-white dark:bg-slate-800"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Option A" value={q.option_a} onChange={(e) => handleQuestionFieldChange(idx, 'option_a', e.target.value)} required className="text-xs border rounded-lg p-2 bg-white dark:bg-slate-800" />
                      <input type="text" placeholder="Option B" value={q.option_b} onChange={(e) => handleQuestionFieldChange(idx, 'option_b', e.target.value)} required className="text-xs border rounded-lg p-2 bg-white dark:bg-slate-800" />
                      <input type="text" placeholder="Option C" value={q.option_c} onChange={(e) => handleQuestionFieldChange(idx, 'option_c', e.target.value)} required className="text-xs border rounded-lg p-2 bg-white dark:bg-slate-800" />
                      <input type="text" placeholder="Option D" value={q.option_d} onChange={(e) => handleQuestionFieldChange(idx, 'option_d', e.target.value)} required className="text-xs border rounded-lg p-2 bg-white dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Correct Option</label>
                      <select value={q.correct_option} onChange={(e) => handleQuestionFieldChange(idx, 'correct_option', e.target.value)} className="mt-1 text-xs border rounded-lg p-2 bg-white dark:bg-slate-800">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-3 bg-brand-500 text-white font-bold text-xs uppercase rounded-lg shadow hover:bg-brand-600">
                Publish Skill quiz
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
