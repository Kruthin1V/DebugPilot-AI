import React, { useEffect, useState } from 'react';
import { checkBackendHealth, HealthStatus } from '../services/api';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const StatusBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await checkBackendHealth();
      setHealth(data);
      setError(false);
    } catch (err) {
      console.error("Backend health check failed", err);
      setError(true);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium">
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
      ) : error ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 ml-0.5" />
          <span className="text-red-300">Backend Offline</span>
        </>
      ) : (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
          <span className="text-emerald-300">FastAPI Online</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-mono">v{health?.version}</span>
        </>
      )}
      <button 
        onClick={fetchHealth} 
        title="Check Backend Status" 
        className="ml-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Activity className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
