/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, Users, FileText, Settings2, BarChart3, PieChart, Landmark, ShieldCheck, 
  Search, Plus, Hammer, DollarSign, Calendar, Sliders, ChevronRight, ChevronLeft, ChevronDown, UserCheck, Trash2, 
  CheckCircle, FileBadge, Radio, Layers, ArrowRight, AlertTriangle, Clock, CheckCircle2,
  FileSpreadsheet, ClipboardList, MapPin, HardHat, FileCheck2, UserPlus, Eye, BadgeAlert,
  Scale, Menu, History, Banknote, TrendingUp, Sparkles, FileCode, ShieldAlert,
  Ticket, Award, Bot, RefreshCw, CheckCheck, Zap, SlidersHorizontal, Edit3, X, Smartphone,
  Mail, ExternalLink, Check, Copy, Send, Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, 
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  LandParcel, Slot, Client, QALog, Contractor, PayrollRecord, 
  CompanyBudget, PunchListDefect, CivilWorksMilestone, ProcessAuditLog, SlotStatus, DailyManpowerAudit,
  LaborAllocation, AIManpowerRecommendation, ProjectTask, DailySiteLog, ProjectDocument, ProjectRisk, 
  ChangeOrder, TaskStatus, CADParsedLot 
} from '../types';
import InteractiveMap from './InteractiveMap';
import ProjectKanban from './ProjectKanban';
import GanttTimeline from './GanttTimeline';
import DocumentManager from './DocumentManager';
import DailySiteDiary from './DailySiteDiary';
import RiskMatrix from './RiskMatrix';

interface AdminPortalProps {
  parcels: LandParcel[];
  slots: Slot[];
  clients: Client[];
  contractors: Contractor[];
  qaLogs: QALog[];
  punchListDefects: PunchListDefect[];
  civilWorksMilestones: CivilWorksMilestone[];
  auditLogs: ProcessAuditLog[];
  payroll: PayrollRecord[];
  budget: CompanyBudget;
  manpowerAudits?: DailyManpowerAudit[];
  laborAllocations?: LaborAllocation[];
  aiRecommendations?: AIManpowerRecommendation[];
  tasks?: ProjectTask[];
  siteLogs?: DailySiteLog[];
  documents?: ProjectDocument[];
  risks?: ProjectRisk[];
  changeOrders?: ChangeOrder[];
  onAddParcel: (parcel: LandParcel) => void;
  onSubdivideParcel: (parcelId: string, areaSqm: number, price: number, isReady: boolean) => void;
  onRegisterClient: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onAssignClient: (slotId: string, clientId: string) => void;
  onTransitionSlotStatus: (slotId: string, status: string, notes?: string, clientId?: string | null) => void;
  onUpdateTitlePipeline: (clientId: string, stepKey?: string, value?: boolean, tctNumber?: string, taxDecNumber?: string) => void;
  onVerifyKyc: (clientId: string, docKey: string, verified: boolean, notes?: string) => void;
  onCreateDefect: (defectData: any) => void;
  onUpdateDefect: (id: string, updateData: any) => void;
  onUpdateCivilMilestone: (milestoneId: string, currentPercentage: number, status: string, inspectorSignOff: boolean, remarks?: string) => void;
  onRegisterContractor: (contractor: Contractor) => void;
  onUpdateContractors: (updated: Contractor[]) => void;
  onAddQALog: (log: Omit<QALog, 'id' | 'date'>) => void;
  onAddPayroll: (record: PayrollRecord) => void;
  onCreateManpowerAudit?: (auditData: any) => void;
  onSaveAllocation?: (alloc: LaborAllocation) => void;
  onApplyAIRecommendation?: (recId: string) => void;
  onAddTask?: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTaskStatus?: (taskId: string, status: TaskStatus) => void;
  onAddSiteLog?: (log: Omit<DailySiteLog, 'id' | 'createdAt'>) => void;
  onAddDocument?: (doc: Omit<ProjectDocument, 'id' | 'createdAt'>) => void;
  onAddRisk?: (risk: Omit<ProjectRisk, 'id' | 'createdAt'>) => void;
  onImportCADLots?: (lots: CADParsedLot[]) => void;
  onClearAllLots?: () => void;
  onDeleteParcel?: (parcelId: string) => void;
  onApplyAIPricing?: (updates: { slotId: string; newBasePrice: number }[], targetMargin: number) => Promise<void> | void;
  onLogout: () => void;
}

export default function AdminPortal({
  parcels, slots, clients, contractors, qaLogs, punchListDefects, civilWorksMilestones,
  auditLogs, payroll, budget, manpowerAudits = [], laborAllocations = [], aiRecommendations = [],
  tasks = [], siteLogs = [], documents = [], risks = [], changeOrders = [],
  onAddParcel, onSubdivideParcel, onRegisterClient, onDeleteClient, onAssignClient,
  onTransitionSlotStatus, onUpdateTitlePipeline, onVerifyKyc, onCreateDefect, onUpdateDefect,
  onUpdateCivilMilestone, onRegisterContractor, onUpdateContractors, onAddQALog, onAddPayroll,
  onCreateManpowerAudit, onSaveAllocation, onApplyAIRecommendation,
  onAddTask, onUpdateTaskStatus, onAddSiteLog, onAddDocument, onAddRisk,
  onImportCADLots, onClearAllLots, onDeleteParcel, onApplyAIPricing, onLogout
}: AdminPortalProps) {
  
  // Navigation Tabs:
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const notify = (msg: string) => {
    setSystemNotice(msg);
    setTimeout(() => setSystemNotice(null), 4000);
  };
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState<boolean>(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  // New Parcel Form States
  const [isNewParcelModalOpen, setIsNewParcelModalOpen] = useState<boolean>(false);
  const [parcelName, setParcelName] = useState<string>('');
  const [parcelLoc, setParcelLoc] = useState<string>('');
  const [parcelSqm, setParcelSqm] = useState<number>(10000);
  const [parcelCost, setParcelCost] = useState<number>(450000);
  const [parcelPlannedLots, setParcelPlannedLots] = useState<number>(20);
  const [parcelDate, setParcelDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Testing Guide expanded state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(true);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth'
      });
    }
  };

  // Filter and Search states
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('ALL');
  const [defectFilter, setDefectFilter] = useState<string>('ALL');
  const [searchClientQuery, setSearchClientQuery] = useState<string>('');
  const [clientKycSearchQuery, setClientKycSearchQuery] = useState<string>('');

  // Selected Lot modal state for lifecycle advancement
  const [transitioningSlot, setTransitioningSlot] = useState<Slot | null>(null);
  const [transitionTargetStage, setTransitionTargetStage] = useState<string>('Reserved');
  const [transitionRemarks, setTransitionRemarks] = useState<string>('');
  const [transitionAssignee, setTransitionAssignee] = useState<string>('');

  // New Defect Ticket Form State
  const [newDefectSlotId, setNewDefectSlotId] = useState<string>('SLOT-01');
  const [newDefectTitle, setNewDefectTitle] = useState<string>('');
  const [newDefectDesc, setNewDefectDesc] = useState<string>('');
  const [newDefectSeverity, setNewDefectSeverity] = useState<string>('MEDIUM');
  const [newDefectCategory, setNewDefectCategory] = useState<string>('ROADS');
  const [newDefectContractorId, setNewDefectContractorId] = useState<string>('');
  const [showDefectModal, setShowDefectModal] = useState<boolean>(false);

  // New Buyer Registration Form States
  const [cliName, setCliName] = useState<string>('');
  const [cliEmail, setCliEmail] = useState<string>('');
  const [cliContact, setCliContact] = useState<string>('');
  const [cliPack, setCliPack] = useState<string>('Standard Land Parcel Access Package');
  const [cliPlan, setCliPlan] = useState<'Cash' | 'Installment'>('Installment');
  const [cliPrice, setCliPrice] = useState<number>(45000);
  const [cliSlotBind, setCliSlotBind] = useState<string>('');
  const [showClientModal, setShowClientModal] = useState<boolean>(false);

  // Handover Link Dialog States
  const [showHandoverModal, setShowHandoverModal] = useState<boolean>(false);
  const [activeHandoverClient, setActiveHandoverClient] = useState<{
    id: string;
    name: string;
    email: string;
    inviteToken: string;
    inviteTokenExpiry?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState<boolean>(false);
  const [isSendingHandoverEmail, setIsSendingHandoverEmail] = useState<boolean>(false);
  const [emailSentNotice, setEmailSentNotice] = useState<{
    deliveredTo: string;
    mode: string;
    previewUrl?: string | null;
  } | null>(null);

  const handleGenerateHandoverLink = async (clientId: string) => {
    setIsGeneratingInvite(true);
    try {
      const res = await fetch(`/api/clients/generate-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) throw new Error('Failed to create handover link');
      const data = await res.json();
      const target = clients.find(c => c.id === clientId);
      setActiveHandoverClient({
        id: clientId,
        name: data.buyerName || target?.name || 'Buyer',
        email: data.buyerEmail || target?.email || '',
        inviteToken: data.inviteToken || data.token || '',
        inviteTokenExpiry: data.inviteTokenExpiry,
      });
      setShowHandoverModal(true);
      notify(`Handover activation link generated for ${target?.name || 'Buyer'}.`);
    } catch {
      notify('Server communication error generating handover link.');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleSendHandoverEmail = async (clientId: string, recipientEmail?: string) => {
    setIsSendingHandoverEmail(true);
    setEmailSentNotice(null);
    try {
      const res = await fetch(`/api/clients/send-handover-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          email: recipientEmail,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSentNotice({
          deliveredTo: data.deliveredTo || recipientEmail || 'buyer',
          mode: data.mode || 'LIVE_GMAIL_SMTP',
          previewUrl: data.previewUrl,
        });
        notify(`Handover activation email dispatched directly to ${recipientEmail || 'buyer'}!`);
      } else {
        notify('Notice: ' + (data.message || data.error || 'Email dispatch failed.'));
      }
    } catch {
      notify('Connection error communicating with mail dispatcher.');
    } finally {
      setIsSendingHandoverEmail(false);
    }
  };

  const handleConfirmDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the buyer account for "${clientName}" (${clientId})?\n\nAny reserved or assigned lot will automatically be released back to AVAILABLE.`)) {
      if (onDeleteClient) {
        onDeleteClient(clientId);
        notify(`Buyer account "${clientName}" deleted successfully.`);
      }
    }
  };

  const handleRegisterClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliName.trim() || !cliEmail.trim()) {
      alert('Buyer Name and Email are mandatory.');
      return;
    }

    const newClientId = `CLI-${Date.now().toString().slice(-4)}`;
    const newClientObj: Client = {
      id: newClientId,
      name: cliName.trim(),
      email: cliEmail.trim(),
      contact: cliContact.trim() || '+63 900 000 0000',
      slotId: cliSlotBind || null,
      packageName: cliPack,
      paymentPlan: cliPlan,
      totalContractPrice: cliPrice,
      monthlyInstallment: cliPlan === 'Installment' ? Math.round(cliPrice / 36) : 0,
      balance: cliPrice,
      amountPaid: 0,
      accountStatus: 'INVITED',
      titleMilestones: {
        currentPhase: 'Reservation & Buyer Qualification',
        motherTitleVerified: true,
        darClearanceApproved: true,
        lguPermitIssued: false,
        dhsudLicenseToSell: false,
        ctsSigned: false,
        deedOfSaleSigned: false,
        birEcarIssued: false,
        taxDeclarationTransferred: false,
        registryOfDeedsTctReleased: false,
        certificateOfAcceptanceSigned: false,
      },
      buyerKyc: {
        govtIdVerified: false,
        tinVerified: false,
        proofOfIncomeVerified: false,
        proofOfAddressVerified: false,
        maritalConsentVerified: false,
        kycStatus: 'PENDING',
        notes: 'Newly registered.',
      },
      payments: [],
      registrationDate: new Date().toISOString().split('T')[0],
    };

    onRegisterClient(newClientObj);
    if (cliSlotBind) {
      onAssignClient(cliSlotBind, newClientId);
    }

    setShowClientModal(false);
    notify(`Buyer ${cliName} registered. Generating handover link...`);
    setCliName('');
    setCliEmail('');
    setCliContact('');
    setCliSlotBind('');

    setTimeout(() => {
      handleGenerateHandoverLink(newClientId);
    }, 500);
  };

  // Contractor Form State
  const [contName, setContName] = useState<string>('');
  const [contComp, setContComp] = useState<string>('');
  const [contSpec, setContSpec] = useState<any>('Land Leveling & Grading');
  const [contAmt, setContAmt] = useState<number>(120000);

  // Manual Manpower Allocation Form States
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState<boolean>(false);
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
  const [allocSectorName, setAllocSectorName] = useState<string>('Sector A (North Crest Hillside)');
  const [allocTargetLots, setAllocTargetLots] = useState<string>('Lots 01 - 06');
  const [allocContractorId, setAllocContractorId] = useState<string>(contractors[0]?.id || 'CONT-001');
  const [allocHeadcount, setAllocHeadcount] = useState<number>(16);
  const [allocWorkScope, setAllocWorkScope] = useState<string>('Subgrade Compaction & Boundary Marker Staking');
  const [allocStatus, setAllocStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ACTIVE');
  const [allocNotes, setAllocNotes] = useState<string>('');

  // AI Workforce Dispatch Assistant States
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiScanMessage, setAiScanMessage] = useState<string | null>(null);

  // Auto-lock body scroll and ensure modals center on active screen
  useEffect(() => {
    if (isAllocationModalOpen || transitioningSlot || showDefectModal || showClientModal || showHandoverModal || isNewParcelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAllocationModalOpen, transitioningSlot, showDefectModal, showClientModal, showHandoverModal, isNewParcelModalOpen]);

  // Aggregate Metrics for Header Badges
  const openDefectsCount = punchListDefects.filter(d => d.status !== 'CLOSED').length;
  const verifiedKycCount = clients.filter(c => c.buyerKyc?.kycStatus === 'VERIFIED').length;
  const totalManpower = contractors.reduce((sum, c) => sum + (c.activeManpower || 0), 0);

  const statusCounts = {
    available: slots.filter((s) => s.status === 'Available').length,
    reserved: slots.filter((s) => s.status === 'Reserved').length,
    underContract: slots.filter((s) => s.status === 'Under Contract').length,
    developing: slots.filter((s) => s.status === 'Developing').length,
    titling: slots.filter((s) => s.status === 'Titling Phase').length,
    turnoverReady: slots.filter((s) => s.status === 'Turnover Ready').length,
    handedOver: slots.filter((s) => s.status === 'Handed Over' || s.status === 'Sold').length,
  };

  const statusPieData = [
    { name: 'Available', value: statusCounts.available, color: '#10b981' },
    { name: 'Reserved', value: statusCounts.reserved, color: '#f59e0b' },
    { name: 'Under Contract', value: statusCounts.underContract, color: '#3b82f6' },
    { name: 'Developing', value: statusCounts.developing, color: '#6366f1' },
    { name: 'Titling', value: statusCounts.titling, color: '#a855f7' },
    { name: 'Turnover Ready', value: statusCounts.turnoverReady, color: '#14b8a6' },
    { name: 'Handed Over', value: statusCounts.handedOver, color: '#475569' },
  ];

  // Quick Jump Module Master List
  const quickJumpModules = [
    { id: 'overview', label: 'Executive Operations & Milestones', icon: TrendingUp, desc: 'Global KPIs & Capital Readiness' },
    { id: 'gis-scanner', label: 'AutoCAD Masterplan Studio', icon: Compass, desc: `${slots.length} Lots on Vector Grid` },
    { id: 'tasks', label: 'PM Tasks (Kanban)', icon: Sparkles, desc: `${tasks.length} Construction Tasks` },
    { id: 'gantt', label: 'Gantt Schedule', icon: BarChart3, desc: '16-Week Milestone Timeline' },
    { id: 'site-diary', label: 'Daily Site Diary & Weather', icon: HardHat, desc: `${siteLogs.length} Site Reports` },
    { id: 'documents', label: 'Blueprint DMS', icon: FileCode, desc: `${documents.length} CAD & Legal Files` },
    { id: 'risks', label: 'Risk Matrix (5x5)', icon: ShieldAlert, desc: `${risks.length} Tracked Hazards` },
    { id: 'lot-lifecycle', label: 'Lot Lifecycle State Engine', icon: Layers, desc: `${slots.length} Subdivided Plots` },
    { id: 'titling-pipeline', label: 'Government Titling Pipeline', icon: Scale, desc: `${clients.length} Registered Pipeline` },
    { id: 'site-qa-defects', label: 'Civil Works & Defect Hub', icon: HardHat, desc: `${openDefectsCount} Open Punch-List Items` },
    { id: 'buyer-kyc', label: 'Buyer KYC & Onboarding', icon: ShieldCheck, desc: `${verifiedKycCount}/${clients.length} Verified Buyers` },
    { id: 'disbursements', label: 'Cost & Disbursements Ledger', icon: Banknote, desc: 'Contractor & Personnel Expenses' },
    { id: 'contractors', label: 'Workforce & Manpower', icon: Users, desc: `${totalManpower} Workers On-Site` },
    { id: 'audit-trail', label: 'Operational Audit Trail', icon: History, desc: 'Immutable Blockchain Log' },
    { id: 'parcels-config', label: 'Land Acquisitions & Lots', icon: Building2, desc: `${parcels.length} Master Parcels` },
  ];

  const handleOpenAllocationModal = (alloc?: LaborAllocation) => {
    if (alloc) {
      setEditingAllocationId(alloc.id);
      setAllocSectorName(alloc.sectorName);
      setAllocTargetLots(alloc.targetLots);
      setAllocContractorId(alloc.contractorId);
      setAllocHeadcount(alloc.assignedHeadcount);
      setAllocWorkScope(alloc.workScope);
      setAllocStatus(alloc.status);
      setAllocNotes(alloc.notes || '');
    } else {
      setEditingAllocationId(null);
      setAllocSectorName('Sector A (North Crest Hillside)');
      setAllocTargetLots('Lots 01 - 06');
      setAllocContractorId(contractors[0]?.id || 'CONT-001');
      setAllocHeadcount(16);
      setAllocWorkScope('Subgrade Compaction & Boundary Marker Staking');
      setAllocStatus('ACTIVE');
      setAllocNotes('');
    }
    setIsAllocationModalOpen(true);
  };

  const handleSaveAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selContractor = contractors.find(c => c.id === allocContractorId);
    const allocData: LaborAllocation = {
      id: editingAllocationId || `ALLOC-${Date.now()}`,
      contractorId: allocContractorId,
      contractorName: selContractor?.name || 'Contractor Partner',
      sectorName: allocSectorName,
      targetLots: allocTargetLots,
      assignedHeadcount: Number(allocHeadcount),
      workScope: allocWorkScope,
      status: allocStatus,
      notes: allocNotes,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (onSaveAllocation) {
      onSaveAllocation(allocData);
    }
    setIsAllocationModalOpen(false);
    notify(`✅ Allocation saved! Real-time Dispatch Directive & SMS transmitted to Field Supervisor Engr. Ricardo Gomez (${allocHeadcount} workers on ${allocSectorName}).`);
  };

  const handleTriggerAiScan = () => {
    setIsAiScanning(true);
    setTimeout(() => {
      setIsAiScanning(false);
      setAiScanMessage('AI Workforce Scan completed: 3 optimization opportunities identified based on lot progress & defect logs.');
      setTimeout(() => setAiScanMessage(null), 6000);
    }, 1200);
  };

  // Status Chart Data
  const lifecycleChartData = [
    { name: 'Available', value: statusCounts.available, color: '#10b981' },
    { name: 'Reserved', value: statusCounts.reserved, color: '#f59e0b' },
    { name: 'Under Contract', value: statusCounts.underContract, color: '#3b82f6' },
    { name: 'Developing', value: statusCounts.developing, color: '#6366f1' },
    { name: 'Titling', value: statusCounts.titling, color: '#a855f7' },
    { name: 'Turnover Ready', value: statusCounts.turnoverReady, color: '#14b8a6' },
    { name: 'Handed Over', value: statusCounts.handedOver, color: '#475569' },
  ];

  // Manpower Chart 1: Sector Headcount Distribution
  const sectorAllocationChartData = laborAllocations.map((alloc) => ({
    name: alloc.sectorName.replace('Sector ', 'Sec ').replace(' (North Crest Hillside)', '').replace(' (South Perimeter Basin)', '').replace('Central Access Corridor', 'Main Spine'),
    fullName: alloc.sectorName,
    lots: alloc.targetLots,
    workers: alloc.assignedHeadcount,
    contractor: alloc.contractorName || contractors.find(c => c.id === alloc.contractorId)?.name || 'Partner',
    scope: alloc.workScope
  }));

  // Manpower Chart 2: Specialty Breakdown
  const specialtyManpowerMap: Record<string, number> = {};
  laborAllocations.forEach(alloc => {
    const contractor = contractors.find(c => c.id === alloc.contractorId);
    const specialty = contractor?.specialty || 'General Civil Works';
    specialtyManpowerMap[specialty] = (specialtyManpowerMap[specialty] || 0) + alloc.assignedHeadcount;
  });

  const specialtyColors: Record<string, string> = {
    'Land Leveling': '#10b981',
    'Land Leveling & Grading': '#10b981',
    'Road Construction': '#3b82f6',
    'Road Paving & Curbs': '#3b82f6',
    'Civil Engineering': '#8b5cf6',
    'Civil Drainage & Utilities': '#8b5cf6',
    'Manpower Supply': '#f59e0b'
  };

  const specialtyManpowerChartData = Object.keys(specialtyManpowerMap).map(key => ({
    name: key,
    value: specialtyManpowerMap[key],
    color: specialtyColors[key] || '#14b8a6'
  }));

  // Manpower Chart 3: Manifest Claimed vs Verified Headcount
  const auditComparisonChartData = manpowerAudits.slice(0, 4).map(audit => ({
    name: audit.contractorName.split(' ')[0] + ' (' + audit.shift[0] + ')',
    contractor: audit.contractorName,
    claimed: audit.claimedHeadcount,
    verified: audit.verifiedHeadcount,
    discrepancy: audit.discrepancy
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Corporate Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">XYZ Realty Land PM System</h1>
              <span className="bg-blue-900/60 border border-blue-700 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold">
                OPERATIONS MANAGER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Cavinti Highland Crest • Laguna Master Development
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Sync: <strong>Neon Cloud DB</strong></span>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-red-900/40 border border-slate-700 hover:border-red-600 text-slate-300 hover:text-red-300 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* System Toast Notification */}
      {systemNotice && (
        <div className="bg-blue-600 text-white text-xs font-medium px-6 py-2.5 flex items-center justify-between border-b border-blue-400 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{systemNotice}</span>
          </div>
          <button onClick={() => setSystemNotice(null)} className="text-blue-200 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Navigation Menu Tabs Bar with Overflow Controls & Quick Module Jump */}
      <nav className="bg-slate-950/95 border-b border-slate-800 px-3 sm:px-6 relative flex items-center justify-between gap-2 shadow-xs">
        
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scrollNav('left')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer transition-colors shadow-xs"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Tab Strip */}
        <div 
          ref={navScrollRef} 
          className="flex-1 overflow-x-auto flex gap-1 scroll-smooth py-1 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {[
            { id: 'overview', label: 'Executive Operations & Capital Milestones', icon: TrendingUp },
            { id: 'gis-scanner', label: 'AutoCAD Masterplan Studio', icon: MapPin, badge: `${slots.length} Lots` },
            { id: 'tasks', label: 'PM Tasks (Kanban)', icon: Sparkles, badge: `${tasks.length} Tasks` },
            { id: 'gantt', label: 'Gantt Schedule', icon: BarChart3 },
            { id: 'site-diary', label: 'Site Diary & Weather', icon: HardHat, badge: `${siteLogs.length} Logs` },
            { id: 'documents', label: 'Blueprint DMS', icon: FileCode, badge: `${documents.length} Docs` },
            { id: 'risks', label: 'Risk Matrix (5x5)', icon: ShieldAlert, badge: `${risks.length} Risks` },
            { id: 'lot-lifecycle', label: 'Lot Lifecycle Engine', icon: Layers },
            { id: 'titling-pipeline', label: 'Titling Pipeline', icon: Scale, badge: `${clients.length} Active` },
            { id: 'site-qa-defects', label: 'Civil QA & Defects', icon: HardHat, badge: openDefectsCount > 0 ? `${openDefectsCount} Open` : 'Clear' },
            { id: 'buyer-kyc', label: 'Buyer KYC & Onboarding', icon: ShieldCheck, badge: `${verifiedKycCount}/${clients.length} Verified` },
            { id: 'disbursements', label: 'Cost & Disbursements', icon: Banknote, badge: `₱${payroll.reduce((s, p) => s + p.amount, 0).toLocaleString()}` },
            { id: 'contractors', label: 'Workforce & Manpower', icon: Users, badge: `${totalManpower} Crew` },
            { id: 'audit-trail', label: 'Audit Trail', icon: History },
            { id: 'parcels-config', label: 'Land Parcels & Tracts', icon: Building2, badge: `${parcels.length} Tracts` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 rounded-t-lg transition-all cursor-pointer shrink-0
                  ${isActive 
                    ? 'border-blue-500 text-blue-400 bg-slate-900/80 shadow-xs' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 hover:border-slate-700'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isActive 
                      ? 'bg-blue-900/80 text-blue-300 border border-blue-700/50' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scrollNav('right')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer transition-colors shadow-xs"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Quick Module Jump Menu Dropdown */}
        <div className="relative shrink-0 ml-1">
          <button
            onClick={() => setIsQuickJumpOpen(!isQuickJumpOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-all shadow-xs"
          >
            <Menu className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Jump to Module</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isQuickJumpOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-[80vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                <span>PM System Modules ({quickJumpModules.length})</span>
                <button onClick={() => setIsQuickJumpOpen(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              {quickJumpModules.map((m) => {
                const MIcon = m.icon;
                const isCur = activeTab === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveTab(m.id);
                      setIsQuickJumpOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isCur ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60' : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <MIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isCur ? 'text-blue-400' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs truncate text-white">{m.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </nav>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: EXECUTIVE OPERATIONS DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Interactive 7-Step Real Estate Lifecycle Testing Guide */}
            <div className="bg-gradient-to-r from-blue-950/80 via-slate-950 to-indigo-950/80 border border-blue-800/60 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsGuideOpen(!isGuideOpen)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-base shadow-sm">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      Step-by-Step Project Lifecycle Testing Workflow
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        Zero Sample Baseline
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Follow this 7-step guided path to test your land acquisition, AutoCAD upload, contractor works, buyer KYC, and deed turnover.
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold">
                  {isGuideOpen ? 'Hide Guide ▲' : 'Show Guide ▼'}
                </button>
              </div>

              {isGuideOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 animate-fadeIn text-xs">
                  <div 
                    onClick={() => setActiveTab('parcels-config')}
                    className="bg-slate-900/90 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-700 rounded-xl p-3.5 space-y-1.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-blue-400 font-bold font-mono text-[11px]">
                      <span>STAGE 1</span>
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-blue-300">1. Acquire Land Parcel</h4>
                    <p className="text-slate-400 text-[11px]">Register parcel tract, location, purchase budget, and acquisition date.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('gis-scanner')}
                    className="bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-700 rounded-xl p-3.5 space-y-1.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-emerald-400 font-bold font-mono text-[11px]">
                      <span>STAGE 2</span>
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-emerald-300">2. Upload AutoCAD Masterplan</h4>
                    <p className="text-slate-400 text-[11px]">Import `.dxf`, `.dwg`, `.svg`, or `.geojson` to generate vector polygon lots.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('contractors')}
                    className="bg-slate-900/90 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-700 rounded-xl p-3.5 space-y-1.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-bold font-mono text-[11px]">
                      <span>STAGE 3</span>
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-amber-300">3. Onboard Contractors</h4>
                    <p className="text-slate-400 text-[11px]">Register grading, drainage, and road paving contractors and deploy crew.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('buyer-kyc')}
                    className="bg-slate-900/90 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-700 rounded-xl p-3.5 space-y-1.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-purple-400 font-bold font-mono text-[11px]">
                      <span>STAGE 4</span>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-purple-300">4. Buyer Registration & KYC</h4>
                    <p className="text-slate-400 text-[11px]">Register buyer, verify Gov ID & TIN, and issue secure handover invite.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('tasks')}
                    className="bg-slate-900/90 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-700 rounded-xl p-3.5 space-y-1.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-indigo-400 font-bold font-mono text-[11px]">
                      <span>STAGE 5</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-indigo-300">5. PM Tasks & Site Diary</h4>
                    <p className="text-slate-400 text-[11px]">Execute Kanban tasks, monitor Gantt milestones, and log daily site reports.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('lot-lifecycle')}
                    className="bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-700 rounded-xl p-3.5 space-y-1.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-cyan-400 font-bold font-mono text-[11px]">
                      <span>STAGE 6</span>
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-cyan-300">6. Lot Lifecycle Progression</h4>
                    <p className="text-slate-400 text-[11px]">Transition lot from Available $\rightarrow$ Reserved $\rightarrow$ Under Contract $\rightarrow$ Developing.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('site-qa-defects')}
                    className="bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-700 rounded-xl p-3.5 space-y-1.5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-rose-400 font-bold font-mono text-[11px]">
                      <span>STAGE 7</span>
                      <HardHat className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-rose-300">7. Punch-List & Turnover</h4>
                    <p className="text-slate-400 text-[11px]">Inspect site defects, release TCT title, and issue Certificate of Acceptance.</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>TOTAL SUBDIVIDED LOTS</span>
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2 font-mono">
                  {slots.length} Units
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold">{statusCounts.available} Available</span>
                  <span className="text-blue-400 font-semibold">{statusCounts.underContract + statusCounts.titling + statusCounts.turnoverReady + statusCounts.handedOver} Sold/Contract</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>TITLING PIPELINE</span>
                  <Scale className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2 font-mono">
                  {statusCounts.titling + statusCounts.turnoverReady + statusCounts.handedOver} Properties
                </div>
                <div className="text-xs text-purple-400 mt-2 font-medium">
                  {statusCounts.turnoverReady} Ready for Turnover • {statusCounts.handedOver} Handed Over
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>CIVIL WORKS QA HEALTH</span>
                  <HardHat className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2 font-mono">
                  {openDefectsCount === 0 ? '100% Pass' : `${openDefectsCount} Open Defects`}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {civilWorksMilestones.filter(m => m.status === 'COMPLETED').length} of {civilWorksMilestones.length} Development Phases Signed Off
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>FIELD MANPOWER DEPLOYED</span>
                  <Users className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2 font-mono">
                  {totalManpower} Workers
                </div>
                <div className="text-xs text-teal-400 mt-2">
                  Across {contractors.length} active outsourced engineering firms
                </div>
              </div>
            </div>

            {/* Middle Row: Lot Status Distribution & Civil Works Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Status Breakdown Chart */}
              <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-400" />
                    7-Stage Lot Lifecycle Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Real-time status inventory across Cavinti parcel</p>
                </div>

                <div className="h-64 my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={lifecycleChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {lifecycleChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-3 border-t border-slate-800">
                  {lifecycleChartData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-300 text-[11px] truncate">{item.name}: <strong>{item.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Civil Works Milestones Progress */}
              <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-amber-400" />
                      Civil Works Engineering Milestones
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Development progress certified by Site Inspector</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('site-qa-defects')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    Manage Hub <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3.5 pt-2">
                  {civilWorksMilestones.map((m) => (
                    <div key={m.id} className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{m.phaseName}</span>
                        <span className="font-mono text-blue-400 font-bold">{m.currentPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.currentPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${m.currentPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Status: <strong className={m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}>{m.status}</strong></span>
                        <span>{m.inspectorSignOff ? '✓ Inspector Signed' : 'Sign-Off Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* PROJECT PHASE READINESS & CAPITAL MILESTONE TRACKER */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Project Phase Readiness & Capital Milestone Tracker
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Monitors accumulated collections to trigger when land and road development phases can begin.
                  </p>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">ACCUMULATED COLLECTIONS</span>
                    <strong className="text-emerald-400 text-sm">₱{(budget?.collectedInstallments || 83000).toLocaleString()}</strong>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">OPERATIONAL CASH RESERVE</span>
                    <strong className="text-blue-400 text-sm">₱{(budget?.currentCashReserve || 292300).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Progress Milestones Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Milestone 1: Road & Drainage Development Threshold */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded uppercase">
                        PHASE 1 THRESHOLD
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1.5">Road & Drainage Infrastructure Phase</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      100% UNLOCKED ✓
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700"
                      style={{ width: '100%' }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Target Trigger: ₱{(budget?.roadInfrastructureFee || 75000).toLocaleString()}</span>
                    <span className="text-emerald-400 font-bold">Funded: ₱{(budget?.collectedInstallments || 83000).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                    ✓ Threshold cleared: Subcontractor <strong>SolidGround Earthworks</strong> has commenced 6-meter concrete roadway paving & storm culvert installation.
                  </p>
                </div>

                {/* Milestone 2: Phase 2 Land Acquisition Reinvestment Trigger */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded uppercase">
                        PHASE 2 EXPANSION
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1.5">Pagsanjan 1.5-Ha Land Acquisition Target</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {Math.min(100, Math.round(((budget?.collectedInstallments || 83000) / (budget?.nextHectareCost || 500000)) * 100))}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.round(((budget?.collectedInstallments || 83000) / (budget?.nextHectareCost || 500000)) * 100))}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Target Acquisition Budget: ₱{(budget?.nextHectareCost || 500000).toLocaleString()}</span>
                    <span className="text-purple-300 font-bold">Accumulated: ₱{(budget?.collectedInstallments || 83000).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                    Automatic trigger: Full funding of Cavinti installments triggers capital release for purchase and subdivision of next hectare.
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Process Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('disbursements')}
                className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cost & Disbursements</h4>
                  <p className="text-xs text-slate-400">Track contractor & site personnel payouts</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('buyer-kyc')}
                className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Buyer KYC & Onboarding</h4>
                  <p className="text-xs text-slate-400">Deep-search buyers & issue handovers</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('titling-pipeline')}
                className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Government Titling</h4>
                  <p className="text-xs text-slate-400">Track LGU, BIR eCAR & Registry of Deeds</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('site-qa-defects')}
                className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Civil QA & Defects</h4>
                  <p className="text-xs text-slate-400">Assign site defects & verify rectifications</p>
                </div>
              </button>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: 7-STAGE LOT LIFECYCLE STATE ENGINE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'lot-lifecycle' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  7-Stage Lot Inventory Lifecycle State Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage inventory state transitions with strict operational guardrails and automated audit tracking.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 mr-1">Filter:</span>
                {['ALL', 'Available', 'Reserved', 'Under Contract', 'Developing', 'Titling Phase', 'Turnover Ready', 'Handed Over'].map(st => (
                  <button
                    key={st}
                    onClick={() => setLifecycleFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      lifecycleFilter === st 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Lots Grid / Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Lot ID & Number</th>
                      <th className="px-4 py-3">Area & Value</th>
                      <th className="px-4 py-3">Current Lifecycle Stage</th>
                      <th className="px-4 py-3">Assigned Buyer Profile</th>
                      <th className="px-4 py-3">Titling / Civil Progress</th>
                      <th className="px-4 py-3 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {slots
                      .filter(s => lifecycleFilter === 'ALL' || s.status === lifecycleFilter)
                      .map((slot) => {
                        const assignedClient = slot.assignedClientId 
                          ? clients.find(c => c.id === slot.assignedClientId)
                          : null;

                        return (
                          <tr key={slot.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-white text-sm">{slot.id}</div>
                              <div className="text-[11px] text-slate-400 font-mono">Lot {slot.slotNumber} (Grid R{slot.row}:C{slot.col})</div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div>{slot.areaSqm} sqm</div>
                              <div className="font-mono text-blue-400 font-semibold">₱{slot.basePrice.toLocaleString()}</div>
                            </td>

                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono uppercase inline-block ${
                                slot.status === 'Available' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' :
                                slot.status === 'Reserved' ? 'bg-amber-950 border border-amber-700 text-amber-300' :
                                slot.status === 'Under Contract' ? 'bg-blue-950 border border-blue-700 text-blue-300' :
                                slot.status === 'Developing' ? 'bg-indigo-950 border border-indigo-700 text-indigo-300' :
                                slot.status === 'Titling Phase' ? 'bg-purple-950 border border-purple-700 text-purple-300' :
                                slot.status === 'Turnover Ready' ? 'bg-teal-950 border border-teal-700 text-teal-300' :
                                'bg-slate-800 border border-slate-600 text-slate-300'
                              }`}>
                                {slot.status}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              {assignedClient ? (
                                <div>
                                  <strong className="text-white block">{assignedClient.name}</strong>
                                  <span className="text-[11px] text-slate-400 font-mono">{assignedClient.id} • {assignedClient.contact}</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">No buyer assigned</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              {assignedClient ? (
                                <div className="space-y-0.5">
                                  <div className="text-purple-300 text-[11px] font-medium truncate max-w-xs">
                                    {assignedClient.titleMilestones.currentPhase}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    KYC: {assignedClient.buyerKyc?.kycStatus || 'PENDING'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-500 font-mono text-[11px]">Ready for allocation</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setTransitioningSlot(slot);
                                  setTransitionTargetStage(
                                    slot.status === 'Available' ? 'Reserved' :
                                    slot.status === 'Reserved' ? 'Under Contract' :
                                    slot.status === 'Under Contract' ? 'Developing' :
                                    slot.status === 'Developing' ? 'Titling Phase' :
                                    slot.status === 'Titling Phase' ? 'Turnover Ready' :
                                    slot.status === 'Turnover Ready' ? 'Handed Over' : 'Available'
                                  );
                                  setTransitionAssignee(slot.assignedClientId || '');
                                  setTransitionRemarks('');
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                              >
                                Advance Stage ➔
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: GOVERNMENT PERMITTING & TITLING PIPELINE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'titling-pipeline' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-400" />
                Government Permitting & Titling Pipeline Hub
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Official registry workflow tracking: DAR clearance, LGU Permit, DHSUD License, BIR eCAR, Assessor Tax Declaration, and Registry of Deeds TCT issuance.
              </p>
            </div>

            {/* Clients Titling Cards */}
            <div className="space-y-4">
              {clients.map((client) => {
                const tm = client.titleMilestones;
                const assignedSlot = slots.find(s => s.id === client.slotId);

                return (
                  <div key={client.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                    
                    {/* Client Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{client.name}</h4>
                          <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                            {client.id}
                          </span>
                          {assignedSlot && (
                            <span className="bg-blue-950 border border-blue-800 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                              Assigned: {assignedSlot.id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{client.packageName} • {client.contact}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400">Current Phase:</span>
                        <span className="bg-purple-950 border border-purple-700 text-purple-300 font-bold px-3 py-1 rounded-full">
                          {tm.currentPhase}
                        </span>
                      </div>
                    </div>

                    {/* Government Agency Steps Checklist */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      
                      {/* 1. LGU Permit */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.lguPermitIssued}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'lguPermitIssued', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">LGU Dev Permit</span>
                          <span className="text-[10px] text-slate-400">Municipal clearance</span>
                        </div>
                      </label>

                      {/* 2. DHSUD License to Sell */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.dhsudLicenseToSell}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'dhsudLicenseToSell', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">DHSUD LTS</span>
                          <span className="text-[10px] text-slate-400">License to sell verified</span>
                        </div>
                      </label>

                      {/* 3. Contract to Sell (CTS) */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.ctsSigned}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'ctsSigned', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">CTS Executed</span>
                          <span className="text-[10px] text-slate-400">Buyer & seller signed</span>
                        </div>
                      </label>

                      {/* 4. Deed of Absolute Sale (DOAS) */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.deedOfSaleSigned}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'deedOfSaleSigned', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">Notarized DOAS</span>
                          <span className="text-[10px] text-slate-400">Absolute deed notarized</span>
                        </div>
                      </label>

                      {/* 5. BIR eCAR Clearance */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.birEcarIssued}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'birEcarIssued', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">BIR eCAR Issued</span>
                          <span className="text-[10px] text-slate-400">Capital gains tax cleared</span>
                        </div>
                      </label>

                      {/* 6. Assessor Tax Declaration */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.taxDeclarationTransferred}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'taxDeclarationTransferred', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">Assessor Tax Dec</span>
                          <span className="text-[10px] text-slate-400">Transferred to buyer name</span>
                        </div>
                      </label>

                      {/* 7. Registry of Deeds TCT Release */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.registryOfDeedsTctReleased}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'registryOfDeedsTctReleased', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">Registry of Deeds TCT</span>
                          <span className="text-[10px] text-slate-400">Individual title released</span>
                        </div>
                      </label>

                      {/* 8. Certificate of Lot Acceptance */}
                      <label className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={tm.certificateOfAcceptanceSigned}
                          onChange={(e) => onUpdateTitlePipeline(client.id, 'certificateOfAcceptanceSigned', e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block">Turnover Signed</span>
                          <span className="text-[10px] text-slate-400">Lot acceptance signed</span>
                        </div>
                      </label>

                    </div>

                    {/* Government Number Badges Editor */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase font-mono mb-1">
                          Registry of Deeds TCT Number
                        </label>
                        <input
                          type="text"
                          defaultValue={tm.tctNumber || ''}
                          onBlur={(e) => onUpdateTitlePipeline(client.id, undefined, undefined, e.target.value, undefined)}
                          placeholder="e.g. TCT-2026-0089182-RD-LAGUNA"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase font-mono mb-1">
                          Assessor Tax Declaration Number
                        </label>
                        <input
                          type="text"
                          defaultValue={tm.taxDecNumber || ''}
                          onBlur={(e) => onUpdateTitlePipeline(client.id, undefined, undefined, undefined, e.target.value)}
                          placeholder="e.g. TD-2026-CVNT-9982-A"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: CIVIL WORKS & PUNCH-LIST DEFECT HUB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'site-qa-defects' && (
          <div className="space-y-6">
            
            {/* Header & New Ticket Button */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-amber-400" />
                  Civil Works QA & Contractor Punch-List Defect Hub
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Track site development milestones and manage field defect punch-list tickets with contractor accountability.
                </p>
              </div>

              <button
                onClick={() => setShowDefectModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Log Defect Ticket
              </button>
            </div>

            {/* Civil Works Milestone Controls */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                Civil Works Development Milestones Sign-Off
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {civilWorksMilestones.map((m) => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{m.phaseName}</span>
                      <span className="font-mono font-bold text-blue-400">{m.currentPercentage}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${m.currentPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${m.currentPercentage}%` }}
                      ></div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Set Percentage:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={m.currentPercentage}
                          onChange={(e) => onUpdateCivilMilestone(m.id, Number(e.target.value), Number(e.target.value) === 100 ? 'COMPLETED' : 'IN_PROGRESS', m.inspectorSignOff)}
                          className="w-24 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                        <span className="text-slate-400">Inspector Sign-off:</span>
                        <button
                          onClick={() => {
                            onUpdateCivilMilestone(m.id, m.currentPercentage, m.status, !m.inspectorSignOff);
                            notify(`Milestone sign-off toggled for ${m.phaseName}.`);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono cursor-pointer transition-colors ${
                            m.inspectorSignOff ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {m.inspectorSignOff ? '✓ APPROVED' : 'PENDING'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Punch-List Defect Tickets Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 text-amber-400" />
                  Site Punch-List Defect Tickets
                </h4>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400">Filter:</span>
                  {['ALL', 'OPEN', 'CONTRACTOR_RECTIFIED', 'CLOSED'].map(f => (
                    <button
                      key={f}
                      onClick={() => setDefectFilter(f)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        defectFilter === f ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {punchListDefects
                  .filter(d => defectFilter === 'ALL' || d.status === defectFilter)
                  .map((defect) => (
                    <div key={defect.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                            defect.severity === 'CRITICAL' ? 'bg-red-950 border border-red-700 text-red-300' :
                            defect.severity === 'HIGH' ? 'bg-orange-950 border border-orange-700 text-orange-300' :
                            defect.severity === 'MEDIUM' ? 'bg-amber-950 border border-amber-700 text-amber-300' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {defect.severity}
                          </span>
                          <h5 className="text-sm font-bold text-white">{defect.title}</h5>
                          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
                            {defect.slotId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Status:</span>
                          <span className={`font-bold font-mono px-2.5 py-0.5 rounded-full text-xs ${
                            defect.status === 'CLOSED' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' :
                            defect.status === 'CONTRACTOR_RECTIFIED' ? 'bg-blue-950 border border-blue-700 text-blue-300' :
                            'bg-amber-950 border border-amber-700 text-amber-300'
                          }`}>
                            {defect.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">{defect.description}</p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <div>
                          <span>Assigned Contractor: <strong className="text-slate-200">{defect.contractorName}</strong></span>
                          {defect.targetDate && <span className="ml-3 font-mono">Target: {defect.targetDate}</span>}
                        </div>

                        {/* Defect Action Buttons */}
                        <div className="flex gap-2">
                          {defect.status === 'OPEN' && (
                            <button
                              onClick={() => {
                                onUpdateDefect(defect.id, { status: 'CONTRACTOR_RECTIFIED', resolutionNotes: 'Contractor deployed crew for correction.' });
                                notify(`Defect marked as Contractor Rectified.`);
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Mark Rectified
                            </button>
                          )}
                          {defect.status === 'CONTRACTOR_RECTIFIED' && (
                            <button
                              onClick={() => {
                                onUpdateDefect(defect.id, { status: 'CLOSED', resolutionNotes: 'Re-inspection verified 100% compliant by inspector.' });
                                notify(`Defect re-inspected and CLOSED.`);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              ✓ Verify & Close Defect
                            </button>
                          )}
                          {defect.status === 'CLOSED' && (
                            <span className="text-emerald-400 font-bold font-mono">✓ Resolved</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: AUTOCAD MASTERPLAN STUDIO */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'gis-scanner' && (
          <div className="space-y-6">
            <InteractiveMap
              slots={slots}
              clients={clients}
              parcel={parcels[0] || null}
              budget={budget}
              milestones={civilWorksMilestones}
              contractors={contractors}
              payroll={payroll}
              onTransitionSlotStatus={(slotId, status, notes, clientId) => onTransitionSlotStatus(slotId, status, notes, clientId)}
              onAssignClient={onAssignClient}
              onImportCADLots={onImportCADLots}
              onClearAllLots={onClearAllLots}
              onApplyAIPricing={onApplyAIPricing}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5.1: PM KANBAN TASK BOARD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <ProjectKanban
              tasks={tasks}
              onAddTask={onAddTask || (() => {})}
              onUpdateTaskStatus={onUpdateTaskStatus || (() => {})}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5.2: GANTT SCHEDULE & MILESTONES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'gantt' && (
          <div className="space-y-6">
            <GanttTimeline
              milestones={civilWorksMilestones}
              tasks={tasks}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5.3: DAILY CONSTRUCTION SITE DIARY & WEATHER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'site-diary' && (
          <div className="space-y-6">
            <DailySiteDiary
              logs={siteLogs}
              onAddLog={onAddSiteLog || (() => {})}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5.4: BLUEPRINT & PERMIT DMS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentManager
              documents={documents}
              onUploadDocument={onAddDocument || (() => {})}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5.5: RISK MATRIX & REGISTER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'risks' && (
          <div className="space-y-6">
            <RiskMatrix
              risks={risks}
              onAddRisk={onAddRisk || (() => {})}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: BUYER KYC & ONBOARDING TRANSPARENCY INTERFACE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'buyer-kyc' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Project Buyer Onboarding & Transparency Interface
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Client Deep-Search (KYC) hub: Verify buyer identity, legal documentation compliance, and issue secure developer-to-buyer handover links.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard New Buyer & Issue Handover</span>
              </button>
            </div>

            {/* Client Deep-Search Bar */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientKycSearchQuery}
                  onChange={(e) => setClientKycSearchQuery(e.target.value)}
                  placeholder="Deep-Search buyers by Name, Email, Contact Number, or Assigned Lot ID (e.g. 'Francis', 'SLOT-06')..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {clientKycSearchQuery && (
                <button
                  type="button"
                  onClick={() => setClientKycSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>

            <div className="space-y-4">
              {clients
                .filter((c) => {
                  if (!clientKycSearchQuery.trim()) return true;
                  const q = clientKycSearchQuery.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    (c.contact && c.contact.toLowerCase().includes(q)) ||
                    (c.slotId && c.slotId.toLowerCase().includes(q)) ||
                    (c.id && c.id.toLowerCase().includes(q))
                  );
                })
                .map((client) => {
                const kyc = client.buyerKyc || {
                  govtIdVerified: false,
                  tinVerified: false,
                  proofOfIncomeVerified: false,
                  proofOfAddressVerified: false,
                  maritalConsentVerified: false,
                  kycStatus: 'PENDING',
                  notes: '',
                };

                const isInvited = client.accountStatus === 'INVITED';

                return (
                  <div key={client.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{client.name}</h4>
                          <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                            {client.id}
                          </span>
                          <span className="bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                            {client.slotId || 'NO LOT ASSIGNED'}
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase border ${
                            isInvited
                              ? 'bg-amber-950/70 border-amber-600 text-amber-300'
                              : 'bg-emerald-950/70 border-emerald-600 text-emerald-300'
                          }`}>
                            {isInvited ? '⏳ PENDING HANDOVER' : '✓ ACTIVE ACCOUNT'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {client.email} • {client.contact} • Plan: {client.paymentPlan} (₱{client.totalContractPrice.toLocaleString()})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleGenerateHandoverLink(client.id)}
                          disabled={isGeneratingInvite}
                          className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Generate or view buyer activation link"
                        >
                          <Ticket className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isInvited ? 'Issue Handover Link' : 'Re-issue Handover'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteClient(client.id, client.name)}
                          className="p-1.5 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Delete this buyer account and release slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>

                        <span className={`text-xs font-bold font-mono px-3 py-1.5 rounded-lg uppercase ${
                          kyc.kycStatus === 'VERIFIED' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' :
                          kyc.kycStatus === 'UNDER_REVIEW' ? 'bg-amber-950 border border-amber-700 text-amber-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          KYC: {kyc.kycStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[
                        { key: 'govtIdVerified', label: 'Government ID', desc: 'Passport / UMID / Driver' },
                        { key: 'tinVerified', label: 'TIN Verification', desc: 'BIR 1904 verification' },
                        { key: 'proofOfIncomeVerified', label: 'Proof of Income', desc: 'ITR / COE / Payslip' },
                        { key: 'proofOfAddressVerified', label: 'Proof of Address', desc: 'Utility billing statement' },
                        { key: 'maritalConsentVerified', label: 'Marital Consent', desc: 'Spouse consent if married' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-start gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={(kyc as any)[item.key] || false}
                            onChange={(e) => onVerifyKyc(client.id, item.key, e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-200 block">{item.label}</span>
                            <span className="text-[10px] text-slate-400">{item.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 7: OPERATIONAL AUDIT TRAIL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'audit-trail' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                Live Operational Audit Trail & Process Logs
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Immutable chronological log of all lot transitions, titling advancements, civil works certifications, and client handovers.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-950 border border-blue-800 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          {log.entityType}
                        </span>
                        <strong className="text-white font-mono">{log.action}</strong>
                        <span className="text-slate-400">• ID: {log.entityId}</span>
                      </div>
                      <p className="text-slate-300">{log.details}</p>
                    </div>

                    <div className="text-right sm:text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      <div className="text-slate-200 font-semibold">{log.actorName} ({log.actorRole})</div>
                      <div>{new Date(log.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 8: FIELD MANPOWER ALLOCATION & CONTRACTOR VERIFICATION CENTER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'contractors' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">LIVE WORKFORCE OPERATIONS</span>
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-teal-400" />
                  Field Manpower Allocation & Contractor Verification Center
                </h3>
                <p className="text-xs text-slate-400 mt-1">Real-time lot allocation, AI-suggested labor rebalancing, geofenced roll-call audits, and anti-ghost worker tracking.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenAllocationModal()}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Allocate Crew to Sector</span>
                </button>
                <span className="bg-teal-950 border border-teal-800 text-teal-300 text-xs font-mono px-3 py-2 rounded-lg font-bold">
                  {totalManpower} Workers On-Site
                </span>
              </div>
            </div>

            {/* Executive Workforce KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
                  <span>TOTAL FIELD CREW</span>
                  <HardHat className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">{totalManpower} <span className="text-xs text-slate-400 font-normal">Active Laborers</span></div>
                <span className="text-[10px] text-teal-400 block font-mono">3 Specialized Engineering Partners</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
                  <span>24H ROLL-CALL AUDIT</span>
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-blue-300">
                  {manpowerAudits.reduce((sum, a) => sum + a.verifiedHeadcount, 0)} / {manpowerAudits.reduce((sum, a) => sum + a.claimedHeadcount, 0)}
                  <span className="text-xs text-slate-400 font-normal ml-1">Verified</span>
                </div>
                <span className="text-[10px] text-blue-400 block font-mono">GPS Geotagged Roll-Calls</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
                  <span>LABOR DISCREPANCY RATE</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {manpowerAudits.filter(a => a.verificationStatus === 'DISCREPANCY_FLAGGED').length} <span className="text-xs text-slate-400 font-normal">Flagged Shifts</span>
                </div>
                <span className="text-[10px] text-amber-300/80 block font-mono">Billing auto-locked on variance</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
                  <span>AVG LABOR PRODUCTIVITY</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-300">
                  {manpowerAudits.length > 0 ? (manpowerAudits.reduce((sum, a) => sum + a.productivityIndex, 0) / manpowerAudits.length).toFixed(1) : '93.5'}%
                </div>
                <span className="text-[10px] text-emerald-400 block font-mono">Output Pace vs Crew Size</span>
              </div>
            </div>

            {/* Discrepancy & Anti-Ghost Worker Warning Banner */}
            {manpowerAudits.some(a => a.verificationStatus === 'DISCREPANCY_FLAGGED') && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-xs">
                <BadgeAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-amber-200 block">Active Labor Variance Detected by Field Site Monitor:</strong>
                  <p className="text-slate-300">
                    A discrepancy between contractor billed manifest and verified on-site headcount was recorded for <strong className="text-amber-300">Calabarzon Road Masters (4 unverified workers)</strong>. Milestone payout releases remain guarded until rectified on next shift inspection.
                  </p>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* AI WORKFORCE DISPATCH ASSISTANT (ADVISORY WITH MANUAL OVERRIDE) */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600/30 border border-indigo-500/50 p-2.5 rounded-xl text-indigo-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                        AI Civil Workforce Dispatch Assistant
                      </h4>
                      <span className="bg-indigo-950 border border-indigo-700 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        ADVISORY AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Analyzes real-time lot stages, open punch-list defects, and inspector roll-calls to suggest optimal manpower rebalancing. <em>Admin retains 100% manual override.</em>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTriggerAiScan}
                  disabled={isAiScanning}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono cursor-pointer transition-all flex items-center gap-2 shadow-md shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiScanning ? 'animate-spin' : ''}`} />
                  <span>{isAiScanning ? 'Analyzing Operations...' : 'Run AI Labor Scan'}</span>
                </button>
              </div>

              {aiScanMessage && (
                <div className="bg-indigo-950/80 border border-indigo-500 text-indigo-200 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{aiScanMessage}</span>
                </div>
              )}

              {/* AI Recommendation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {aiRecommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`bg-slate-900/90 border rounded-xl p-4 space-y-3 transition-all ${
                      rec.applied ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        rec.priority === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        rec.priority === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        'bg-teal-950 text-teal-300 border-teal-800'
                      }`}>
                        {rec.priority} PRIORITY
                      </span>

                      {rec.applied ? (
                        <span className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> APPLIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">AI Suggested</span>
                      )}
                    </div>

                    <div>
                      <h5 className="font-bold text-white text-xs leading-snug">{rec.title}</h5>
                      <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{rec.rationale}</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Lots:</span>
                        <strong className="text-white font-mono">{rec.targetLots}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Crew Adjustment:</span>
                        <strong className="text-indigo-300 font-mono">{rec.currentHeadcount} → {rec.recommendedHeadcount} Workers</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned Partner:</span>
                        <span className="text-slate-300 truncate max-w-[130px]">{rec.contractorName}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-teal-400/90 font-mono italic">
                      💡 {rec.impact}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                      <button
                        onClick={() => {
                          if (onApplyAIRecommendation) {
                            onApplyAIRecommendation(rec.id);
                            notify(`AI suggestion "${rec.title}" accepted and applied to site allocation matrix.`);
                          }
                        }}
                        disabled={rec.applied}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          rec.applied 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{rec.applied ? 'Applied' : 'Apply Suggestion'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenAllocationModal({
                            id: `ALLOC-${Date.now()}`,
                            contractorId: rec.contractorId,
                            contractorName: rec.contractorName,
                            sectorName: rec.targetSector,
                            targetLots: rec.targetLots,
                            assignedHeadcount: rec.recommendedHeadcount,
                            workScope: rec.suggestedScope,
                            status: 'ACTIVE',
                            notes: `Manual adjustment from AI recommendation: ${rec.title}`
                          });
                        }}
                        className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                        title="Customize manually"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* WORKFORCE ALLOCATION CHARTS & VISUAL ANALYTICS */}
            {/* ------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Manpower Headcount by Subdivision Sector */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-400" />
                      Manpower Headcount by Sector & Lot Zone
                    </h4>
                    <p className="text-xs text-slate-400">Deployed ground workforce distributed across project sectors</p>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-950 border border-teal-800 text-teal-300 px-2 py-0.5 rounded font-bold">
                    {totalManpower} Total Workers
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={sectorAllocationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={11} 
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-sans space-y-1">
                                <div className="font-bold text-white">{data.fullName}</div>
                                <div className="text-teal-400 font-mono">Target: {data.lots}</div>
                                <div className="text-slate-300 font-mono font-bold">{data.workers} Active Workers</div>
                                <div className="text-slate-400 text-[11px]">{data.contractor}</div>
                                <div className="text-slate-500 text-[10px] italic">{data.scope}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="workers" radius={[6, 6, 0, 0]}>
                        {sectorAllocationChartData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#14b8a6' : index === 1 ? '#3b82f6' : '#8b5cf6'} 
                          />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sector Legend Details */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  {sectorAllocationChartData.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-white truncate">
                        <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-teal-400' : idx === 1 ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="text-slate-400 text-[10px] font-mono">{item.lots}</div>
                      <div className="text-teal-300 font-mono font-bold">{item.workers} Men</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Manpower Allocation by Engineering Discipline */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-400" />
                      Labor Allocation by Engineering Specialty
                    </h4>
                    <p className="text-xs text-slate-400">Trade distribution across earthmoving, road pavement, and drainage</p>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-950 border border-blue-800 text-blue-300 px-2 py-0.5 rounded font-bold">
                    3 Trades Active
                  </span>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={specialtyManpowerChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {specialtyManpowerChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const total = specialtyManpowerChartData.reduce((s, i) => s + i.value, 0);
                            const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
                            return (
                              <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-sans">
                                <div className="font-bold text-white">{data.name}</div>
                                <div className="text-teal-400 font-mono font-bold">{data.value} Workers ({pct}%)</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Trade Legend breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  {specialtyManpowerChartData.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[10px]">
                        {totalManpower > 0 ? ((item.value / totalManpower) * 100).toFixed(0) : 0}% of site
                      </div>
                      <div className="text-white font-mono font-bold">{item.value} Workers</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* Section 1: Lot & Sector Manpower Allocation Matrix */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    Lot & Sector Workforce Allocation Matrix
                  </h4>
                  <p className="text-xs text-slate-400">Physical sector assignments mapping crews directly to subdivision lots with full manual editing controls</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenAllocationModal();
                    }}
                    className="px-3 py-1 bg-teal-600/30 border border-teal-500/50 hover:bg-teal-600 text-teal-200 hover:text-white rounded text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sector Allocation</span>
                  </button>
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded">
                    Cavinti Highland Masterplan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {laborAllocations.map((alloc) => (
                  <div key={alloc.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-teal-400 font-bold uppercase block">{alloc.targetLots}</span>
                        <h5 className="font-bold text-white text-sm">{alloc.sectorName}</h5>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        alloc.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                        alloc.status === 'ON_HOLD' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {alloc.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Lots:</span>
                        <strong className="text-white font-mono">{alloc.targetLots}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned Partner:</span>
                        <span className="text-teal-300 font-semibold truncate max-w-[150px]">
                          {alloc.contractorName || contractors.find(c => c.id === alloc.contractorId)?.name || 'Contractor'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Stationed Crew:</span>
                        <strong className="text-white font-mono">{alloc.assignedHeadcount} Ground Workers</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Engineering Scope:</span>
                        <span className="text-slate-300 text-[11px] truncate max-w-[150px]">{alloc.workScope}</span>
                      </div>
                      {alloc.notes && (
                        <p className="text-slate-400 text-[10px] italic pt-1 border-t border-slate-800/60 truncate">
                          "{alloc.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenAllocationModal(alloc);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white rounded text-xs font-mono font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Allocation</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Contractor Rosters & Progress */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HardHat className="w-4 h-4 text-teal-400" />
                Contractor Profile Rosters & Milestone Performance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contractors.map((c) => (
                  <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{c.name}</h4>
                        <p className="text-xs text-slate-400">{c.company}</p>
                      </div>
                      <span className="bg-teal-950 border border-teal-800 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        {c.specialty}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Deployed Crew:</span>
                        <strong className="text-white font-mono">{c.activeManpower} Workers</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Milestone Completion:</span>
                        <strong className="text-blue-400 font-mono">{c.milestoneProgress}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract Amount / Paid:</span>
                        <span className="text-slate-300 font-mono font-bold">${c.contractAmount?.toLocaleString()} / ${c.paidAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">QA Performance Rating:</span>
                        <strong className="text-amber-400 font-mono">⭐ {c.rating || 4.5} / 5.0</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Daily Field Attendance & GPS Audit Trail Feed */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-teal-400" />
                    Certified Daily Roll-Call Audits & GPS Attendance Records
                  </h4>
                  <p className="text-xs text-slate-400">Field inspector on-site roll-call certifications with GPS geotags and anti-fraud verification</p>
                </div>
                <span className="text-teal-400 font-mono text-xs font-bold">
                  {manpowerAudits.length} Audited Logs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                      <th className="py-2.5 px-3">Date & Shift</th>
                      <th className="py-2.5 px-3">Partner / Specialty</th>
                      <th className="py-2.5 px-3">Allocated Zone</th>
                      <th className="py-2.5 px-3 text-center">Manifest vs Verified</th>
                      <th className="py-2.5 px-3 text-center">Variance Status</th>
                      <th className="py-2.5 px-3">GPS & Proof</th>
                      <th className="py-2.5 px-3">Inspector Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {manpowerAudits.map((audit) => (
                      <tr key={audit.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-3 font-mono whitespace-nowrap">
                          <span className="text-white font-bold block">{audit.date}</span>
                          <span className="text-slate-500 text-[10px]">{audit.shift}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-white font-bold block">{audit.contractorName}</span>
                          <span className="text-teal-400 font-mono text-[10px]">{audit.specialty}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate">
                          {audit.assignedSectorOrLot}
                        </td>
                        <td className="py-3 px-3 text-center font-mono whitespace-nowrap">
                          <span className="text-teal-300 font-bold text-sm">{audit.verifiedHeadcount}</span>
                          <span className="text-slate-500 text-xs"> / {audit.claimedHeadcount} Men</span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                            audit.verificationStatus === 'VERIFIED_MATCH'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border-amber-700'
                          }`}>
                            {audit.verificationStatus === 'VERIFIED_MATCH' ? 'MATCH ✓' : `MISSING (-${audit.discrepancy})`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[10px] font-mono whitespace-nowrap">
                          <span className="text-slate-400 block">📍 {audit.gpsCoordinates ? audit.gpsCoordinates.split('(')[0] : 'Cavinti Site'}</span>
                          <span className="text-emerald-400">✓ Photo Roll-Call</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 italic text-[11px] max-w-[220px]">
                          "{audit.remarks}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SECTION: PROJECT CONTRACTOR & SITE PERSONNEL COST TRACKING TOOL */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                      <Banknote className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Project Contractor & Site Personnel Cost Tracking Tool
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Logs site operational expenses and subcontractor disbursements directly tied to construction milestones.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-xs">
                    <span className="text-slate-500 text-[10px] block">TOTAL DISBURSEMENTS</span>
                    <strong className="text-emerald-400 text-sm">
                      ₱{payroll.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Disbursements Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-[11px] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Disbursement Date</th>
                      <th className="py-2.5 px-3">Payee & Organization</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Expense Category / Milestone</th>
                      <th className="py-2.5 px-3 text-right">Amount (₱)</th>
                      <th className="py-2.5 px-3">Payment Channel</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {payroll.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                          {rec.date}
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-white block">{rec.payeeName}</strong>
                          <span className="text-slate-500 font-mono text-[10px]">{rec.id}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            rec.role === 'Contractor' 
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : rec.role === 'Site Monitor'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {rec.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-white font-medium block">{rec.disbursementType}</span>
                          <span className="text-slate-400 text-[11px]">
                            {rec.disbursementType === 'Contract Milestone' 
                              ? 'Tied to Civil Works Phase Sign-Off'
                              : 'Field Supervision & QA Retainer'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                          ₱{rec.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                          💳 {rec.paymentMethod}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ✓ {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DEDICATED TAB: PROJECT CONTRACTOR & SITE PERSONNEL COST TRACKING TOOL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'disbursements' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                      <Banknote className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Project Contractor & Site Personnel Cost Tracking Tool
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Logs site operational expenses and subcontractor disbursements directly tied to construction milestones.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl font-mono text-xs">
                    <span className="text-slate-500 text-[10px] block font-bold">TOTAL DISBURSED TO DATE</span>
                    <strong className="text-emerald-400 text-base">
                      ₱{payroll.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Disbursements Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">SUBCONTRACTOR MILESTONES</span>
                  <div className="text-xl font-bold text-white font-mono">
                    ₱{payroll.filter(p => p.role === 'Contractor').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400">Paving, Drainage & Earthworks contractor payouts</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">FIELD SUPERVISION & QA</span>
                  <div className="text-xl font-bold text-white font-mono">
                    ₱{payroll.filter(p => p.role === 'Site Monitor').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400">Engr. Ricardo Gomez Site Lead retainers</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">INTERNAL MANAGEMENT</span>
                  <div className="text-xl font-bold text-white font-mono">
                    ₱{payroll.filter(p => p.role === 'Internal Staff').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400">Operations & Legal Titling coordination</p>
                </div>
              </div>

              {/* Disbursements Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl mt-4">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[11px] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3.5">Disbursement Date</th>
                      <th className="py-3 px-3.5">Payee & Organization</th>
                      <th className="py-3 px-3.5">Personnel Role</th>
                      <th className="py-3 px-3.5">Expense Classification & Milestone</th>
                      <th className="py-3 px-3.5 text-right">Amount (₱)</th>
                      <th className="py-3 px-3.5">Payment Channel</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {payroll.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap">
                          {rec.date}
                        </td>
                        <td className="py-3 px-3.5">
                          <strong className="text-white block">{rec.payeeName}</strong>
                          <span className="text-slate-500 font-mono text-[10px]">{rec.id}</span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            rec.role === 'Contractor' 
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : rec.role === 'Site Monitor'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {rec.role}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="text-white font-medium block">{rec.disbursementType}</span>
                          <span className="text-slate-400 text-[11px]">
                            {rec.disbursementType === 'Contract Milestone' 
                              ? 'Tied to Civil Works Phase Inspection Sign-Off'
                              : 'Bi-Weekly Field Supervision & Roll-Call Audit Retainer'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-white whitespace-nowrap">
                          ₱{rec.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                          💳 {rec.paymentMethod}
                        </td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            ✓ {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 9: LAND ACQUISITIONS & LOT SUBDIVISIONS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'parcels-config' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  Land Parcels & Subdivision Schemes
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Acquire new land tracts, configure development parameters, or delete obsolete tracts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewParcelModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Register New Land Parcel
              </button>
            </div>

            {/* Existing Parcels List */}
            {parcels.length === 0 ? (
              <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-950/60 border border-blue-800 flex items-center justify-center mx-auto text-blue-400">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">No Land Parcels Registered Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Start Step 1 of the Real Estate Development Lifecycle by acquiring and registering your first land parcel tract.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewParcelModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Register Land Parcel Tract
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parcels.map((p) => (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs transition-all">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{p.name}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          {p.location}
                        </p>
                      </div>
                      <span className="bg-blue-950 text-blue-300 border border-blue-800 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                        {p.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block font-bold font-mono">TOTAL TRACT AREA</span>
                        <strong className="text-white text-sm font-mono">{p.totalAreaSqm.toLocaleString()} sqm</strong>
                      </div>
                      <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block font-bold font-mono">ACQUISITION COST</span>
                        <strong className="text-emerald-400 text-sm font-mono">₱{p.acquisitionCost.toLocaleString()}</strong>
                      </div>
                      <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block font-bold font-mono">PLANNED CAPACITY</span>
                        <strong className="text-white text-sm font-mono">{p.subdividedSlotsCount || 0} Lots</strong>
                      </div>
                      <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block font-bold font-mono">CURRENT ACTIVE LOTS</span>
                        <strong className="text-blue-400 text-sm font-mono">{slots.filter(s => s.parcelId === p.id).length} Generated</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to permanently delete Land Parcel "${p.name}" (${p.id})?\n\nThis will remove all associated slots, CAD polygons, and civil milestones.`)) {
                            if (onDeleteParcel) {
                              onDeleteParcel(p.id);
                              notify(`Land parcel ${p.name} deleted.`);
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Parcel
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('gis-scanner');
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 hover:from-purple-900 hover:to-indigo-900 border border-purple-700 text-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          AI Pricing Studio
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('gis-scanner');
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-emerald-400" />
                          AutoCAD Studio
                        </button>

                        <button
                          onClick={() => {
                            onSubdivideParcel(p.id, 500, 48000, true);
                            notify(`Subdivided 5 additional lots in ${p.name}.`);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          + Subdivide 5 Lots
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Register New Land Parcel */}
        {isNewParcelModalOpen && (
          <div className="fixed inset-0 z-[99999] w-full h-full overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-center">
            <div className="fixed inset-0 cursor-pointer" onClick={() => setIsNewParcelModalOpen(false)} />
            <div className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  Acquire & Register New Land Parcel
                </h3>
                <button onClick={() => setIsNewParcelModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!parcelName.trim() || !parcelLoc.trim()) {
                    alert('Please enter parcel name and location.');
                    return;
                  }
                  const newId = `PARCEL-${Date.now().toString().slice(-4)}`;
                  const newParcelObj: LandParcel = {
                    id: newId,
                    name: parcelName.trim(),
                    location: parcelLoc.trim(),
                    acquisitionCost: Number(parcelCost) || 450000,
                    totalAreaSqm: Number(parcelSqm) || 10000,
                    subdividedSlotsCount: Number(parcelPlannedLots) || 20,
                    acquisitionDate: parcelDate,
                  };
                  onAddParcel(newParcelObj);
                  setIsNewParcelModalOpen(false);
                  notify(`Land Parcel "${parcelName}" registered successfully!`);
                  setParcelName('');
                  setParcelLoc('');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Development / Parcel Name</label>
                  <input
                    type="text"
                    required
                    value={parcelName}
                    onChange={(e) => setParcelName(e.target.value)}
                    placeholder="e.g. Cavinti Highland Crest"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Geographic Location</label>
                  <input
                    type="text"
                    required
                    value={parcelLoc}
                    onChange={(e) => setParcelLoc(e.target.value)}
                    placeholder="e.g. Brgy. Santiaguel, Cavinti, Laguna"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Total Tract Area (sqm)</label>
                    <input
                      type="number"
                      required
                      value={parcelSqm}
                      onChange={(e) => setParcelSqm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Acquisition Cost (₱)</label>
                    <input
                      type="number"
                      required
                      value={parcelCost}
                      onChange={(e) => setParcelCost(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Planned Subdivision Lots</label>
                    <input
                      type="number"
                      required
                      value={parcelPlannedLots}
                      onChange={(e) => setParcelPlannedLots(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Acquisition Date</label>
                    <input
                      type="date"
                      required
                      value={parcelDate}
                      onChange={(e) => setParcelDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewParcelModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20"
                  >
                    Save & Acquire Parcel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ============================================================= */}
      {/* GLOBAL VIEWPORT-CENTERED MODALS LAYER (Z-INDEX 99999) */}
      {/* ============================================================= */}

      {/* 1. Lot Lifecycle Stage Advance Modal */}
      {transitioningSlot && (
        <div className="fixed inset-0 z-[99999] w-full h-full overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div 
            className="fixed inset-0 cursor-pointer"
            onClick={() => setTransitioningSlot(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-5 shadow-2xl my-auto max-h-[90vh] flex flex-col space-y-3.5 animate-fadeIn">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="text-base font-bold text-white">Transition Stage for {transitioningSlot.id}</h3>
                <p className="text-xs text-slate-400 font-mono">Current Status: {transitioningSlot.status}</p>
              </div>
              <button 
                type="button"
                onClick={() => setTransitioningSlot(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Lifecycle Stage</label>
                <select
                  value={transitionTargetStage}
                  onChange={(e) => setTransitionTargetStage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {['Available', 'Reserved', 'Under Contract', 'Developing', 'Titling Phase', 'Turnover Ready', 'Handed Over'].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Buyer Assignment</label>
                <select
                  value={transitionAssignee}
                  onChange={(e) => setTransitionAssignee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="">-- Leave Unassigned / Keep Current --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operational Remarks / Justification</label>
                <textarea
                  rows={2}
                  value={transitionRemarks}
                  onChange={(e) => setTransitionRemarks(e.target.value)}
                  placeholder="e.g. Buyer submitted signed CTS and reservation checklist. Verified by operations lead."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="shrink-0 flex gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTransitioningSlot(null)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onTransitionSlotStatus(
                    transitioningSlot.id,
                    transitionTargetStage,
                    transitionRemarks,
                    transitionAssignee || transitioningSlot.assignedClientId
                  );
                  notify(`Lot ${transitioningSlot.id} successfully transitioned to "${transitionTargetStage}".`);
                  setTransitioningSlot(null);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-md"
              >
                Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Site Defect Ticket Modal */}
      {showDefectModal && (
        <div className="fixed inset-0 z-[99999] w-full h-full overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div 
            className="fixed inset-0 cursor-pointer"
            onClick={() => setShowDefectModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-5 shadow-2xl my-auto max-h-[90vh] flex flex-col space-y-3.5 animate-fadeIn">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                Log Site Punch-List Defect
              </h3>
              <button 
                type="button"
                onClick={() => setShowDefectModal(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Affected Lot Slot</label>
                  <select
                    value={newDefectSlotId}
                    onChange={(e) => setNewDefectSlotId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {slots.map(s => <option key={s.id} value={s.id}>{s.id} (Lot {s.slotNumber})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity Level</label>
                  <select
                    value={newDefectSeverity}
                    onChange={(e) => setNewDefectSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="LOW">LOW (Cosmetic / Minor)</option>
                    <option value="MEDIUM">MEDIUM (Standard Correction)</option>
                    <option value="HIGH">HIGH (Drainage / Grading Hazard)</option>
                    <option value="CRITICAL">CRITICAL (Structural Stop-Work)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Defect Title</label>
                <input
                  type="text"
                  value={newDefectTitle}
                  onChange={(e) => setNewDefectTitle(e.target.value)}
                  placeholder="e.g. Drainage culvert silt accumulation on Lot 4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Description & Remarks</label>
                <textarea
                  rows={2}
                  value={newDefectDesc}
                  onChange={(e) => setNewDefectDesc(e.target.value)}
                  placeholder="Describe location, defect, and required corrective action."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newDefectCategory}
                    onChange={(e) => setNewDefectCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="ROADS">ROADS & PAVEMENT</option>
                    <option value="DRAINAGE">DRAINAGE & SEWAGE</option>
                    <option value="GRADING">LAND LEVELING & GRADING</option>
                    <option value="BOUNDARY">BOUNDARY STAKING</option>
                    <option value="UTILITIES">UTILITIES & POWER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assign to Contractor</label>
                  <select
                    value={newDefectContractorId}
                    onChange={(e) => setNewDefectContractorId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDefectModal(false)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newDefectTitle || !newDefectDesc) {
                    alert('Please enter defect title and description.');
                    return;
                  }
                  onCreateDefect({
                    slotId: newDefectSlotId,
                    title: newDefectTitle,
                    description: newDefectDesc,
                    severity: newDefectSeverity,
                    category: newDefectCategory,
                    contractorId: newDefectContractorId || null,
                  });
                  notify(`Logged defect ticket for Lot ${newDefectSlotId}.`);
                  setShowDefectModal(false);
                  setNewDefectTitle('');
                  setNewDefectDesc('');
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-md"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Manual Manpower & Sector Labor Allocation Modal */}
      {isAllocationModalOpen && (
        <div className="fixed inset-0 z-[99999] w-full h-full overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div 
            className="fixed inset-0 cursor-pointer"
            onClick={() => setIsAllocationModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-5 shadow-2xl my-auto max-h-[92vh] flex flex-col space-y-3.5 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="shrink-0 flex justify-between items-start border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                  {editingAllocationId ? 'MODIFY SECTOR ALLOCATION' : 'NEW WORKFORCE DISPATCH'}
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                  {editingAllocationId ? 'Edit Sector Manpower Allocation' : 'Manual Sector Labor Allocation'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAllocationModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form id="allocationForm" onSubmit={handleSaveAllocationSubmit} className="overflow-y-auto pr-1 space-y-3 text-xs font-sans">
              
              {/* Field Notification Dispatch Banner */}
              <div className="bg-teal-950/40 border border-teal-500/40 rounded-lg p-2.5 flex items-center gap-2.5 text-[11px] text-teal-200">
                <Smartphone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  <strong>Field Supervisor Directive:</strong> Saving this will instantly broadcast a real-time dispatch order & SMS notification to <strong>Engr. Ricardo Gomez (Site Lead)</strong> for on-site crew roll-call verification.
                </span>
              </div>

              {/* 1. Sector Name & Target Lots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Sector / Zone Name
                  </label>
                  <input
                    type="text"
                    required
                    value={allocSectorName}
                    onChange={(e) => setAllocSectorName(e.target.value)}
                    placeholder="E.g., Sector A (North Crest)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Target Lot Range
                  </label>
                  <input
                    type="text"
                    required
                    value={allocTargetLots}
                    onChange={(e) => setAllocTargetLots(e.target.value)}
                    placeholder="E.g., Lots 01 - 06"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* 2. Contractor & Worker Headcount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Assigned Contractor
                  </label>
                  <select
                    value={allocContractorId}
                    onChange={(e) => setAllocContractorId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  >
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Assigned Headcount (Workers)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllocHeadcount(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={allocHeadcount}
                      onChange={(e) => setAllocHeadcount(Number(e.target.value))}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono font-bold text-center text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setAllocHeadcount(prev => prev + 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Engineering Work Scope */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                  Engineering Work Scope
                </label>
                <input
                  type="text"
                  required
                  value={allocWorkScope}
                  onChange={(e) => setAllocWorkScope(e.target.value)}
                  placeholder="E.g., 6m Concrete Road Pavement & Curbs"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              {/* 4. Deployment Status */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                  Deployment Status
                </label>
                <div className="flex gap-2">
                  {(['ACTIVE', 'ON_HOLD', 'COMPLETED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAllocStatus(st)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-colors ${
                        allocStatus === st
                          ? st === 'ACTIVE' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' :
                            st === 'ON_HOLD' ? 'bg-amber-950 border-amber-500 text-amber-300' :
                            'bg-blue-950 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Notes & Timeline Remarks */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                  Operations Notes & Milestone Targets
                </label>
                <textarea
                  rows={2}
                  value={allocNotes}
                  onChange={(e) => setAllocNotes(e.target.value)}
                  placeholder="E.g., Accelerate subgrade before rainy forecast. Inspector spot-check scheduled for 08:00 AM."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                ></textarea>
              </div>

            </form>

            {/* Modal Sticky Footer */}
            <div className="shrink-0 pt-2.5 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAllocationModalOpen(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="allocationForm"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Save & Transmit Directive to Field</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. DEVELOPER-TO-BUYER HANDOVER ACTIVATION MODAL */}
      {/* ============================================================= */}
      {showHandoverModal && activeHandoverClient && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div 
            className="fixed inset-0 cursor-pointer"
            onClick={() => setShowHandoverModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="shrink-0 p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Buyer Handover Activation</h3>
                  <p className="text-[11px] text-slate-400 font-mono">1-Click Direct Email Dispatch</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowHandoverModal(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable if viewport is small) */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              
              {/* Buyer Context Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-sm">{activeHandoverClient.name}</strong>
                  <span className="bg-blue-950 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded border border-blue-800 font-bold">
                    {activeHandoverClient.id}
                  </span>
                </div>
                <div className="text-slate-300 text-xs flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeHandoverClient.email}</span>
                </div>
                {activeHandoverClient.inviteTokenExpiry && (
                  <div className="text-[10px] text-emerald-400 font-mono pt-1">
                    ✓ Handover Token Generated (7-Day Validity)
                  </div>
                )}
              </div>

              {/* Direct SMTP Email Dispatch Card */}
              <div className="bg-gradient-to-br from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-800/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Send Handover Email via SMTP</span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-900/60 border border-blue-700 text-blue-200 px-2 py-0.5 rounded font-bold">
                    LIVE GMAIL SMTP
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sends the official Cavinti Highland Crest invitation letter with lot specs and 1-click password setup directly to <strong className="text-white">{activeHandoverClient.email}</strong>.
                </p>

                <button
                  type="button"
                  disabled={isSendingHandoverEmail}
                  onClick={() => handleSendHandoverEmail(activeHandoverClient.id, activeHandoverClient.email)}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  {isSendingHandoverEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Dispatching via Gmail SMTP...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Handover Email Directly</span>
                    </>
                  )}
                </button>

                {emailSentNotice && (
                  <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-[11px] p-2.5 rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Email successfully delivered!</span>
                    </div>
                    {emailSentNotice.previewUrl && (
                      <a
                        href={emailSentNotice.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white underline hover:text-emerald-200 font-bold flex items-center gap-0.5 text-[10px]"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Copy Link Fallback */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400">Manual Direct Link:</span>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/?activateToken=${activeHandoverClient.inviteToken}`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    notify('Buyer activation link copied to clipboard.');
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-3.5 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950/60">
              <a
                href={`${typeof window !== 'undefined' ? window.location.origin : ''}/?activateToken=${activeHandoverClient.inviteToken}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Buyer Page ↗</span>
              </a>
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. ONBOARD NEW BUYER MODAL */}
      {/* ============================================================= */}
      {showClientModal && (
        <div className="fixed inset-0 z-[99999] w-full h-full overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div 
            className="fixed inset-0 cursor-pointer"
            onClick={() => setShowClientModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl my-auto max-h-[90vh] flex flex-col space-y-4 animate-fadeIn">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Onboard Buyer Profile</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Register buyer & generate handover token</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowClientModal(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterClientSubmit} className="overflow-y-auto pr-1 space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Buyer Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={cliName}
                  onChange={(e) => setCliName(e.target.value)}
                  placeholder="e.g. Carlos Mendoza"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={cliEmail}
                    onChange={(e) => setCliEmail(e.target.value)}
                    placeholder="e.g. carlos.mendoza@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={cliContact}
                    onChange={(e) => setCliContact(e.target.value)}
                    placeholder="e.g. +63 917 555 8899"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assign to Available Subdivided Lot
                </label>
                <select
                  value={cliSlotBind}
                  onChange={(e) => setCliSlotBind(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Unassigned (Hold in Reservation Pool) --</option>
                  {slots
                    .filter(s => s.status === 'Available' || !s.assignedClientId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.id} (Lot {s.slotNumber} • {s.areaSqm} sqm • ₱{s.basePrice.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Payment Plan
                  </label>
                  <select
                    value={cliPlan}
                    onChange={(e) => setCliPlan(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Installment">Installment (36 Months)</option>
                    <option value="Cash">Spot Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Total Contract Price (₱)
                  </label>
                  <input
                    type="number"
                    value={cliPrice}
                    onChange={(e) => setCliPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Register Buyer & Issue Handover</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

