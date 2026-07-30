import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Footer({ setCurrentTab }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Branding */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <div className="bg-brand-500 text-white p-1.5 rounded-md">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">Way to Success</span>
          </div>
          <p className="text-sm">
            Empowering professionals to build essential skills, demonstrate mastery, and land their dream careers through targeted evaluation and recruitment.
          </p>
        </div>

        {/* Explore Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => setCurrentTab('jobs')} className="hover:text-white transition-colors">
                Search Jobs
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('quizzes')} className="hover:text-white transition-colors">
                Skill Quizzes
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('dashboard')} className="hover:text-white transition-colors">
                User Dashboard
              </button>
            </li>
          </ul>
        </div>

        {/* Platform Info */}
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <button onClick={() => setCurrentTab('about')} className="hover:text-white transition-colors">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('contact')} className="hover:text-white transition-colors">
                Contact Us
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('faq')} className="hover:text-white transition-colors">
                Frequently Asked FAQs
              </button>
            </li>
          </ul>
        </div>

        {/* Legal Details */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Details</h3>
          <p className="text-sm leading-relaxed">
            100 Innovation Blvd, Suite 250<br />
            Silicon Valley, CA 94043<br />
            Email: <span className="text-brand-400">support@waytosuccess.com</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-xs">
        &copy; {new Date().getFullYear()} Way to Success. All rights reserved. Made with &hearts; for developers worldwide.
      </div>
    </footer>
  );
}
