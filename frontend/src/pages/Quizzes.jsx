import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Award, GraduationCap, CheckCircle, AlertTriangle, Play, HelpCircle, Clock, AwardIcon, ChevronRight } from 'lucide-react';

export default function Quizzes({ setCurrentTab }) {
  const { user, token } = useAuth();
  const { addNotification } = useNotification();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz Taking flow states
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: "A"/"B"/"C"/"D" }
  const [quizActive, setQuizActive] = useState(false);

  // Timer Configuration
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Result States
  const [results, setResults] = useState(null); // { score, totalQuestions, percentage, passed, certificate }
  const [showingCertificate, setShowingCertificate] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/quizzes');
      const data = await res.json();
      if (res.ok) {
        setQuizzes(data.quizzes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quiz) => {
    if (!user) {
      addNotification('Please login or register to take quizzes and earn certificates.', 'info');
      setCurrentTab('login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${quiz.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedQuiz(data.quiz);
        setQuestions(data.questions);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setTimeLeft(data.quiz.duration * 60);
        setQuizActive(true);
        setResults(null);
        setShowingCertificate(false);

        // Start countdown timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleAutoSubmit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      addNotification('Failed to fetch quiz details.', 'error');
    }
  };

  const handleAnswerSelect = (option) => {
    const qId = questions[currentQuestionIndex].id;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    addNotification('Time is up! Submitting answers...', 'info');
    submitQuizAnswers();
  };

  const submitQuizAnswers = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizActive(false);

    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${selectedQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: userAnswers })
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
        if (data.passed) {
          addNotification('Congratulations! You passed the quiz and earned a certificate.', 'success');
        } else {
          addNotification('Quiz completed! You scored less than the 70% passing threshold.', 'info');
        }
      } else {
        addNotification(data.error || 'Failed to submit quiz responses.', 'error');
      }
    } catch (err) {
      addNotification('Could not submit responses to the server.', 'error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // HTML direct-download simulator / rendering
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

            <div class="flex justify-between items-end max-w-2xl mx-auto">
              <div class="text-left">
                <div class="border-t border-slate-300 w-44 pt-1 text-center">
                  <span class="text-xs text-slate-500 font-semibold block">Academic Committee</span>
                  <span class="text-[10px] text-slate-400">Way to Success Verification</span>
                </div>
              </div>

              <div class="w-20 h-20 bg-amber-500/10 border-4 border-dashed border-amber-500 rounded-full flex items-center justify-center text-amber-600 font-bold uppercase tracking-wider text-xs">
                Seal
              </div>

              <div class="text-right">
                <div class="border-t border-slate-300 w-44 pt-1 text-center">
                  <span class="text-xs text-slate-500 font-semibold block">Managing Director</span>
                  <span class="text-[10px] text-slate-400">Platform Administrator</span>
                </div>
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-sm text-slate-500 mt-4">Setting up quiz papers...</p>
      </div>
    );
  }

  // Active Quiz View
  if (quizActive && selectedQuiz) {
    const q = questions[currentQuestionIndex];
    const userAns = userAnswers[q.id];

    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 py-10 transition-colors text-left">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700 shadow-md p-6 sm:p-8 space-y-6">

            {/* Quiz Header & Timer */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedQuiz.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Question <span className="font-bold text-slate-800 dark:text-slate-200">{currentQuestionIndex + 1}</span> of {questions.length}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900">
                <Clock size={16} />
                <span className="font-mono font-bold text-sm">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h3 className="text-md sm:text-lg font-bold text-slate-800 dark:text-white leading-relaxed flex">
                <HelpCircle size={20} className="mr-2 text-brand-500 flex-shrink-0 mt-0.5" />
                {q.question_text}
              </h3>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { key: 'A', text: q.option_a },
                  { key: 'B', text: q.option_b },
                  { key: 'C', text: q.option_c },
                  { key: 'D', text: q.option_d }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleAnswerSelect(opt.key)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center space-x-3 ${
                      userAns === opt.key
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-600/10'
                        : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      userAns === opt.key
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation & Submit Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border rounded-md text-sm font-semibold disabled:opacity-40"
              >
                Previous
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={submitQuizAnswers}
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-md shadow"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold rounded-md"
                >
                  Next
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Quiz Score/Results View
  if (results) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 py-10 transition-colors">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700 shadow-lg p-8 space-y-8 text-center">

            {results.passed ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                  <CheckCircle size={36} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Assessment Cleared!
                </h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Outstanding job! You scored a high mark on {selectedQuiz.title} and are eligible for instant certification.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border-4 border-amber-50">
                  <AlertTriangle size={36} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Keep Practicing!
                </h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  You scored less than the 70% passing threshold required to generate credentials. Try studying the core syntax and re-take the quiz!
                </p>
              </div>
            )}

            {/* Numerical Score Stats */}
            <div className="grid grid-cols-3 gap-4 border-y border-slate-100 dark:border-slate-700 py-6">
              <div>
                <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Your Score</span>
                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {results.score} / {results.totalQuestions}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Percentage</span>
                <span className={`text-2xl font-extrabold ${results.passed ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {parseFloat(results.percentage).toFixed(1)}%
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Status</span>
                <span className={`text-2xl font-extrabold ${results.passed ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {results.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {results.passed && results.certificate && (
                <button
                  onClick={() => handleDownloadCertificate(results.certificate)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Award size={18} />
                  <span>Download Certificate</span>
                </button>
              )}

              <button
                onClick={() => handleStartQuiz(selectedQuiz)}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg"
              >
                Retake Assessment
              </button>

              <button
                onClick={() => setResults(null)}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg"
              >
                Back to Quizzes
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Quizzes Landing List View
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-left">
      <div className="space-y-2 border-b border-slate-150 dark:border-slate-700 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Validated Skill Quizzes
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete individual assessments to display certified status on your profile. A score of 70% or more qualifies you for an instant Certificate.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-slate-500">No active quizzes found on the platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-150 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-extrabold bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-100 px-2.5 py-1 rounded-full">
                    {quiz.category}
                  </span>
                  <span className="text-xs text-slate-400 font-bold flex items-center">
                    <Clock size={13} className="mr-1" />
                    {quiz.duration} mins
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Assess key terminology, basic code block compilation, syntax patterns, and conceptual application.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="mt-6 w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shadow text-xs flex items-center justify-center space-x-1"
              >
                <Play size={14} />
                <span>Begin Assessment</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
