import React, { useState } from 'react';
import { improveResumeBullet } from '../services/api';
import { Edit3, Sparkles, Copy, Check, Loader2 } from 'lucide-react';

export const ImprovementView: React.FC = () => {
  const [bulletPoint, setBulletPoint] = useState<string>(
    'Worked on backend APIs for company web application using Python and FastAPI.'
  );
  const [improved, setImproved] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!bulletPoint.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await improveResumeBullet(bulletPoint);
      setImproved(res.improved_bullet);
    } catch (err: any) {
      console.error("Improve bullet error", err);
      setError("Failed to improve bullet point. Please verify backend service.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (improved) {
      navigator.clipboard.writeText(improved);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Edit3 className="w-3.5 h-3.5" /> High-Impact Action Rewriter
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">AI Resume Bullet Point Optimizer</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Transform weak or passive resume bullets into quantifiable, ATS-friendly achievement statements with action verbs.
        </p>
      </div>

      {/* Interactive Rewriter Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        
        {/* Input Bullet */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Original Resume Bullet Point
          </label>
          <textarea
            value={bulletPoint}
            onChange={(e) => setBulletPoint(e.target.value)}
            placeholder="Enter a bullet point from your resume (e.g. Created login page and updated database schema...)"
            className="w-full h-28 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleImprove}
            disabled={loading || !bulletPoint.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Rewriting Bullet...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Rewrite & Optimize Bullet
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>
        )}

        {/* Output Comparison Card */}
        {improved && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Optimized Output
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Bullet
                  </>
                )}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-slate-100 text-xs sm:text-sm font-medium leading-relaxed">
              "{improved}"
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
