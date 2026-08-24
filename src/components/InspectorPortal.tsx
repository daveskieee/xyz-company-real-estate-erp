/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ClipboardCheck, Thermometer, ShieldCheck, MapPin, CheckCircle, 
  Send, ListPlus, Compass, Wifi, RefreshCw, Smartphone, HardHat, 
  AlertTriangle, BadgeAlert, FileCheck2, Plus, Check, Users, Camera, CheckCheck, Clock, Navigation, AlertOctagon
} from 'lucide-react';
import { Slot, QALog, Contractor, PunchListDefect, CivilWorksMilestone, DailyManpowerAudit } from '../types';

interface InspectorPortalProps {
  slots: Slot[];
  qaLogs: QALog[];
  contractors: Contractor[];
  punchListDefects: PunchListDefect[];
  civilWorksMilestones: CivilWorksMilestone[];
  manpowerAudits?: DailyManpowerAudit[];
  onAddQALog: (log: Omit<QALog, 'id' | 'date'>) => void;
  onCreateDefect: (defectData: any) => void;
  onUpdateDefect: (id: string, updateData: any) => void;
  onUpdateCivilMilestone: (milestoneId: string, currentPercentage: number, status: string, inspectorSignOff: boolean, remarks?: string) => void;
  onCreateManpowerAudit?: (auditData: any) => void;
  onLogout: () => void;
}

export default function InspectorPortal({
  slots, qaLogs, contractors, punchListDefects, civilWorksMilestones, manpowerAudits = [],
  onAddQALog, onCreateDefect, onUpdateDefect, onUpdateCivilMilestone, onCreateManpowerAudit, onLogout
}: InspectorPortalProps) {
  
  // Navigation tabs: 'qa-logging' | 'manpower-audit' | 'punch-lists' | 'civil-milestones'
  const [activeTab, setActiveTab] = useState<'qa-logging' | 'manpower-audit' | 'punch-lists' | 'civil-milestones'>('qa-logging');

  // QA Log Form State
  const [selectedSlotId, setSelectedSlotId] = useState<string>('SLOT-01');
  const [activity, setActivity] = useState<'Excavation' | 'Leveling' | 'Road Subgrade' | 'Drainage Install' | 'Ready'>('Road Subgrade');
  const [progress, setProgress] = useState<number>(75);
  const [compliance, setCompliance] = useState<'Compliant' | 'Corrective Action Required'>('Compliant');
  const [structural, setStructural] = useState<'Pass' | 'Fail'>('Pass');
  const [safety, setSafety] = useState<'Pass' | 'Fail'>('Pass');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manpower Roll-Call Audit Form State
  const [auditContractorId, setAuditContractorId] = useState<string>(contractors[0]?.id || 'CONT-001');
  const [auditShift, setAuditShift] = useState<'Morning' | 'Afternoon' | 'Full Day'>('Morning');
  const [auditClaimedHeadcount, setAuditClaimedHeadcount] = useState<number>(contractors[0]?.activeManpower || 16);
  const [auditVerifiedHeadcount, setAuditVerifiedHeadcount] = useState<number>(contractors[0]?.activeManpower || 16);
  const [auditSector, setAuditSector] = useState<string>('Sector A (Lots 01 - 06 Grading)');
  const [auditRemarks, setAuditRemarks] = useState<string>('');
  const [auditProductivity, setAuditProductivity] = useState<number>(95);
  const [photoEvidenceTaken, setPhotoEvidenceTaken] = useState<boolean>(true);

  // Punch-List Ticket Form State
  const [defectSlotId, setDefectSlotId] = useState<string>('SLOT-01');
  const [defectTitle, setDefectTitle] = useState<string>('');
  const [defectDesc, setDefectDesc] = useState<string>('');
  const [defectSeverity, setDefectSeverity] = useState<string>('MEDIUM');
  const [defectCategory, setDefectCategory] = useState<string>('ROADS');
  const [defectContractorId, setDefectContractorId] = useState<string>('');

  const selectedAuditContractor = contractors.find(c => c.id === auditContractorId) || contractors[0];
  const auditDiscrepancy = auditClaimedHeadcount - auditVerifiedHeadcount;

  const handleContractorSelectForAudit = (contractorId: string) => {
    setAuditContractorId(contractorId);
    const found = contractors.find(c => c.id === contractorId);
    if (found) {
      setAuditClaimedHeadcount(found.activeManpower || 10);
      setAuditVerifiedHeadcount(found.activeManpower || 10);
    }
  };

  const handleSubmitManpowerAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditRemarks.trim()) {
      alert('Please enter site monitor remarks for this roll-call audit.');
      return;
    }

    if (onCreateManpowerAudit) {
      onCreateManpowerAudit({
        contractorId: selectedAuditContractor.id,
        contractorName: selectedAuditContractor.name,
        specialty: selectedAuditContractor.specialty,
        shift: auditShift,
        claimedHeadcount: auditClaimedHeadcount,
        verifiedHeadcount: auditVerifiedHeadcount,
        assignedSectorOrLot: auditSector,
        supervisorName: 'Engr. Ricardo Gomez (Site Lead Monitor)',
        gpsCoordinates: '14.2612° N, 121.5124° E (Cavinti Highland Site - Verified On-Site)',
        remarks: auditRemarks,
        productivityIndex: auditProductivity,
      });
    }

    setSuccessMsg(`Daily Roll-Call Audit logged for ${selectedAuditContractor.name}. Headcount verified: ${auditVerifiedHeadcount}/${auditClaimedHeadcount}.`);
    setAuditRemarks('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !remarks.trim()) {
      alert('Remarks and a selected lot slot are required to submit logs.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onAddQALog({
        inspectorName: "Engr. Ricardo Gomez (Site Monitor)",
        slotId: selectedSlotId,
        complianceStatus: compliance,
        progressPercentage: progress,
        structuralCheck: structural,
        safetyCheck: safety,
        remarks: remarks,
        siteActivity: activity
      });
      setIsSubmitting(false);
      setSuccessMsg('Weekly QA inspection log submitted and synchronized.');
      setRemarks('');
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 800);
  };

  const handleCreateDefectTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectTitle || !defectDesc) {
      alert('Please fill out defect title and description.');
      return;
    }

    onCreateDefect({
      slotId: defectSlotId,
      title: defectTitle,
      description: defectDesc,
      severity: defectSeverity,
      category: defectCategory,
      contractorId: defectContractorId || null,
    });

    setSuccessMsg(`Defect ticket logged for Lot ${defectSlotId}.`);
    setDefectTitle('');
    setDefectDesc('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 flex flex-col justify-between font-sans" id="mobile-inspector-portal">
      
      {/* Top Mobile/Tablet Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-teal-400 block tracking-widest leading-none font-bold uppercase">FIELD ENGINEERING UNIT</span>
              <h2 className="font-sans font-bold text-sm text-white">Engr. Ricardo Gomez (Site Monitor)</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>GPS SYNCED</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1 bg-red-900/30 border border-red-800 hover:bg-red-900 text-red-200 text-xs rounded-lg cursor-pointer transition-colors font-sans font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 sticky top-16 z-20">
        <div className="max-w-2xl mx-auto flex gap-2">
          {[
            { id: 'qa-logging', label: 'Weekly QA Logger', icon: ClipboardCheck },
            { id: 'punch-lists', label: 'Punch-List Defects', icon: BadgeAlert, badge: punchListDefects.filter(d => d.status === 'OPEN').length },
            { id: 'civil-milestones', label: 'Civil Works Sign-Off', icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-1.5 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap
                  ${isActive 
                    ? 'border-teal-500 text-teal-300 bg-slate-900/50' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="bg-amber-900 text-amber-300 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Workspace */}
      <main className="max-w-2xl mx-auto w-full px-4 py-6 flex-grow space-y-6">
        
        {/* Helper Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border border-teal-800/80 rounded-xl p-4 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-teal-400 font-bold block">PROJECT SITE A</span>
          <h4 className="font-sans font-bold text-sm text-white">Cavinti Highland Crest Subdivision</h4>
          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
            Brgy. Santiaguel, Cavinti, Laguna • 20 Subdivided Lots • Certified for DHSUD Grading Compliance
          </p>
        </div>

        {/* Global Success Notification */}
        {successMsg && (
          <div className="bg-teal-900/60 border border-teal-500 text-teal-200 text-xs p-3.5 rounded-xl flex items-center gap-2 animate-fadeIn shadow-md">
            <CheckCircle className="w-4 h-4 text-teal-300 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: WEEKLY QA MONITORING LOGGER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'qa-logging' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="font-sans font-bold text-teal-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Weekly Site QA & Compaction Report
              </h3>

              <form onSubmit={handleSubmitLog} className="space-y-4 text-xs">
                
                {/* 1. Lot Coordinator Dropdown */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    Subdivision Lot Number
                  </label>
                  <select
                    required
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} (Lot {s.slotNumber} - {s.status} - {s.areaSqm} sqm)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Onsite Construction Activity */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    On-Site Activity Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Excavation', 'Leveling', 'Road Subgrade', 'Drainage Install'].map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setActivity(act as any)}
                        className={`py-2 px-2.5 border rounded-lg text-center transition-all font-semibold cursor-pointer text-xs ${
                          activity === act 
                            ? 'bg-teal-950 border-teal-500 text-teal-300 ring-1 ring-teal-500' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Progress Slider Metric */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-slate-400 font-bold">
                    <span>PROGRESS COMPLETION</span>
                    <span className="text-teal-400 font-bold text-xs">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-teal-500"
                  />
                </div>

                {/* 4. Structural & Safety Assessment */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Structural Assessment
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStructural('Pass')}
                        className={`flex-1 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          structural === 'Pass' ? 'bg-emerald-950 border-emerald-600 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        Pass ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setStructural('Fail')}
                        className={`flex-1 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          structural === 'Fail' ? 'bg-red-950 border-red-700 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        Fail !
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Site Safety Standard
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSafety('Pass')}
                        className={`flex-1 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          safety === 'Pass' ? 'bg-emerald-950 border-emerald-600 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        Pass ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setSafety('Fail')}
                        className={`flex-1 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          safety === 'Fail' ? 'bg-red-950 border-red-700 text-red-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        Fail !
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Compliance Status */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    Contract Compliance Status
                  </label>
                  <select
                    value={compliance}
                    onChange={(e) => setCompliance(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Compliant">Standard - Fully Compliant Ready</option>
                    <option value="Corrective Action Required">Corrective Action Required (Flag Defect)</option>
                  </select>
                </div>

                {/* 6. On-Site Field Notes */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    Field Inspection Remarks & Material Checks
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter concrete compaction ratio, gravel base thickness, drainage slope, weather condition, etc."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Uploading to database...' : 'Submit Certified Inspection Log'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Recent Submissions */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-slate-400 tracking-wider">YOUR RECENT SUBMISSIONS</span>
                <span className="text-teal-400">{qaLogs.length} Total Logs</span>
              </div>

              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {qaLogs.map((log) => (
                  <div key={log.id} className="border border-slate-800 p-3.5 rounded-lg bg-slate-900 text-xs space-y-2">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-teal-400 font-bold">{log.slotId}</span>
                      <span className="text-slate-500">{log.date}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Activity:</span>
                        <strong className="text-slate-200">{log.siteActivity}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Status:</span>
                        <strong className={log.complianceStatus === 'Compliant' ? 'text-emerald-400' : 'text-amber-400'}>
                          {log.complianceStatus === 'Compliant' ? 'OK ✓' : 'Alert'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Progress:</span>
                        <strong className="text-teal-300 font-mono">{log.progressPercentage}%</strong>
                      </div>
                    </div>
                    <p className="text-slate-400 text-[11px] italic pt-1 border-t border-slate-800/50">
                      "{log.remarks}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB: DAILY MANPOWER ROLL-CALL & SPOT-CHECK AUDIT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'manpower-audit' && (
          <div className="space-y-6">
            
            {/* Geofence & GPS Live Verification Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
                  <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">GEOFENCED SITE AUDIT ENGAGED</span>
                </div>
                <h3 className="font-bold text-white text-sm mt-1">Cavinti Highland Crest - Gate 1 Site Check</h3>
                <p className="text-slate-400 text-xs font-mono">GPS: 14.2612° N, 121.5124° E • Accuracy ±3m</p>
              </div>
              <div className="bg-teal-950/80 border border-teal-700/60 px-3 py-1.5 rounded-lg text-teal-300 font-mono text-xs flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>ANTI-GHOST LABOR VERIFIED</span>
              </div>
            </div>

            {/* Manpower Audit Logger Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-sans font-bold text-teal-400 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Daily Field Labor Roll-Call & Headcount Spot-Check
                </h3>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-bold">
                  VERIFIED ATTENDANCE
                </span>
              </div>

              <form onSubmit={handleSubmitManpowerAudit} className="space-y-4 text-xs font-sans">
                
                {/* 1. Contractor & Shift */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                      Contractor / Engineering Partner
                    </label>
                    <select
                      value={auditContractorId}
                      onChange={(e) => handleContractorSelectForAudit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    >
                      {contractors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.specialty} - {c.activeManpower} Claimed)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                      Shift / Inspection Window
                    </label>
                    <select
                      value={auditShift}
                      onChange={(e) => setAuditShift(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    >
                      <option value="Morning">Morning Roll-Call (07:30 AM Briefing)</option>
                      <option value="Afternoon">Afternoon Spot-Check (01:30 PM)</option>
                      <option value="Full Day">Full-Day Shift Audit</option>
                    </select>
                  </div>
                </div>

                {/* 2. Assigned Zone / Sector */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    Assigned Project Sector / Work Zone
                  </label>
                  <select
                    value={auditSector}
                    onChange={(e) => setAuditSector(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  >
                    <option value="Sector A (Lots 01 - 06 Grading)">Sector A (Lots 01 - 06 Grading & Compaction)</option>
                    <option value="Main Access Spine (Road Paving)">Main Access Spine (6m Concrete Road Paving)</option>
                    <option value="Sector B & C (Culvert Culmination)">Sector B & C (Drainage Culverts & Retention Basin)</option>
                    <option value="Perimeter Boundary Staking">Perimeter Boundary & Concrete Marker Staking</option>
                  </select>
                </div>

                {/* 3. Claimed vs. Verified Headcount Inputs with Live Discrepancy Calculator */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      HEADCOUNT VERIFICATION AUDIT
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      auditDiscrepancy === 0 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                        : auditDiscrepancy > 0 
                        ? 'bg-red-950 text-red-300 border-red-700' 
                        : 'bg-blue-950 text-blue-300 border-blue-700'
                    }`}>
                      {auditDiscrepancy === 0 ? '✓ 100% MATCH' : auditDiscrepancy > 0 ? `⚠️ ${auditDiscrepancy} WORKERS MISSING` : `+${Math.abs(auditDiscrepancy)} SURPLUS CREW`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        Contractor Manifest Claim:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={auditClaimedHeadcount}
                        onChange={(e) => setAuditClaimedHeadcount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-center text-sm"
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-1">Billed Personnel</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-teal-400 mb-1 font-bold">
                        Audited Physical Headcount:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={auditVerifiedHeadcount}
                        onChange={(e) => setAuditVerifiedHeadcount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-teal-500/80 rounded-lg p-2.5 text-teal-300 font-mono font-bold text-center text-sm focus:ring-1 focus:ring-teal-400"
                      />
                      <span className="text-[9px] text-teal-400/70 block text-center mt-1 font-semibold">Counted on site by inspector</span>
                    </div>
                  </div>
                </div>

                {/* 4. Productivity Assessment & Photo Proof */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                        Observed Labor Productivity Index
                      </label>
                      <span className="font-mono text-teal-400 font-bold">{auditProductivity}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={auditProductivity}
                      onChange={(e) => setAuditProductivity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 mt-2"
                    />
                    <span className="text-[9px] text-slate-500 block mt-1 font-mono">Calculates output pace vs allocated crew size</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2">
                      Photographic Proof & Geotag
                    </label>
                    <label className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2.5 rounded-lg cursor-pointer hover:border-slate-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={photoEvidenceTaken}
                        onChange={(e) => setPhotoEvidenceTaken(e.target.checked)}
                        className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                      />
                      <Camera className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="text-[11px] text-slate-300 font-medium">Toolbox Roll-Call Photo Verified</span>
                    </label>
                  </div>
                </div>

                {/* 5. Field Remarks */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                    Site Monitor Verification Notes & Equipment Allocation
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={auditRemarks}
                    onChange={(e) => setAuditRemarks(e.target.value)}
                    placeholder="E.g., 16-man crew present for morning toolbox meeting. Graders active on Lots 01-04. No idle labor observed."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Certify & Submit Manpower Attendance Audit</span>
                </button>
              </form>
            </div>

            {/* Manpower Audit Log History */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-slate-400 tracking-wider">FIELD ATTENDANCE AUDIT LOGS</span>
                <span className="text-teal-400">{manpowerAudits.length} Audits Recorded</span>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {manpowerAudits.map((audit) => (
                  <div key={audit.id} className="border border-slate-800 p-3.5 rounded-lg bg-slate-900 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-xs">{audit.contractorName}</strong>
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          {audit.specialty}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        audit.verificationStatus === 'VERIFIED_MATCH'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-red-950 text-red-300 border-red-700'
                      }`}>
                        {audit.verificationStatus === 'VERIFIED_MATCH' ? 'MATCH ✓' : `DISCREPANCY (-${audit.discrepancy})`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[9px] font-mono uppercase">Zone:</span>
                        <strong className="text-slate-300 truncate block">{audit.assignedSectorOrLot}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] font-mono uppercase">Shift / Date:</span>
                        <span className="text-slate-300 font-mono">{audit.shift} • {audit.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] font-mono uppercase">Count:</span>
                        <strong className="text-teal-300 font-mono">{audit.verifiedHeadcount} / {audit.claimedHeadcount} Men</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] font-mono uppercase">Productivity:</span>
                        <strong className="text-blue-400 font-mono">{audit.productivityIndex}%</strong>
                      </div>
                    </div>

                    <p className="text-slate-400 text-[11px] italic">
                      "{audit.remarks}"
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Auditor: {audit.supervisorName}</span>
                      <span className="text-teal-400/80">📍 GPS Geotagged</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: PUNCH-LIST DEFECTS MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'punch-lists' && (
          <div className="space-y-6">
            
            {/* Create Defect Ticket Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="font-sans font-bold text-amber-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                <BadgeAlert className="w-4 h-4" />
                Log Site Defect Ticket (Field Action)
              </h3>

              <form onSubmit={handleCreateDefectTicket} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Lot Slot</label>
                    <select
                      value={defectSlotId}
                      onChange={(e) => setDefectSlotId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      {slots.map(s => <option key={s.id} value={s.id}>{s.id} (Lot {s.slotNumber})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Severity</label>
                    <select
                      value={defectSeverity}
                      onChange={(e) => setDefectSeverity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Defect Title</label>
                  <input
                    type="text"
                    required
                    value={defectTitle}
                    onChange={(e) => setDefectTitle(e.target.value)}
                    placeholder="e.g. Subgrade compaction void near boundary marker"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Description & Rectification Guidance</label>
                  <textarea
                    required
                    rows={2}
                    value={defectDesc}
                    onChange={(e) => setDefectDesc(e.target.value)}
                    placeholder="Specific engineering steps needed to resolve this defect."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Category</label>
                    <select
                      value={defectCategory}
                      onChange={(e) => setDefectCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="ROADS">ROADS & PAVEMENT</option>
                      <option value="DRAINAGE">DRAINAGE & SEWAGE</option>
                      <option value="GRADING">LAND LEVELING</option>
                      <option value="BOUNDARY">BOUNDARY STAKES</option>
                      <option value="UTILITIES">UTILITIES</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Assign to Contractor</label>
                    <select
                      value={defectContractorId}
                      onChange={(e) => setDefectContractorId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="">-- Select Contractor --</option>
                      {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-md cursor-pointer transition-all"
                >
                  Create & Dispatch Defect Ticket
                </button>
              </form>
            </div>

            {/* Active Tickets List */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                Defect Punch-List Status ({punchListDefects.length} Total)
              </h3>

              <div className="space-y-3">
                {punchListDefects.map((def) => (
                  <div key={def.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          def.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-700' :
                          def.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-700' :
                          'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}>
                          {def.severity}
                        </span>
                        <strong className="text-white">{def.title}</strong>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{def.slotId}</span>
                    </div>

                    <p className="text-slate-300 text-[11px]">{def.description}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Status: <strong className={def.status === 'CLOSED' ? 'text-emerald-400' : 'text-amber-400'}>{def.status}</strong>
                      </span>

                      {def.status === 'CONTRACTOR_RECTIFIED' && (
                        <button
                          onClick={() => {
                            onUpdateDefect(def.id, { status: 'CLOSED', resolutionNotes: 'Re-inspection completed. Quality approved.' });
                            setSuccessMsg(`Defect ${def.id} verified and marked CLOSED.`);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer"
                        >
                          ✓ Sign Off & Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CIVIL WORKS MILESTONES SIGN-OFF */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'civil-milestones' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="font-sans font-bold text-teal-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4" />
                Civil Works Engineering Sign-Off Checklist
              </h3>

              <div className="space-y-4">
                {civilWorksMilestones.map((m) => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-white">{m.phaseName}</strong>
                      <span className="text-teal-400 font-mono font-bold">{m.currentPercentage}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${m.currentPercentage === 100 ? 'bg-emerald-500' : 'bg-teal-500'}`}
                        style={{ width: `${m.currentPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">Inspector Certification:</span>
                      <button
                        onClick={() => {
                          onUpdateCivilMilestone(m.id, m.currentPercentage, m.status, !m.inspectorSignOff);
                          setSuccessMsg(`Toggled sign-off for ${m.phaseName}.`);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors ${
                          m.inspectorSignOff ? 'bg-emerald-950 border border-emerald-600 text-emerald-300' : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {m.inspectorSignOff ? '✓ CERTIFIED APPROVED' : 'SIGN-OFF PENDING'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-4 text-center border-t border-slate-850 font-mono text-[10px] text-slate-500">
        XYZ REALTY ENGINEERING & QA SITE MONITOR v3.0
      </footer>
    </div>
  );
}
