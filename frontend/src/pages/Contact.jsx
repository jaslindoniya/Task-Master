import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Send, Mail, MapPin, Phone, HelpCircle } from 'lucide-react';

export default function Contact() {
  const { addNotification } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      addNotification('Please fill out all the fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      if (res.ok) {
        addNotification('Your message has been received! We will get back to you shortly.', 'success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        addNotification('Something went wrong, please try again.', 'error');
      }
    } catch (err) {
      addNotification('Failed to submit message to the server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Informational Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-xl p-6 shadow-md space-y-6">
          <h2 className="text-2xl font-extrabold leading-snug">Get in Touch with Our Team</h2>
          <p className="text-sm text-brand-100 leading-relaxed">
            Have questions about your certificates, job postings, or taking specific assessments? Send us a line and our expert curators will reply back in under 24 hours.
          </p>

          <div className="space-y-4 pt-4 border-t border-brand-400 text-xs">
            <div className="flex items-center space-x-3">
              <Mail size={18} className="text-brand-200" />
              <span>support@waytosuccess.com</span>
            </div>

            <div className="flex items-center space-x-3">
              <Phone size={18} className="text-brand-200" />
              <span>+1 (800) 555-JOB-GO</span>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin size={18} className="text-brand-200" />
              <span>Silicon Valley Office, Suite 250</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Form */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-150 dark:border-slate-700 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send Us an Inquiry</h3>
          <p className="text-xs text-slate-500 mt-1">Please provide clear specifics so we can direct your inquiry to the right support manager.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Certificate Inquiries, Job listings errors..."
              className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide a detailed overview of your inquiry..."
              rows="5"
              className="mt-1 w-full text-sm border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase rounded-lg shadow transition-all flex items-center justify-center space-x-2"
          >
            <Send size={14} />
            <span>{loading ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
