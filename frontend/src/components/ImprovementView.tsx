import React, { useState } from 'react';
import { improveResumeBullet, ImproveBulletResult } from '../services/api';
import { Edit3, Sparkles, Copy, Check, Loader2, AlertCircle, AlertTriangle, Key, Lightbulb, Briefcase, FileText, ArrowRight, CheckCircle2, PlusCircle } from 'lucide-react';

interface ImprovementViewProps {
  initialBullet?: string;
  initialJobDescription?: string;
}

export const ImprovementView: React.FC<ImprovementViewProps> = ({
  initialBullet = 'Worked on backend APIs for company web app using Python and FastAPI.',
  initialJobDescription = '',
}) => {
  const [bulletPoint, setBulletPoint] = useState<string>(initialBullet);
  const [targetRole, setTargetRole] = useState<string>('Backend Developer');
  const [jobDescription, setJobDescription] = useState<string>(initialJobDescription);
  
  const [result, setResult] = useState<ImproveBulletResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // -1 for main, 0..N for alternatives
  const [error, setError] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!bulletPoint || !bulletPoint.trim()) {
      setError('Please enter a bullet point from your resume to optimize.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await improveResumeBullet(
        bulletPoint.trim(),
        jobDescription.trim() || undefined,
        targetRole.trim() || undefined
      );
      setResult(data);
    } catch (err: any) {
      console.error("Improve bullet error", err);
      const detail = err?.response?.data?.detail || 'Failed to optimize bullet point. Please ensure backend is running.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Edit3 className="w-3.5 h-3.5" /> Fact-Grounded Action Rewriter
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">AI Resume Bullet Point Optimizer</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Refine phrasing, ATS readability, and sentence structure with strict truthfulness. Never invents metrics, technologies, or ungrounded leadership claims.
        </p>
      </div>

      {/* Input Form Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        
        {/* Target Role & Job Description Optional Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Target Role Title (Optional)
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Backend Developer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Target Job Posting Keywords (Optional)
            </label>
            <input
              type="text"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Python, FastAPI, React, SQL, REST API..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Primary Input Bullet Point */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Original Resume Bullet Point <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={bulletPoint}
            onChange={(e) => setBulletPoint(e.target.value)}
            placeholder="Enter a bullet point from your resume (e.g. Worked on backend APIs for company web app using Python and FastAPI...)"
            className="w-full h-28 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
          />
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button
            onClick={handleImprove}
            disabled={loading || !bulletPoint.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Optimizing Bullet with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Optimize Bullet Point
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

      {/* Results Output Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Warnings Box if bullet lacks metrics/detail */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Bullet Detail & Metric Warning
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 pl-1">
                {result.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary Recommended Improved Bullet */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-emerald-950/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Fact-Grounded ATS Version
              </span>
              <button
                onClick={() => handleCopyText(result.improved_bullet, -1)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
              >
                {copiedIndex === -1 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Primary Bullet
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-medium text-white leading-relaxed font-sans">
              "{result.improved_bullet}"
            </div>
          </div>

          {/* Alternative Bullet Versions */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-cyan-400" /> Alternative Bullet Phrasings ({result.alternatives.length})
              </h3>
              <div className="space-y-3">
                {result.alternatives.map((alt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-4">
                    <p className="text-xs text-slate-200 leading-relaxed font-sans mt-0.5">"{alt}"</p>
                    <button
                      onClick={() => handleCopyText(alt, idx)}
                      className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1 border border-slate-800 transition-colors flex-shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown: Improvements Made & Keyword Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Improvements Made */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" /> What Was Improved
              </h4>
              <ul className="space-y-2">
                {result.improvements_made.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Keyword Analysis: Supported vs Suggested */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" /> Keyword Analysis
              </h4>

              {/* Supported by Resume */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Supported by Resume
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.supported_keywords && result.supported_keywords.length > 0 ? (
                    result.supported_keywords.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No explicit tech keywords detected in original bullet.</span>
                  )}
                </div>
              </div>

              {/* Suggested from Job Description */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Suggested from Job Description
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.suggested_keywords && result.suggested_keywords.length > 0 ? (
                    result.suggested_keywords.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No unmentioned job description keywords found.</span>
                  )}
                </div>
                {result.suggested_keywords && result.suggested_keywords.length > 0 && (
                  <p className="text-[10px] text-slate-400 italic pt-1">
                    * Suggested keywords appear in target job posting but are NOT in your bullet. Add only if you possess this hands-on experience.
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
