/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, LogIn, Key, Mail, Landmark, Users, User, ArrowLeft, ArrowUpRight, 
  ShieldCheck, Sparkles, Building2, HardHat, Scale, Award, CheckCircle2, Ticket,
  Phone, Lock, ExternalLink, RefreshCw
} from 'lucide-react';
import { UserSession } from '../types';

interface LoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
  onBackToLanding: () => void;
  initialInviteToken?: string | null;
}

export default function LoginPortal({ onLoginSuccess, onBackToLanding, initialInviteToken }: LoginPortalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'activate'>(initialInviteToken ? 'activate' : 'login');
  
  // Login State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handover Activation State
  const [inviteToken, setInviteToken] = useState<string>(initialInviteToken || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [verifiedBuyerData, setVerifiedBuyerData] = useState<any | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string>('');
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);

  // Auto-verify initial token if passed in URL
  useEffect(() => {
    if (initialInviteToken) {
      setAuthMode('activate');
      setInviteToken(initialInviteToken);
      verifyToken(initialInviteToken);
    }
  }, [initialInviteToken]);

  // --- 1. TOKEN VERIFIER ---
  const verifyToken = async (tokenToVerify: string) => {
    const cleanToken = tokenToVerify.trim();
    if (!cleanToken) {
      setVerifiedBuyerData(null);
      setTokenError('');
      return;
    }

    setIsVerifyingToken(true);
    setTokenError('');
    try {
      const res = await fetch('/api/auth/verify-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTokenError(data.error || 'Invalid or expired activation token.');
        setVerifiedBuyerData(null);
      } else {
        setVerifiedBuyerData(data.client);
        if (data.client.contact) {
          setContactNumber(data.client.contact);
        }
        setTokenError('');
      }
    } catch (err) {
      setTokenError('Failed to connect to verification server.');
      setVerifiedBuyerData(null);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // --- 2. LOGIN HANDLER ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.isInvited && data.inviteToken) {
          setErrorMsg(data.error);
          // Suggest activating
          setInviteToken(data.inviteToken);
          verifyToken(data.inviteToken);
        } else {
          setErrorMsg(data.error || 'Authentication failed.');
        }
      } else if (data.session) {
        onLoginSuccess(data.session);
      }
    } catch (err) {
      setErrorMsg('Connection error. Could not reach authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. ACTIVATE HANDOVER ACCOUNT HANDLER ---
  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError('');

    if (!inviteToken.trim()) {
      setTokenError('Please enter your Handover Activation Token.');
      return;
    }
    if (newPassword.length < 6) {
      setTokenError('Security passkey must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setTokenError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: inviteToken.trim(),
          password: newPassword,
          contact: contactNumber.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setTokenError(data.error || 'Activation failed.');
      } else if (data.session) {
        setActivationSuccess(true);
        setTimeout(() => {
          onLoginSuccess(data.session);
        }, 800);
      }
    } catch (err) {
      setTokenError('Failed to communicate with activation server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Preset Helper
  const selectAndLoginPreset = async (presetEmail: string, presetPass: string = 'client123') => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: presetEmail, password: presetPass }),
      });
      const data = await res.json();
      if (res.ok && data.session) {
        onLoginSuccess(data.session);
      } else {
        setErrorMsg(data.error || 'Quick login failed.');
      }
    } catch {
      setErrorMsg('Authentication server unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      
      {/* Dynamic Background Ambient Glow */}
      <div className="absolute inset-0 z-0 opacity-25">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-[140px] animate-pulseGlow"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 animate-slideUp">
        
        {/* Left Column: Extensive Features List & Handover Engine Info */}
        <div className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 lg:p-10 border-b border-slate-800 lg:border-b-0 lg:border-r border-slate-800 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <button
              onClick={onBackToLanding}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview Page
            </button>

            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-900/60 border border-blue-700/80 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-blue-300 uppercase tracking-widest block w-fit">
                  PHILIPPINES REAL ESTATE PM SYSTEM
                </span>
                <span className="bg-emerald-950 border border-emerald-700 text-[10px] font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded-full uppercase">
                  HANDOVER ENGINE
                </span>
              </div>

              <h2 className="font-sans font-extrabold text-2xl lg:text-3xl tracking-tight leading-tight mt-3 text-white">
                Subdivision Land PM Portal
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                Developer-to-buyer property handover, government titling milestones (LGU, DAR, DHSUD, BIR eCAR, ROD TCT), engineering punch-list defect verification, and installment ledgers.
              </p>
            </div>

            {/* Handover Flow Graphic Box */}
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Developer-to-Buyer Handover Flow</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-blue-400 font-bold block">1. Lot Allocation</span>
                  <span className="text-slate-400">Admin registers CTS & lot ID</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-teal-400 font-bold block">2. Invite Token</span>
                  <span className="text-slate-400">Unique handover activation link</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold block">3. Buyer Portal</span>
                  <span className="text-slate-400">Live title & digital turnover</span>
                </div>
              </div>
            </div>

            {/* Features Highlight Stack */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-start p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                <div className="bg-blue-950 text-blue-400 p-2 rounded-lg border border-blue-800 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-blue-300">Government Permitting & Titling Pipeline</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live conveyance tracking: DAR clearance, LGU permits, DHSUD license, BIR eCAR, and Registry of Deeds TCT releases.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                <div className="bg-emerald-950 text-emerald-400 p-2 rounded-lg border border-emerald-800 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-emerald-300">Digital Certificate of Lot Acceptance</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Transparent buyer dashboard with verified punch-list resolution and instant property turnover execution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>NEON POSTGRESQL AUTHENTICATION</span>
            <span className="text-emerald-400 font-bold">100% LIVE DB CONNECTED</span>
          </div>
        </div>

        {/* Right Column: Tabbed Sign-In & Handover Activation Forms */}
        <div className="lg:col-span-5 bg-slate-900 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            
            {/* Form Mode Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('activate'); setTokenError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'activate'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Claim Account</span>
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MODE 1: STANDARD USER SIGN IN */}
            {/* ------------------------------------------------------------- */}
            {authMode === 'login' && (
              <div>
                <div className="text-center py-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base mt-2.5">Enterprise Access Portal</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Sign in with your registered credentials
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3 mt-4 text-xs">
                  {errorMsg && (
                    <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                      <div className="space-y-1">
                        <span>{errorMsg}</span>
                        {inviteToken && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('activate');
                              verifyToken(inviteToken);
                            }}
                            className="text-emerald-400 font-bold underline block cursor-pointer hover:text-emerald-300"
                          >
                            Click here to claim & activate this account →
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Account Email ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. angelfiremaui_03@yahoo.com or davematthewreglos@gmail.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Security Passkey
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authenticating with DB...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Workspace</span>
                        <LogIn className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODE 2: DEVELOPER-TO-BUYER HANDOVER ACCOUNT CLAIM FORM */}
            {/* ------------------------------------------------------------- */}
            {authMode === 'activate' && (
              <div>
                <div className="text-center py-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-base mt-2.5">Buyer Handover Activation</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Activate your developer-issued portal access
                  </p>
                </div>

                <form onSubmit={handleActivateSubmit} className="space-y-3 mt-4 text-xs">
                  {tokenError && (
                    <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-lg flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <span>{tokenError}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            if (verifiedBuyerData?.email) {
                              setEmail(verifiedBuyerData.email);
                            }
                          }}
                          className="text-emerald-400 font-bold hover:underline block cursor-pointer pt-0.5"
                        >
                          Already activated? Click here to Sign In →
                        </button>
                      </div>
                    </div>
                  )}

                  {activationSuccess && (
                    <div className="bg-emerald-950/70 border border-emerald-700 text-emerald-200 p-3 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Account claimed successfully! Redirecting to your Buyer Portal...</span>
                    </div>
                  )}

                  {/* Token Input with Auto-Lookup */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-semibold">
                        Handover Activation Token
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setInviteToken('demo-handover-token-2026');
                          verifyToken('demo-handover-token-2026');
                        }}
                        className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        Paste Demo Token
                      </button>
                    </div>

                    <div className="relative">
                      <Ticket className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={inviteToken}
                        onChange={(e) => {
                          setInviteToken(e.target.value);
                          if (e.target.value.length >= 10) {
                            verifyToken(e.target.value);
                          }
                        }}
                        onBlur={() => verifyToken(inviteToken)}
                        placeholder="e.g. 3a7f8b92c4e..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {isVerifyingToken && (
                        <div className="absolute right-3 top-2.5">
                          <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verified Buyer Identity Preview Card */}
                  {verifiedBuyerData && (
                    <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-3 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Contract Record</span>
                        </div>
                        <span className="bg-emerald-900/80 font-mono text-[10px] px-2 py-0.5 rounded text-white">
                          {verifiedBuyerData.slotId || 'PENDING LOT'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Buyer: <strong className="text-white">{verifiedBuyerData.name}</strong> ({verifiedBuyerData.email})
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Package: {verifiedBuyerData.packageName} • ₱{Number(verifiedBuyerData.totalContractPrice).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Password Setup */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Set New Security Passkey (Min. 6 chars)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Confirm Security Passkey
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Establishing Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Claim & Launch Buyer Dashboard</span>
                        <Award className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Quick One-Click Demo Profiles */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Live Database Quick Logins (Presentation)
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => selectAndLoginPreset('angelfiremaui_03@yahoo.com', 'admin123')}
                className="w-full flex items-center justify-between p-2 rounded-xl border border-blue-900/60 bg-blue-950/30 hover:bg-blue-900/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Mauro Principe Jr. (COO)</span>
                    <span className="text-[10px] text-blue-300 font-mono">Admin Role • Operations Engine</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => selectAndLoginPreset('ricardo@jramrealty.com', 'inspector123')}
                className="w-full flex items-center justify-between p-2 rounded-xl border border-teal-900/60 bg-teal-950/30 hover:bg-teal-900/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-teal-600 text-white p-1.5 rounded-lg">
                    <HardHat className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Engr. Ricardo Gomez</span>
                    <span className="text-[10px] text-teal-300 font-mono">Inspector Role • Field QA & Defects</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => selectAndLoginPreset('davematthewreglos@gmail.com', 'client123')}
                className="w-full flex items-center justify-between p-2 rounded-xl border border-amber-900/60 bg-amber-950/30 hover:bg-amber-900/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-600 text-white p-1.5 rounded-lg">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Dave Matthew Reglos</span>
                    <span className="text-[10px] text-amber-300 font-mono">Client VIP • Slot 03 Cavinti</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
