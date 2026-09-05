import React, { useState } from 'react';
import { uploadResumePDF, analyzeResumeAndJob, AnalysisResult } from '../services/api';
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, ArrowRight, Loader2, Info } from 'lucide-react';

interface DashboardViewProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  resumeText,
  setResumeText,
  jobDescription,
  setJobDescription,
  onAnalysisComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Client side pre-validation
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Invalid file format. Only PDF files (.pdf) are supported.');
        setFile(null);
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError(`File size (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 5MB.`);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setUploading(true);
      setUploadSuccess(null);

      try {
        const res = await uploadResumePDF(selectedFile);
        setResumeText(res.extracted_text);
        setUploadSuccess(`Successfully extracted ${res.page_count} page(s) from '${res.filename}' (${Math.round(res.file_size_bytes / 1024)} KB).`);
      } catch (err: any) {
        console.error("PDF extraction failure", err);
        const detail = err?.response?.data?.detail || 'Failed to extract text from PDF resume. Please ensure the file is not password protected or image-only.';
        setError(detail);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || resumeText.trim().length < 15) {
      setError('Please upload a PDF resume or enter at least 15 characters of resume text.');
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 15) {
      setError('Please paste a valid target job description (at least 15 characters).');
      return;
    }

    setError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeResumeAndJob(resumeText, jobDescription);
      onAnalysisComplete(result);
    } catch (err: any) {
      console.error("Analysis failure", err);
      const detail = err?.response?.data?.detail || 'Analysis failed. Please check backend connection.';
      setError(detail);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-b from-indigo-900/40 via-slate-900/50 to-slate-950 p-8 sm:p-10 border border-indigo-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> AI Resume & Job Matcher
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Optimize Your Resume with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200">Gemini Intelligence</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload your PDF resume and paste a target job description. AI CareerPilot parses your profile, computes your ATS compatibility score, surfaces missing technical keywords, and provides actionable bullet rewrites.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Validation Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: PDF Resume Upload */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> 1. Resume PDF Upload
              </h2>
              {uploadSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5" /> Extracted
                </span>
              )}
            </div>

            {/* Drop Zone */}
            <div className="relative group border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-6 text-center transition-all bg-slate-900/50 hover:bg-slate-900/80 cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-200">
                  {uploading ? 'Extracting text with PyMuPDF...' : file ? file.name : 'Select or Drag & Drop PDF Resume'}
                </div>
                <p className="text-[11px] text-slate-500">Maximum file size: 5MB (.pdf format)</p>
              </div>
            </div>

            {uploadSuccess && (
              <p className="text-xs text-emerald-400/90 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> {uploadSuccess}
              </p>
            )}

            {/* Resume Text Editor */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">
                Extracted Resume Content (Editable)
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Extracted text from your PDF resume will appear here automatically..."
                className="w-full h-44 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Job Description Input */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-cyan-400" /> 2. Target Job Description
              </h2>
              <p className="text-xs text-slate-400">
                Paste the job posting including requirements, technical skills, and responsibilities.
              </p>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste full job description here (e.g. We are seeking a Full Stack Software Engineer skilled in Python, FastAPI, React, TypeScript, and SQL...)"
              className="w-full h-64 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || uploading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running AI Match Analysis...
                </>
              ) : (
                <>
                  Analyze Resume Match <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
