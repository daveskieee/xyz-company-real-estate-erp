/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, Landmark, CheckCircle2, AlertCircle, FileText, Download, 
  Map, Calendar, ArrowRight, ShieldCheck, MapPin, Scale, HardHat,
  FileCheck2, Award, Clock, Sparkles, Check, UserCheck, AlertTriangle
} from 'lucide-react';
import { Client, Slot, QALog, CivilWorksMilestone, PunchListDefect } from '../types';

interface ClientPortalProps {
  client: Client | undefined;
  slots: Slot[];
  qaLogs: QALog[];
  civilWorksMilestones: CivilWorksMilestone[];
  punchListDefects: PunchListDefect[];
  onSignAcceptance: (clientId: string, clientName: string) => void;
  onLogout: () => void;
}

export default function ClientPortal({
  client, slots, qaLogs, civilWorksMilestones, punchListDefects,
  onSignAcceptance, onLogout
}: ClientPortalProps) {
  
  const [signedSuccess, setSignedSuccess] = useState<boolean>(false);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Guard: show loading state while client data is being fetched
  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Find assigned lot
  const assignedLot = slots.find(s => s.id === client.slotId);
  
  // Find QA logs for this lot
  const lotQaLogs = qaLogs.filter(q => q.slotId === client.slotId);

  const tm = client.titleMilestones ?? {};
  const kyc = client.buyerKyc;

  // Calculate titling steps completed
  const titlingSteps = [
    { label: 'DAR Clearance', completed: tm.darClearanceApproved, agency: 'Dept. of Agrarian Reform' },
    { label: 'LGU Dev Permit', completed: tm.lguPermitIssued, agency: 'Municipal Government' },
    { label: 'DHSUD License to Sell', completed: tm.dhsudLicenseToSell, agency: 'Housing & Urban Dev' },
    { label: 'Contract to Sell (CTS)', completed: tm.ctsSigned, agency: 'Developer Legal Counsel' },
    { label: 'Deed of Absolute Sale', completed: tm.deedOfSaleSigned, agency: 'Notary & Legal Office' },
    { label: 'BIR eCAR Issuance', completed: tm.birEcarIssued, agency: 'Bureau of Internal Revenue' },
    { label: 'Assessor Tax Declaration', completed: tm.taxDeclarationTransferred, agency: 'Provincial Assessor' },
    { label: 'Registry of Deeds TCT', completed: tm.registryOfDeedsTctReleased, agency: 'Registry of Deeds' },
  ];

  const completedTitlingCount = titlingSteps.filter(s => s.completed).length;
  const titlingPercent = Math.round((completedTitlingCount / titlingSteps.length) * 100);

  const isReadyForHandover = tm.registryOfDeedsTctReleased && !tm.certificateOfAcceptanceSigned;
  const isHandedOver = tm.certificateOfAcceptanceSigned;

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans" id="client-buyer-portal">
      
      {/* Top Banner Navigation */}
      <nav className="bg-slate-950 border-b border-slate-800 py-4 px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-mono block font-bold leading-none uppercase">PROJECT BUYER ONBOARDING & TRANSPARENCY INTERFACE</span>
              <h2 className="font-sans font-bold text-white text-sm mt-1">Cavinti Highland Crest • Property Ownership & Titling Tracker</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Buyer</span>
              <strong className="text-xs text-white block">{client.name}</strong>
            </div>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Welcome Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-800/60 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <span className="bg-blue-900/80 border border-blue-700 text-blue-300 px-3 py-0.5 rounded-full text-xs font-mono font-bold">
                ACCOUNT: {client.id}
              </span>
              {assignedLot && (
                <span className="bg-emerald-950 border border-emerald-700 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-mono font-bold">
                  ASSIGNED: {assignedLot.id}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {client.name}!
            </h1>
            <p className="text-xs text-slate-300 max-w-xl font-medium">
              Monitor your property's civil works engineering progress, government registry filings, and official title turnover in real-time.
            </p>
          </div>

          <div className="z-10 text-right space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Current Development Phase</span>
            <div className="bg-purple-950 border border-purple-700 text-purple-300 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm">
              {tm.currentPhase}
            </div>
          </div>
        </div>

        {/* Handover Alert Ribbon if Ready */}
        {isReadyForHandover && (
          <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">🎉 Your Property is Ready for Official Turnover!</h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  The Registry of Deeds has released your individual Transfer Certificate of Title (TCT: {tm.tctNumber || 'Available'}). You may now execute the Certificate of Acceptance.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSignModal(true)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg cursor-pointer transition-all uppercase tracking-wider shrink-0"
            >
              Sign Certificate of Acceptance ➔
            </button>
          </div>
        )}

        {isHandedOver && (
          <div className="bg-emerald-950/80 border border-emerald-600 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-200 text-xs shadow-md animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white text-sm block">Property Officially Handed Over & Released</strong>
                <span>Certificate of Lot Acceptance signed. Physical boundaries, markers, and title documentation released.</span>
              </div>
            </div>
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>View Official Certificate</span>
            </button>
          </div>
        )}

        {/* Top 3 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Property Specification */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              Property & Subdivision Specs
            </h3>

            {assignedLot ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lot Identifier:</span>
                  <strong className="text-white font-mono">{assignedLot.id} (Lot #{assignedLot.slotNumber})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subdivision:</span>
                  <strong className="text-white">Cavinti Highland Crest</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lot Area:</span>
                  <strong className="text-white font-mono">{assignedLot.areaSqm} Sq. Meters</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Package Type:</span>
                  <span className="text-slate-300 font-medium">{client.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lifecycle Status:</span>
                  <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                    {assignedLot.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No slot assigned currently.</p>
            )}
          </div>

          {/* Card 2: Government Titling Progress */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Scale className="w-4 h-4 text-purple-400" />
              Government Titling Progress
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Registry Pipeline:</span>
                <span className="font-mono text-purple-300 font-bold">{completedTitlingCount} of {titlingSteps.length} Steps ({titlingPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${titlingPercent}%` }}
                ></div>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">TCT Number:</span>
                  <strong className="text-white">{tm.tctNumber || 'In Processing (RD)'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax Dec Number:</span>
                  <strong className="text-white">{tm.taxDecNumber || 'In Processing (Assessor)'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Buyer KYC Compliance */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Buyer Qualification Status
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">KYC Status:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  kyc?.kycStatus === 'VERIFIED' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' : 'bg-amber-950 border border-amber-700 text-amber-300'
                }`}>
                  {kyc?.kycStatus || 'PENDING'}
                </span>
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                {[
                  { label: 'Government ID', ok: kyc?.govtIdVerified },
                  { label: 'BIR TIN Verification', ok: kyc?.tinVerified },
                  { label: 'Proof of Income / ITR', ok: kyc?.proofOfIncomeVerified },
                  { label: 'Proof of Billing / Address', ok: kyc?.proofOfAddressVerified },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-slate-300">
                    <span>{d.label}:</span>
                    <span className={d.ok ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {d.ok ? '✓ Verified' : 'Pending Verification'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Titling Agency Pipeline Stepper */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-400" />
                Government Agencies Titling Pipeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official transparency tracker for government registry and conveyance approvals.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Verified by XYZ Legal & Compliance Division
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {titlingSteps.map((step, idx) => (
              <div 
                key={step.label}
                className={`p-4 rounded-xl border transition-all ${
                  step.completed 
                    ? 'bg-purple-950/40 border-purple-700/80 shadow-xs' 
                    : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">STAGE 0{idx + 1}</span>
                  {step.completed ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold">✓</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">○</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white">{step.label}</h4>
                <p className="text-[10px] text-purple-300 font-mono mt-1">{step.agency}</p>
                <div className="mt-2 text-[10px] font-semibold">
                  {step.completed ? (
                    <span className="text-emerald-400">✓ Official Clearance Approved</span>
                  ) : (
                    <span className="text-slate-500">In Docket Review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Engineering & Civil Works Live Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Civil Works Milestones */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <HardHat className="w-4 h-4 text-amber-400" />
              Subdivision Civil Works Progress
            </h3>

            <div className="space-y-3.5">
              {civilWorksMilestones.map((m) => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{m.phaseName}</span>
                    <span className="font-mono text-amber-400 font-bold">{m.currentPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${m.currentPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Status: <strong className="text-slate-200">{m.status}</strong></span>
                    <span>{m.inspectorSignOff ? '✓ Quality Inspected' : 'Ongoing'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection QA Reports for This Lot */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              Inspector Site Logs for {assignedLot?.id || 'Your Lot'}
            </h3>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {lotQaLogs.length > 0 ? (
                lotQaLogs.map((log) => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-teal-400 font-bold">{log.siteActivity}</span>
                      <span className="text-slate-400">{log.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>Structural: <strong className="text-emerald-400">{log.structuralCheck}</strong></div>
                      <div>Safety: <strong className="text-emerald-400">{log.safetyCheck}</strong></div>
                    </div>
                    <p className="text-slate-400 italic text-[11px] pt-1 border-t border-slate-800">
                      "{log.remarks}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No site logs logged yet for this specific lot.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal: Sign Certificate of Lot Acceptance */}
        {showSignModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Certificate of Lot Acceptance</h3>
                </div>
                <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p>
                  I, <strong className="text-white">{client.name}</strong>, hereby acknowledge and confirm that I have inspected <strong>Lot {assignedLot?.id}</strong> at Cavinti Highland Crest.
                </p>
                <p>
                  I confirm that the lot boundaries, geodetic stakes, and site development standards are compliant with the purchase contract and that Transfer Certificate of Title <strong>{tm.tctNumber || 'TCT-RD-LAGUNA'}</strong> has been officially executed.
                </p>
                <p className="text-slate-400 italic text-[11px]">
                  By clicking "Confirm Acceptance", you execute the final lot handover step in the XYZ Realty PM System.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Review Later
                </button>
                <button
                  onClick={() => {
                    onSignAcceptance(client.id, client.name);
                    setShowSignModal(false);
                    setSignedSuccess(true);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-lg"
                >
                  ✓ Execute Acceptance Sign-Off
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Official Certificate of Lot Acceptance */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn overflow-y-auto">
            <div className="bg-slate-950 border border-emerald-600/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto text-slate-100 relative">
              <button 
                onClick={() => setShowCertificateModal(false)} 
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-850 cursor-pointer"
              >
                ✕
              </button>

              {/* Certificate Header with Crest */}
              <div className="text-center space-y-2 border-b border-slate-800 pb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 text-white">
                  <Award className="w-8 h-8" />
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                  Republic of the Philippines • Province of Laguna
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Certificate of Lot Acceptance & Physical Handover
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Cavinti Highland Crest Subdivision • Land Development Registry
                </p>
              </div>

              {/* Certificate Body Details */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
                <p className="leading-relaxed text-slate-200">
                  This is to officially certify that <strong className="text-white font-bold">{client.name}</strong>, with Buyer Account ID <strong className="text-emerald-400 font-mono">{client.id}</strong>, has formally accepted and received full physical and legal possession of the following real estate parcel:
                </p>

                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">LOT IDENTIFIER</span>
                    <strong className="text-white text-xs">{assignedLot?.id || 'SLOT-08'} (Lot #{assignedLot?.slotNumber || '8'})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">LOT AREA</span>
                    <strong className="text-white text-xs">{assignedLot?.areaSqm || 500} Sq. Meters</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">REGISTRY OF DEEDS TCT</span>
                    <strong className="text-emerald-400 text-xs">{tm.tctNumber || 'TCT-2026-0049182-RD-LAGUNA'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">TAX DECLARATION NO.</span>
                    <strong className="text-purple-300 text-xs">{tm.taxDecNumber || 'TD-2026-CVNT-9982-A'}</strong>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Geodetic Concrete Boundary Stakes Inspected & Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>LGU & DHSUD Permitted Access Road Connected</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero Outstanding Critical Punch-List Defects</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Execution Timestamp */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-[11px]">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">AUTHORIZED DEVELOPER SIGNATORY</span>
                  <strong className="text-white block mt-1">Mauro Principe Jr.</strong>
                  <span className="text-slate-500 text-[10px]">Chief Operating Officer • XYZ Realty Corp.</span>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">BUYER CONFORME & SIGN-OFF</span>
                  <strong className="text-emerald-400 block mt-1">{client.name}</strong>
                  <span className="text-slate-500 text-[10px]">Signed & Verified Digitally</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-slate-500">
                  HASH: {client.id}-TCT-CONVEYANCE-2026-VERIFIED
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-4 text-center border-t border-slate-850 font-mono text-[10px] text-slate-500">
        XYZ REALTY PRIVATE BUYER PORTAL • ENCRYPTED LEDGER & TITLING REGISTRY
      </footer>
    </div>
  );
}
