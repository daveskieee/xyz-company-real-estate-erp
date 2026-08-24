/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Database, HardHat, Scale, CheckCircle2, Lock } from 'lucide-react';
import { UserSession } from '../types';

interface LoadingScreenProps {
  session: UserSession | null;
  mode: 'login' | 'logout';
  onComplete: () => void;
}

export default function LoadingScreen({ session, mode, onComplete }: LoadingScreenProps) {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);

  const loginSteps = [
    { label: 'Verifying credentials & role privileges...', icon: Lock },
    { label: 'Establishing secure SSL connection to Neon Cloud DB...', icon: Database },
    { label: 'Synchronizing 7-Stage Lot Lifecycle & Titling Pipeline...', icon: Scale },
    { label: `Launching ${session?.role || 'User'} Operations Workspace...`, icon: ShieldCheck },
  ];

  const logoutSteps = [
    { label: 'Committing active workspace transactions...', icon: Database },
    { label: 'Revoking temporary session credentials...', icon: Lock },
    { label: 'Session terminated securely.', icon: CheckCircle2 },
  ];

  const steps = mode === 'login' ? loginSteps : logoutSteps;

  useEffect(() => {
    const totalDuration = mode === 'login' ? 1600 : 1000;
    const intervalTime = totalDuration / steps.length;

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) return prev + 5;
        return 100;
      });
    }, totalDuration / 20);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(onComplete, 250);
    }, totalDuration);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [mode, onComplete, steps.length]);

  const CurrentIcon = steps[stepIndex]?.icon || Building2;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-6 text-white overflow-hidden select-none">
      
      {/* Dynamic Animated Ambient Backdrop */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-6">
        
        {/* Glowing Animated Orb Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 relative z-10 border border-blue-400/30">
            <CurrentIcon className="w-10 h-10 text-white animate-bounce" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-blue-500/30 blur-md animate-ping"></div>
          <div className="absolute -inset-4 rounded-3xl border border-blue-500/20 animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="bg-blue-900/60 border border-blue-700/80 text-blue-300 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              {mode === 'login' ? `AUTHENTICATING • ${session?.role || 'CLIENT'}` : 'SIGNING OUT'}
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {mode === 'login' ? `Welcome, ${session?.name || 'User'}` : 'Closing Workspace Session'}
          </h2>

          <p className="text-xs text-slate-400 font-mono h-5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
            <span>{steps[stepIndex]?.label}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Neon Cloud PostgreSQL</span>
            <span>{progress}%</span>
          </div>
        </div>

      </div>

    </div>
  );
}
