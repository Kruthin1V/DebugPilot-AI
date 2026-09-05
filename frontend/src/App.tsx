import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AnalysisView } from './components/AnalysisView';
import { ImprovementView } from './components/ImprovementView';
import { InterviewView } from './components/InterviewView';
import { AnalysisResult } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setActiveTab('analysis');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col bg-radial-glow selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Bar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            resumeText={resumeText}
            setResumeText={setResumeText}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisView
            analysis={analysisResult}
            onNavigateToImprove={() => setActiveTab('improve')}
            onNavigateToInterview={() => setActiveTab('interview')}
          />
        )}

        {activeTab === 'improve' && (
          <ImprovementView />
        )}

        {activeTab === 'interview' && (
          <InterviewView resumeText={resumeText} jobDescription={jobDescription} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-300">AI CareerPilot</span> — Resume & Job Matching Platform (Phase 1)
          </div>
          <div>
            Built with FastAPI, PyMuPDF, SQLite, React & Tailwind CSS
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
