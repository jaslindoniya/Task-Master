import React from 'react';
import { Briefcase, GraduationCap, Award, Search, ArrowRight, CheckCircle2, Star } from 'lucide-react';

export default function Home({ setCurrentTab }) {
  const stats = [
    { label: 'Active Jobs', value: '12,500+', icon: Briefcase },
    { label: 'Validated Quizzes', value: '100+', icon: GraduationCap },
    { label: 'Verified Certificates', value: '85,000+', icon: Award }
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 to-white dark:from-slate-900 dark:to-slate-800 py-20 lg:py-24 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-100 rounded-full text-xs font-semibold">
              <Star size={14} />
              <span>Way to Success Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              Bridge the Gap <br />
              Between <span className="text-brand-500 dark:text-brand-100">Skills</span> and <span className="text-brand-500 dark:text-brand-100">Jobs</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg">
              Take free interactive quizzes in Python, Web Development, and SQL. Score 70%+ to instantly generate shareable professional certificates and connect directly to high-paying employers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => setCurrentTab('jobs')}
                className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Find Jobs</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setCurrentTab('quizzes')}
                className="px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-all"
              >
                Take Skill Quizzes
              </button>
            </div>
          </div>
          <div className="relative flex justify-center">
            {/* Visual Decorative Cards */}
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-150 dark:border-slate-700 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <span className="font-bold text-lg text-slate-800 dark:text-white">Trending Roles</span>
                <span className="text-xs text-brand-500 dark:text-brand-100 font-semibold">Updated today</span>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Python Backend Engineer', salary: '$110k - $130k', matches: 'Quiz Required' },
                  { title: 'Full-Stack Developer (React)', salary: '$120k - $145k', matches: 'Web Dev Certificate' },
                  { title: 'Data/SQL Administrator', salary: '$95k - $115k', matches: 'SQL Certified' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center hover:scale-[1.02] transition-transform">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.salary}</p>
                    </div>
                    <span className="text-[10px] bg-brand-500/10 text-brand-500 dark:text-brand-100 px-2.5 py-1 rounded-full font-bold">
                      {item.matches}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-slate-800/50 py-12 border-y border-slate-150 dark:border-slate-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center p-6 space-y-2">
                <div className="p-3 bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-100 rounded-full">
                  <Icon size={28} />
                </div>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Detail Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Why Way to Success?</h2>
            <p className="text-slate-600 dark:text-slate-400">
              We leverage verified skills instead of just static resumes to identify and present the best-fit job applicants to recruiters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Skill-Based Quizzes',
                desc: 'Assess your technical competence in Python, Java, SQL, and Web Development through interactive multiple-choice challenges.'
              },
              {
                title: 'Immediate Certification',
                desc: 'Acquire verifiable digital credentials that automatically display on your custom candidate profile, proving your real-world readiness.'
              },
              {
                title: 'Verified Job Application',
                desc: 'Apply directly to verified listings on our platform. Recruiters see your performance badges directly attached to your profile.'
              }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all text-left space-y-4">
                <div className="p-2 bg-brand-500 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
