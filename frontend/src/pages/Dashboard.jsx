import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Award, Briefcase, FileText, CheckCircle, Clock, BookOpen, Star } from 'lucide-react';

export default function Dashboard({ setCurrentTab, setSelectedJobId }) {
  const { user, token, updateProfile, fetchProfile } = useAuth();
  const { addNotification } = useNotification();

  // Profile Edit fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [updating, setUpdating] = useState(false);

  // Stats / Historical Listings
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setSkills(user.skills || '');
      setExperience(user.experience || '');
      setEducation(user.education || '');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      // Fetch Applications
      fetch('http://localhost:5000/api/applications/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setApplications(data.applications || []))
        .catch(err => console.error(err));

      // Fetch Quiz History
      fetch('http://localhost:5000/api/quiz-history/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setQuizHistory(data.history || []))
        .catch(err => console.error(err));

      // Fetch Certificates
      fetch('http://localhost:5000/api/certificates/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCertificates(data.certificates || []))
        .catch(err => console.error(err));

      // Fetch Saved Jobs detail catalog
      fetch('http://localhost:5000/api/jobs')
        .then(res => res.json())
        .then(data => {
          if (user && user.saved_jobs) {
            const savedIds = user.saved_jobs.split(',').filter(Boolean);
            const filtered = data.jobs.filter(j => savedIds.includes(String(j.id)));
            setSavedJobs(filtered);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user, token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, bio, skills, experience, education })
      });
      const data = await res.json();
      if (res.ok) {
        updateProfile(data.user);
        addNotification('Profile details updated successfully.', 'success');
      } else {
        addNotification(data.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      addNotification('Connection error while updating.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadCertificate = (cert) => {
    const printWindow = window.open('', '_blank');
    const certHtml = `
      <html>
        <head>
          <title>Certificate of Achievement - Way to Success</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-50 flex items-center justify-center min-h-screen p-8">
          <div class="border-[16px] border-double border-blue-800 bg-white p-12 max-w-4xl w-full text-center relative shadow-2xl">
            <!-- Decorative Ribbon -->
            <div class="absolute top-4 left-4 border border-blue-900 text-blue-900 px-3 py-1 text-xs font-bold uppercase">
              Way to Success Validation
            </div>

            <div class="text-blue-800 font-extrabold text-4xl tracking-widest uppercase mb-4">
              Certificate of Achievement
            </div>
            <div class="text-slate-500 font-serif italic text-lg mb-8">
              This digital credential certifies that
            </div>

            <div class="text-3xl font-extrabold text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-8 mb-6">
              ${cert.user_name || user.name}
            </div>

            <p class="text-slate-600 text-md leading-relaxed max-w-xl mx-auto mb-8 font-serif">
              has successfully completed all assessment criteria and demonstrated outstanding competence in
              <strong class="block text-xl text-blue-900 mt-2 font-sans">${cert.course_name}</strong>
            </p>

            <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-b border-slate-200 py-6 mb-12">
              <div>
                <span class="block text-xs text-slate-400 uppercase">Assessment Score</span>
                <span class="font-bold text-lg text-emerald-600">${parseFloat(cert.score).toFixed(1)}%</span>
              </div>
              <div>
                <span class="block text-xs text-slate-400 uppercase">Date of Issue</span>
                <span class="font-bold text-lg text-slate-800">${new Date(cert.issued_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <div>
                <span class="block text-xs text-slate-400 uppercase">Certificate ID</span>
                <span class="font-mono font-bold text-md text-slate-800">${cert.certificate_id}</span>
              </div>
            </div>
          </div>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(certHtml);
    printWindow.document.close();
  };

  const handleViewJob = (id) => {
    setSelectedJobId(id);
    setCurrentTab('job-details');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Profile Builder Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-150 dark:border-slate-700 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <User size={20} className="mr-2 text-brand-500" />
              My Profile Section
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add your information to allow recruiters to review your experience and skills.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Bio / Catchphrase</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Highly motivated engineer..."
                className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Key Skills (comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, React, Django"
                className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="2+ Years as Developer"
                className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Education</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="B.Sc. in Computer Science"
                className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 bg-brand-500 text-white font-bold text-xs uppercase rounded-lg shadow hover:bg-brand-600 transition-colors"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Stats, History & Lists Section */}
      <div className="lg:col-span-2 space-y-6">

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-150 dark:border-slate-700">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Applied Jobs</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{applications.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-150 dark:border-slate-700">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Certificates</span>
            <span className="text-3xl font-extrabold text-emerald-600">{certificates.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-150 dark:border-slate-700">
            <span className="block text-xs text-slate-400 font-bold uppercase mb-1">Passed Assessments</span>
            <span className="text-3xl font-extrabold text-brand-500">{quizHistory.filter(q => q.passed).length}</span>
          </div>
        </div>

        {/* Certificates Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-150 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
            <Award size={18} className="mr-2 text-emerald-500" />
            Verified Certificates
          </h3>
          {certificates.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No certificates earned yet. Take standard Skill Quizzes to earn verified credentials!
            </p>
          ) : (
            <div className="space-y-3">
              {certificates.map(cert => (
                <div key={cert.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{cert.course_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">ID: {cert.certificate_id} • Score: {parseFloat(cert.score).toFixed(1)}%</p>
                  </div>
                  <button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 rounded-md"
                  >
                    View Credential
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Jobs Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-150 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
            <Star size={18} className="mr-2 text-amber-500" />
            Bookmarked & Saved Jobs
          </h3>
          {savedJobs.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No bookmarked jobs yet. Find interesting roles in the Catalog.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedJobs.map(job => (
                <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-left space-y-2">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{job.title}</h4>
                  <p className="text-xs text-slate-500">{job.company}</p>
                  <button
                    onClick={() => handleViewJob(job.id)}
                    className="text-xs font-bold text-brand-500 hover:underline mt-2 block"
                  >
                    View Job details &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications History */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-150 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
            <Briefcase size={18} className="mr-2 text-brand-500" />
            Applied Jobs History
          </h3>
          {applications.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No job applications submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{app.job_title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{app.company} • Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-bold bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-100 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-900">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz History Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-150 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
            <BookOpen size={18} className="mr-2 text-indigo-500" />
            Quiz Attempts & Metrics
          </h3>
          {quizHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No quiz attempts logged yet. Check out the Quizzes page.</p>
          ) : (
            <div className="space-y-3">
              {quizHistory.map(hist => (
                <div key={hist.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{hist.quiz_title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Score: {hist.score}/{hist.total_questions} ({parseFloat(hist.percentage).toFixed(1)}%) • {new Date(hist.taken_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    hist.passed
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                  }`}>
                    {hist.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
