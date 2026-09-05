import React, { useState } from 'react';
import { generateInterviewQuestions, InterviewQuestionItem } from '../services/api';
import { MessageSquareCode, Sparkles, HelpCircle, Code2, Users, FolderGit2, Loader2 } from 'lucide-react';

interface InterviewViewProps {
  resumeText: string;
  jobDescription: string;
}

export const InterviewView: React.FC<InterviewViewProps> = ({
  resumeText,
  jobDescription,
}) => {
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([
    {
      category: 'Technical',
      question: 'How do you handle async request validation and exception handling in FastAPI?',
      difficulty: 'Medium',
    },
    {
      category: 'Technical',
      question: 'What strategies do you use for component decomposition and state management in React TypeScript apps?',
      difficulty: 'Hard',
    },
    {
      category: 'Behavioral / HR',
      question: 'Describe a situation where you had to quickly learn a new framework to complete a project milestone.',
      difficulty: 'Medium',
    },
    {
      category: 'Project-Based',
      question: 'Walk me through the architecture of AI CareerPilot and how the frontend communicates with SQLite and PyMuPDF.',
      difficulty: 'Easy',
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateInterviewQuestions(resumeText || 'Sample Resume', jobDescription || 'Sample Job');
      setQuestions(res.questions);
    } catch (err) {
      console.error("Interview questions generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('technical')) return <Code2 className="w-4 h-4 text-indigo-400" />;
    if (category.toLowerCase().includes('hr') || category.toLowerCase().includes('behavioral')) return <Users className="w-4 h-4 text-emerald-400" />;
    return <FolderGit2 className="w-4 h-4 text-cyan-400" />;
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff.toLowerCase() === 'easy') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    if (diff.toLowerCase() === 'medium') return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-950 border border-slate-800 gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <MessageSquareCode className="w-3.5 h-3.5" /> Smart Interview Practice
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Targeted Interview Preparation</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            Generate customized technical, behavioral, and project-based interview questions tailored to your profile.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all flex-shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Refreshing Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Regenerate Questions
            </>
          )}
        </button>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.map((q, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between glass-card-hover">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  {getCategoryIcon(q.category)} {q.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getDifficultyBadge(q.difficulty)}`}>
                  {q.difficulty}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-relaxed">
                "{q.question}"
              </h3>
            </div>
            
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Practice explaining your thought process clearly using STAR method.
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
