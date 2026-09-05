import React from 'react';
import { AnalysisResult } from '../services/api';
import { Award, CheckCircle2, XCircle, Key, ShieldCheck, AlertTriangle, Lightbulb, CheckSquare, ArrowRight, AlertCircle } from 'lucide-react';

interface AnalysisViewProps {
  analysis: AnalysisResult | null;
  onNavigateToImprove: () => void;
  onNavigateToInterview: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  onNavigateToImprove,
  onNavigateToInterview,
}) => {
  if (!analysis) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto my-12 border border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Analysis Results Yet</h3>
        <p className="text-sm text-slate-400">
          Upload your PDF resume and enter a target job description on the Dashboard tab, then click <strong>Analyze Resume Match</strong> to view your customized match report.
        </p>
      </div>
    );
  }

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-amber-500/20';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-rose-500/20';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Scores Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ATS Score */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">ATS Parsing & Format Score</span>
            <div className="text-4xl font-extrabold text-white">{analysis.ats_score} <span className="text-lg font-normal text-slate-500">/ 100</span></div>
            <p className="text-xs text-slate-400">Evaluates readability, section structure, and keyword density.</p>
          </div>
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center font-extrabold text-2xl shadow-lg ${getScoreBadgeStyle(analysis.ats_score)}`}>
            {analysis.ats_score}%
          </div>
        </div>

        {/* Job Match Score */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Job Requirement Match</span>
            <div className="text-4xl font-extrabold text-white">{analysis.job_match_score} <span className="text-lg font-normal text-slate-500">/ 100</span></div>
            <p className="text-xs text-slate-400">Evaluates technical skills overlap and qualifications.</p>
          </div>
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center font-extrabold text-2xl shadow-lg ${getScoreBadgeStyle(analysis.job_match_score)}`}>
            {analysis.job_match_score}%
          </div>
        </div>

      </div>

      {/* Skills & Keyword Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Matching Skills */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Matching Skills
            </h4>
            <span className="text-xs text-emerald-400/80 font-mono">({analysis.matching_skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            {analysis.matching_skills.length > 0 ? (
              analysis.matching_skills.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No explicit matching skills extracted.</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Missing Skills
            </h4>
            <span className="text-xs text-rose-400/80 font-mono">({analysis.missing_skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            {analysis.missing_skills.length > 0 ? (
              analysis.missing_skills.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No missing skills identified! Great match!</span>
            )}
          </div>
        </div>

        {/* Important Keywords */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Key className="w-4 h-4" /> Critical Keywords
            </h4>
            <span className="text-xs text-cyan-400/80 font-mono">({analysis.important_keywords.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
            {analysis.important_keywords.length > 0 ? (
              analysis.important_keywords.map((kw, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No extra keywords extracted.</span>
            )}
          </div>
        </div>

      </div>

      {/* Comprehensive Analysis Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Strengths & Weaknesses */}
        <div className="space-y-6">
          
          {/* Strengths */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.resume_strengths.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Resume Weaknesses & Gaps
            </h4>
            <ul className="space-y-2">
              {analysis.resume_weaknesses.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Potential Issues */}
          {analysis.potential_issues && analysis.potential_issues.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Potential Red Flags / Formatting Issues
              </h4>
              <ul className="space-y-2">
                {analysis.potential_issues.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right Column: Suggestions & Recommended Action Items */}
        <div className="space-y-6">
          
          {/* Improvement Suggestions */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" /> Improvement Suggestions
            </h4>
            <ul className="space-y-2">
              {analysis.improvement_suggestions.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Changes */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" /> Recommended Action Items
            </h4>
            <ul className="space-y-2">
              {analysis.recommended_changes.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Next Steps CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/20 gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Optimize individual bullet points next</h4>
          <p className="text-xs text-slate-400">Use our AI Bullet Optimizer or generate practice interview questions based on this match report.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToImprove}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            Bullet Optimizer <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNavigateToInterview}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            Interview Prep <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
