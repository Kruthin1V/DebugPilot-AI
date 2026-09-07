import React, { useState, useEffect } from 'react';
import { generateInterviewQuestions, InterviewQuestionItem } from '../services/api';
import { MessageSquareCode, Sparkles, HelpCircle, Code2, Users, FolderGit2, AlertCircle, Loader2, Copy, Check, ChevronDown, ChevronUp, Briefcase, Settings2, ShieldCheck, Target } from 'lucide-react';

interface InterviewViewProps {
  resumeText: string;
  jobDescription: string;
  onNavigateToDashboard?: () => void;
}

export const InterviewView: React.FC<InterviewViewProps> = ({
  resumeText,
  jobDescription,
  onNavigateToDashboard,
}) => {
  // Input Controls State
  const [targetRole, setTargetRole] = useState<string>('Backend Developer');
  const [difficulty, setDifficulty] = useState<string>('Mixed');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(8);
  const [categories, setCategories] = useState<{ [key: string]: boolean }>({
    'Technical': true,
    'Resume/Project': true,
    'Behavioral/HR': true,
    'Skill Gap': true,
  });

  // Questions State
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Card Accordion Expanded State
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setCategories((prev) => {
      const updated = { ...prev, [cat]: !prev[cat] };
      // Ensure at least one category selected
      if (!Object.values(updated).some(Boolean)) {
        return prev;
      }
      return updated;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = async () => {
    if (!resumeText || resumeText.trim().length < 10) {
      setError('Resume text is required. Please upload your resume on the Dashboard tab.');
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 10) {
      setError('Target job description is required. Please enter a job description on the Dashboard tab.');
      return;
    }

    const selectedCats = Object.keys(categories).filter((k) => categories[k]);
    setLoading(true);
    setError(null);

    try {
      const res = await generateInterviewQuestions(
        resumeText,
        jobDescription,
        targetRole.trim() || 'Software Engineer',
        difficulty,
        numberOfQuestions,
        selectedCats
      );
      setQuestions(res.questions);
      // Auto-expand first question card
      if (res.questions.length > 0) {
        setExpandedCards({ [res.questions[0].id]: true });
      }
    } catch (err: any) {
      console.error("Interview questions generation error", err);
      const detail = err?.response?.data?.detail || 'Failed to generate interview questions. Please verify backend connection.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first render if resume & job text are available and questions list is empty
  useEffect(() => {
    if (resumeText && jobDescription && questions.length === 0) {
      handleGenerate();
    }
  }, []);

  const handleCopyQuestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const handleCopyAnswer = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswerId(id);
    setTimeout(() => setCopiedAnswerId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('technical')) return <Code2 className="w-4 h-4 text-indigo-400" />;
    if (category.toLowerCase().includes('resume') || category.toLowerCase().includes('project')) return <FolderGit2 className="w-4 h-4 text-cyan-400" />;
    if (category.toLowerCase().includes('hr') || category.toLowerCase().includes('behavioral')) return <Users className="w-4 h-4 text-emerald-400" />;
    return <Target className="w-4 h-4 text-amber-400" />;
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff.toLowerCase() === 'easy') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    if (diff.toLowerCase() === 'medium') return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
  };

  const hasInputData = resumeText.trim().length >= 10 && jobDescription.trim().length >= 10;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <MessageSquareCode className="w-3.5 h-3.5" /> Personalized AI Interview Practice
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Targeted Technical & Behavioral Prep</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Generates customized interview questions, expected answer topics, strategic hints, and follow-ups based on your exact resume and target job description.
        </p>
      </div>

      {/* Missing Input Data Warning Banner */}
      {!hasInputData && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">Resume or Job Description Missing</span>
              <span>Upload your PDF resume and paste a target job description on the Dashboard tab to enable personalized question generation.</span>
            </div>
          </div>
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex-shrink-0"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      )}

      {/* Control Panel Settings Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-indigo-400" /> Question Generation Controls
          </h3>
          <span className="text-xs text-slate-400 font-mono">Phase 4 Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Target Role Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Target Role Title
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Backend Developer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Difficulty Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Difficulty Complexity
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Mixed">Mixed (Balanced Easy, Medium, Hard)</option>
              <option value="Easy">Easy (Core Concepts & Fundamentals)</option>
              <option value="Medium">Medium (System Scenarios & Practical Design)</option>
              <option value="Hard">Hard (Deep Concurrency & Edge Cases)</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Question Count: <span className="text-indigo-300 font-mono">{numberOfQuestions}</span>
            </label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value={4}>4 Questions</option>
              <option value={6}>6 Questions</option>
              <option value={8}>8 Questions (Default)</option>
              <option value={10}>10 Questions</option>
              <option value={12}>12 Questions</option>
            </select>
          </div>

        </div>

        {/* Categories Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Included Question Categories
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'Technical', label: 'Technical Skills' },
              { id: 'Resume/Project', label: 'Resume & Projects' },
              { id: 'Behavioral/HR', label: 'Behavioral & HR' },
              { id: 'Skill Gap', label: 'Skill Gap Readiness' },
            ].map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200">
                <input
                  type="checkbox"
                  checked={!!categories[cat.id]}
                  onChange={() => toggleCategory(cat.id)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                />
                {cat.label}
              </label>
            ))}
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading || !hasInputData}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating Personalized Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Interview Questions
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>

      {/* Generated Questions List Section */}
      {questions.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              Personalized Questions ({questions.length})
            </h3>
            <span className="text-xs text-slate-400">Click any question card to toggle answers & details</span>
          </div>

          <div className="space-y-4">
            {questions.map((q) => {
              const isExpanded = !!expandedCards[q.id];
              return (
                <div key={q.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 transition-all hover:border-slate-700">
                  
                  {/* Card Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer" onClick={() => toggleExpand(q.id)}>
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                        {getCategoryIcon(q.category)}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-300">{q.category}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyBadge(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          {q.is_general ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                              General Role
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Personalized
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyQuestion(q.question, q.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1 border border-slate-800 transition-colors"
                      >
                        {copiedQuestionId === q.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" /> Copy Question
                          </>
                        )}
                      </button>
                      <button className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Question Text */}
                  <div className="cursor-pointer" onClick={() => toggleExpand(q.id)}>
                    <h4 className="text-base font-bold text-white leading-relaxed">
                      "{q.question}"
                    </h4>
                  </div>

                  {/* Accordion Expandable Content */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-800/80 space-y-5 animate-fadeIn">
                      
                      {/* Why They're Asking */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" /> Why They're Asking
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          {q.why_this_is_asked}
                        </p>
                      </div>

                      {/* Expected Topics */}
                      {q.expected_topics && q.expected_topics.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" /> Expected Answer Topics
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {q.expected_topics.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hint */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Strategic Hint
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          {q.hint}
                        </p>
                      </div>

                      {/* Sample Answer */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Sample Answer Strategy
                          </span>
                          <button
                            onClick={() => handleCopyAnswer(q.sample_answer, q.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 border border-emerald-500/30 transition-colors"
                          >
                            {copiedAnswerId === q.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied Answer
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Sample Answer
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                          {q.sample_answer}
                        </div>
                      </div>

                      {/* Follow-up Question */}
                      {q.follow_up_question && (
                        <div className="space-y-1 pt-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <MessageSquareCode className="w-3.5 h-3.5" /> Potential Follow-Up Question
                          </span>
                          <p className="text-xs text-rose-200/90 italic bg-rose-950/20 p-3 rounded-xl border border-rose-500/20 leading-relaxed">
                            "{q.follow_up_question}"
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
