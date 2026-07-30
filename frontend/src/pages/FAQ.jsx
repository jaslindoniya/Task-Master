import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: "What is Way to Success and how does it help me?",
      a: "Way to Success is a verified-skill recruitment platform. Candidates take interactive programming and technical quizzes (e.g., Python, SQL, Web Dev). Upon achieving a 70% or higher score, they receive downloadable digital certificates which are automatically embedded in their profile for potential recruiters to view."
    },
    {
      q: "Are the skills quizzes completely free?",
      a: "Yes! All assessment quizzes, evaluations, digital certifications, and custom job application channels on our platform are 100% free of charge for candidates."
    },
    {
      q: "What score do I need to earn a Certificate?",
      a: "You need to score 70% or higher on a quiz to generate and download a validated Certificate of Achievement. If you score lower, you can review the concepts and retake the quiz as many times as you want."
    },
    {
      q: "How can I download or print my Certificate?",
      a: "Once you pass a quiz, click 'Download Certificate'. This opens a print-friendly preview. You can also save it directly as a PDF or access any of your active certificates from the 'Verified Certificates' section of your Dashboard."
    },
    {
      q: "Can I manage or add job listings on the platform?",
      a: "Yes. Admin users have access to an administrative Panel where they can create, update, or delete job listings, construct custom quizzes with questions, and review registered applicants and credentials."
    }
  ];

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-8">

      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center">
          <HelpCircle size={28} className="mr-2 text-brand-500" />
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Got inquiries regarding skill assessments, certificate downloads, or applications? We have answers.
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-4 pt-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-colors"
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full p-5 flex justify-between items-center text-left font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm sm:text-md">{faq.q}</span>
              {openIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {openIdx === idx && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/10 leading-relaxed whitespace-pre-line">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
