import React from 'react';
import { ShieldCheck, Award, Briefcase, ChevronRight, UserCheck } from 'lucide-react';

export default function About({ setCurrentTab }) {
  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12">

      {/* Introduction Hero banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About Way to Success
        </h1>
        <p className="text-md text-slate-600 dark:text-slate-400 leading-relaxed">
          We believe traditional resumes are failing candidates and companies. Way to Success is a platform built to replace standard keyword-matching static documents with dynamic, performance-verified credentials.
        </p>
      </div>

      {/* Corporate Mission/Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Our objective is to streamline the recruitment process. By matching standard job lists directly with free, interactive coding assessments and skill certifications, we give candidates a tangible, validated method of showcasing their real technical competence.
          </p>

          <div className="space-y-4">
            {[
              { title: 'Verified Candidates', desc: 'Assessments prevent falsification and guarantee competency.' },
              { title: 'Free Certification', desc: 'Anyone, anywhere can assess their expertise and earn credentials.' },
              { title: 'Fast Application', desc: 'Job applications are linked immediately to real credentials.' }
            ].map((v, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="p-1.5 bg-brand-500 text-white rounded-full mt-0.5">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">{v.title}</h4>
                  <p className="text-xs text-slate-500">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700/50 space-y-6">
          <h3 className="font-extrabold text-lg">Platform statistics</h3>
          <div className="space-y-4">
            {[
              { label: 'Registered Engineers', value: '185,000+', icon: UserCheck },
              { label: 'Validated Certifications', value: '120,000+', icon: Award },
              { label: 'Verified Partners & Jobs', value: '45,000+', icon: Briefcase }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="p-3 bg-white dark:bg-slate-900 border text-brand-500 rounded-xl">
                    <Icon size={20} />
                  </div>
                  <div>
                    <span className="block text-xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                    <span className="text-xs text-slate-500 font-semibold">{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
