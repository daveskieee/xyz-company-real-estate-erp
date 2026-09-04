/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, Users, FileText, Settings2, BarChart3, PieChart, Landmark, ShieldCheck, 
  Search, Plus, Hammer, DollarSign, Calendar, Sliders, ChevronRight, ChevronLeft, ChevronDown, UserCheck, Trash2, 
  CheckCircle, FileBadge, Radio, Layers, ArrowRight, AlertTriangle, Clock, CheckCircle2,
  FileSpreadsheet, ClipboardList, MapPin, HardHat, CloudSun, FileCheck2, UserPlus, Eye, BadgeAlert,
  Scale, Menu, History, Banknote, TrendingUp, Sparkles, FileCode, ShieldAlert,
  Ticket, Award, Bot, RefreshCw, CheckCheck, Zap, SlidersHorizontal, Edit3, X, Smartphone,
  Mail, ExternalLink, Check, Copy, Send, Compass, UserCog, KeyRound, Bell, Building, Save, CheckSquare,
  Camera, Upload, Image as ImageIcon, EyeOff, Lock, CalendarDays, FileCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, 
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  LandParcel, Slot, Client, QALog, Contractor, PayrollRecord, 
  CompanyBudget, PunchListDefect, CivilWorksMilestone, ProcessAuditLog, SlotStatus, DailyManpowerAudit,
  LaborAllocation, AIManpowerRecommendation, ProjectTask, DailySiteLog, ProjectDocument, ProjectRisk, 
  ChangeOrder, TaskStatus, CADParsedLot, GovernmentPermit, ScheduleEvent,
  ProjectProfile, ExtendedPayrollItem, CTVillDepartment, CTVillRole
} from '../types';
import { 
  CTVILL_ORGANIZATION_HIERARCHY, ALL_CTVILL_DEPARTMENTS, 
  getRolesForDepartment, getDefaultDailyRate, getDepartmentBadge 
} from '../data/ctvillWorkforce';
import logoJpg from '../assets/images/ctvill/logo.jpg';
import InteractiveMap from './InteractiveMap';
import ProjectKanban from './ProjectKanban';
import GanttTimeline from './GanttTimeline';
import DocumentManager from './DocumentManager';
import DailySiteDiary from './DailySiteDiary';
import RiskMatrix from './RiskMatrix';
import ProjectProfileHub from './ProjectProfileHub';
import PaymentsTracker from './PaymentsTracker';
import ProjectScheduleCalendar from './ProjectScheduleCalendar';
import GovernmentPermitsTracker from './GovernmentPermitsTracker';
import PayrollManager from './PayrollManager';

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
  permits?: GovernmentPermit[];
  scheduleEvents?: ScheduleEvent[];
  projects?: ProjectProfile[];
  extendedPayroll?: ExtendedPayrollItem[];
  session?: any;
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
  onDeleteContractor?: (contractorId: string) => void;
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
  onUpdateDocument?: (id: string, doc: Partial<ProjectDocument>) => void;
  onDeleteDocument?: (id: string) => void;
  onSyncSchedule?: (tasks: any[]) => void;
  onAddRisk?: (risk: Omit<ProjectRisk, 'id' | 'createdAt'>) => void;
  onImportCADLots?: (lots: CADParsedLot[]) => void;
  onClearAllLots?: () => void;
  onDeleteParcel?: (parcelId: string) => void;
  onApplyAIPricing?: (updates: { slotId: string; newBasePrice: number }[], targetMargin: number) => Promise<void> | void;
  onAddPermit?: (permit: Partial<GovernmentPermit>) => Promise<void>;
  onUpdatePermitStatus?: (permitId: string, status: any, notes?: string) => Promise<void>;
  onUpdatePermit?: (permitId: string, updates: Partial<GovernmentPermit>) => Promise<void>;
  onDeletePermit?: (permitId: string) => Promise<void>;
  onAddScheduleEvent?: (event: Partial<ScheduleEvent>) => Promise<void>;
  onUpdateScheduleEvent?: (eventId: string, updates: Partial<ScheduleEvent>) => Promise<void>;
  onDeleteScheduleEvent?: (eventId: string) => Promise<void>;
  onCreateProject?: (project: Partial<ProjectProfile>) => Promise<void>;
  onUpdateProject?: (id: string, updates: Partial<ProjectProfile>) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void>;
  onAddExtendedPayroll?: (item: Partial<ExtendedPayrollItem>) => Promise<void>;
  onUpdateExtendedPayroll?: (id: string, updates: Partial<ExtendedPayrollItem>) => Promise<void>;
  onDeleteExtendedPayroll?: (id: string) => Promise<void>;
  onRecordPayment?: (paymentData: any) => Promise<void>;
  onDisbursePayroll?: (id?: string, all?: boolean) => Promise<void>;
  onLogout: () => void;
  onUpdateSession?: (updated: any) => void;
}

export default function AdminPortal({
  parcels, slots, clients, contractors, qaLogs, punchListDefects, civilWorksMilestones,
  auditLogs, payroll, budget, manpowerAudits = [], laborAllocations = [], aiRecommendations = [],
  tasks = [], siteLogs = [], documents = [], risks = [], changeOrders = [],
  permits = [], scheduleEvents = [], projects = [], extendedPayroll = [],
  onAddParcel, onSubdivideParcel, onRegisterClient, onDeleteClient, onAssignClient,
  onTransitionSlotStatus, onUpdateTitlePipeline, onVerifyKyc, onCreateDefect, onUpdateDefect,
  onUpdateCivilMilestone, onRegisterContractor, onDeleteContractor, onUpdateContractors, onAddQALog, onAddPayroll,
  onCreateManpowerAudit, onSaveAllocation, onApplyAIRecommendation,
  onAddTask, onUpdateTaskStatus, onAddSiteLog, onAddDocument, onUpdateDocument, onDeleteDocument, onSyncSchedule, onAddRisk,
  onImportCADLots, onClearAllLots, onDeleteParcel, onApplyAIPricing,
  onAddPermit, onUpdatePermitStatus, onUpdatePermit, onDeletePermit, 
  onAddScheduleEvent, onUpdateScheduleEvent, onDeleteScheduleEvent,
  onCreateProject, onUpdateProject, onDeleteProject,
  onAddExtendedPayroll, onUpdateExtendedPayroll, onDeleteExtendedPayroll,
  onRecordPayment, onDisbursePayroll,
  onLogout, onUpdateSession, session
}: AdminPortalProps) {
  
  // Navigation Tabs: Default to Projects profile hub
  const [activeTab, setActiveTab] = useState<string>('projects');

  // Collapsible Left Navigation Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Load saved account settings from localStorage so changes are NEVER reset
  const savedSettings = (() => {
    try {
      const raw = localStorage.getItem('ctvill_account_settings');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  // Account Settings State (CTVill Operations Manager)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    savedSettings?.avatarUrl || (session && typeof session === 'object' && session.avatarUrl ? session.avatarUrl : null)
  );
  const [profileName, setProfileName] = useState<string>(
    savedSettings?.profileName || (session && typeof session === 'object' && session.name ? session.name : 'Mauro Principe Jr.')
  );
  const [profileTitle, setProfileTitle] = useState<string>(
    savedSettings?.profileTitle || 'Operations Director & Project Lead'
  );
  const [profileEmail, setProfileEmail] = useState<string>(
    savedSettings?.profileEmail || (session && typeof session === 'object' && session.email ? session.email : 'angelfiremaui_03@yahoo.com')
  );
  const [profilePhone, setProfilePhone] = useState<string>(
    savedSettings?.profilePhone || '(049) 544 7724 / 0933-827-8885'
  );
  const [profileDivision, setProfileDivision] = useState<string>(
    savedSettings?.profileDivision || 'Commercial & Corporate Interiors'
  );
  const [currentPass, setCurrentPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [alertGantt, setAlertGantt] = useState<boolean>(savedSettings?.alertGantt ?? true);
  const [alertPunchlist, setAlertPunchlist] = useState<boolean>(savedSettings?.alertPunchlist ?? true);
  const [alertSiteDiary, setAlertSiteDiary] = useState<boolean>(savedSettings?.alertSiteDiary ?? true);
  const [alertManpower, setAlertManpower] = useState<boolean>(savedSettings?.alertManpower ?? true);
  const [defaultPmsView, setDefaultPmsView] = useState<string>(savedSettings?.defaultPmsView || 'dashboard');
  const [sessionTimeout, setSessionTimeout] = useState<string>(savedSettings?.sessionTimeout || '8h');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState<boolean>(false);

  // Sync authenticated session profile into settings state
  useEffect(() => {
    if (session && typeof session === 'object') {
      if (session.email) setProfileEmail(session.email);
      if (session.name) setProfileName(session.name);
      if (session.avatarUrl !== undefined && session.avatarUrl !== null) setAvatarUrl(session.avatarUrl);
      if (session.title) setProfileTitle(session.title);
      if (session.phone) setProfilePhone(session.phone);
      if (session.division) setProfileDivision(session.division);
    }
  }, [session]);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Initials Helper for Default Avatars
  const getInitials = (name: string) => {
    if (!name) return 'MP';
    const clean = name.replace(/jr\.?|sr\.?|iii|ii|iv/gi, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'MP';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Fetch live profile and preferences from PostgreSQL on mount so refreshes ALWAYS load saved data
  useEffect(() => {
    let isCancelled = false;
    const fetchLiveProfile = async () => {
      try {
        const q = session && typeof session === 'object' && session.id
          ? `?userId=${encodeURIComponent(session.id)}`
          : session && typeof session === 'object' && session.email
          ? `?email=${encodeURIComponent(session.email)}`
          : '';
        const res = await fetch(`/api/auth/profile${q}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.profile && !isCancelled) {
            const p = data.profile;
            if (p.name) setProfileName(p.name);
            if (p.email) setProfileEmail(p.email);
            if (p.contact) setProfilePhone(p.contact);
            if (p.title) setProfileTitle(p.title);
            if (p.division) setProfileDivision(p.division);
            if (p.avatarUrl !== undefined) setAvatarUrl(p.avatarUrl);
            if (p.alertGantt !== undefined) setAlertGantt(p.alertGantt);
            if (p.alertPunchlist !== undefined) setAlertPunchlist(p.alertPunchlist);
            if (p.alertSiteDiary !== undefined) setAlertSiteDiary(p.alertSiteDiary);
            if (p.alertManpower !== undefined) setAlertManpower(p.alertManpower);
            if (p.defaultPmsView) setDefaultPmsView(p.defaultPmsView);
            if (p.sessionTimeout) setSessionTimeout(p.sessionTimeout);
          }
        }
      } catch { /* retain current state */ }
    };
    fetchLiveProfile();
    return () => { isCancelled = true; };
  }, [session]);

  // Auto-persist settings to localStorage whenever modified
  useEffect(() => {
    try {
      const payload = {
        profileName,
        profileTitle,
        profileEmail,
        profilePhone,
        profileDivision,
        avatarUrl,
        alertGantt,
        alertPunchlist,
        alertSiteDiary,
        alertManpower,
        defaultPmsView,
        sessionTimeout,
      };
      localStorage.setItem('ctvill_account_settings', JSON.stringify(payload));
    } catch { /* silent */ }
  }, [profileName, profileTitle, profileEmail, profilePhone, profileDivision, avatarUrl, alertGantt, alertPunchlist, alertSiteDiary, alertManpower, defaultPmsView, sessionTimeout]);

  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const notify = (msg: string) => {
    setSystemNotice(msg);
    setTimeout(() => setSystemNotice(null), 4000);
  };

  // Comprehensive Save Method that persists to both PostgreSQL & localStorage & updates session
  const persistSettingsToStorageAndDb = async (overrides: Partial<any> = {}) => {
    setIsSavingProfile(true);
    try {
      const activeAvatar = overrides.avatarUrl !== undefined ? overrides.avatarUrl : avatarUrl;
      const activeName = overrides.profileName !== undefined ? overrides.profileName : profileName;
      const activeTitle = overrides.profileTitle !== undefined ? overrides.profileTitle : profileTitle;
      const activeEmail = overrides.profileEmail !== undefined ? overrides.profileEmail : profileEmail;
      const activePhone = overrides.profilePhone !== undefined ? overrides.profilePhone : profilePhone;
      const activeDivision = overrides.profileDivision !== undefined ? overrides.profileDivision : profileDivision;
      const activeAlertGantt = overrides.alertGantt !== undefined ? overrides.alertGantt : alertGantt;
      const activeAlertPunchlist = overrides.alertPunchlist !== undefined ? overrides.alertPunchlist : alertPunchlist;
      const activeAlertSiteDiary = overrides.alertSiteDiary !== undefined ? overrides.alertSiteDiary : alertSiteDiary;
      const activeAlertManpower = overrides.alertManpower !== undefined ? overrides.alertManpower : alertManpower;
      const activeDefaultPmsView = overrides.defaultPmsView !== undefined ? overrides.defaultPmsView : defaultPmsView;
      const activeSessionTimeout = overrides.sessionTimeout !== undefined ? overrides.sessionTimeout : sessionTimeout;

      const payload = {
        userId: session && typeof session === 'object' ? session.id : undefined,
        name: activeName,
        email: activeEmail,
        contact: activePhone,
        title: activeTitle,
        division: activeDivision,
        avatarUrl: activeAvatar,
        alertGantt: activeAlertGantt,
        alertPunchlist: activeAlertPunchlist,
        alertSiteDiary: activeAlertSiteDiary,
        alertManpower: activeAlertManpower,
        defaultPmsView: activeDefaultPmsView,
        sessionTimeout: activeSessionTimeout,
        // local storage key aliases
        profileName: activeName,
        profileEmail: activeEmail,
        profilePhone: activePhone,
        profileTitle: activeTitle,
        profileDivision: activeDivision,
      };

      // 1. Immediately cache in localStorage
      localStorage.setItem('ctvill_account_settings', JSON.stringify(payload));

      // 2. Update xyz_pm_user_session in localStorage so App.tsx has latest on reload
      const currentSavedSession = localStorage.getItem('xyz_pm_user_session') || localStorage.getItem('xyz_erp_user_session');
      if (currentSavedSession) {
        try {
          const parsed = JSON.parse(currentSavedSession);
          const updatedSession = {
            ...parsed,
            name: activeName,
            email: activeEmail,
            avatarUrl: activeAvatar,
            title: activeTitle,
            phone: activePhone,
            division: activeDivision,
          };
          localStorage.setItem('xyz_pm_user_session', JSON.stringify(updatedSession));
        } catch { /* silent */ }
      }

      // 3. Update in App.tsx session state if prop provided
      if (onUpdateSession) {
        onUpdateSession({
          name: activeName,
          email: activeEmail,
          avatarUrl: activeAvatar,
          title: activeTitle,
          phone: activePhone,
          division: activeDivision,
        });
      }

      // 4. Save to PostgreSQL database
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        notify('✅ Account profile & settings successfully saved to PostgreSQL database!');
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`❌ Failed to save to database: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Save settings error:', err);
      notify('❌ Database connection error. Unable to save settings.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // High quality Canvas downscaling to max 400x400
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(compressed);
          notify('Avatar updated & saved to PostgreSQL database!');
          persistSettingsToStorageAndDb({ avatarUrl: compressed });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    notify('Avatar removed. Restored to default initials.');
    persistSettingsToStorageAndDb({ avatarUrl: null });
  };

  const handleSaveProfileToDb = () => {
    persistSettingsToStorageAndDb();
  };

  const handleUpdatePasskey = async () => {
    setPassError(null);
    setPassSuccess(null);

    if (!currentPass || !newPass) {
      const msg = 'Please enter both current and new passkeys.';
      setPassError(msg);
      notify('⚠️ ' + msg);
      return;
    }
    if (newPass !== confirmPass) {
      const msg = 'New passkey confirmation does not match.';
      setPassError(msg);
      notify('⚠️ ' + msg);
      return;
    }
    if (newPass.length < 6) {
      const msg = 'New passkey must be at least 6 characters.';
      setPassError(msg);
      notify('⚠️ ' + msg);
      return;
    }

    setIsUpdatingPass(true);
    try {
      const activeUserId = session && typeof session === 'object' ? session.id : undefined;
      const activeEmail = (session && typeof session === 'object' && session.email) || profileEmail;

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUserId,
          email: activeEmail,
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || 'Failed to update passkey in database.';
        setPassError(errMsg);
        notify('❌ ' + errMsg);
        return;
      }

      setPassSuccess('✅ Security passkey updated & synced to PostgreSQL database! You can now log in with your new passkey.');
      notify('✅ Security passkey updated & synced to PostgreSQL database!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      const errMsg = 'Error connecting to database to update passkey. Please ensure the server is active.';
      setPassError(errMsg);
      notify('❌ ' + errMsg);
    } finally {
      setIsUpdatingPass(false);
    }
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

  // Contractor & Workforce Form State
  const [contEmploymentType, setContEmploymentType] = useState<'INTERNAL' | 'OUTSOURCED'>('INTERNAL');
  const [contDepartment, setContDepartment] = useState<CTVillDepartment>('Project Management & Construction ("CONSTRUCT" Phase)');
  const [contRoleTitle, setContRoleTitle] = useState<CTVillRole>('Site Foremen');
  const [contDailyRate, setContDailyRate] = useState<number>(1200);
  const [contMonthlySalary, setContMonthlySalary] = useState<number>(26400);
  const [contName, setContName] = useState<string>('');
  const [contComp, setContComp] = useState<string>('');
  const [contSpec, setContSpec] = useState<any>('General Contractor');
  const [contAmt, setContAmt] = useState<number>(0);
  const [contManpower, setContManpower] = useState<number>(1);
  const [contContact, setContContact] = useState<string>('');
  const [isContractorModalOpen, setIsContractorModalOpen] = useState<boolean>(false);
  const [workforceFilter, setWorkforceFilter] = useState<'ALL' | 'INTERNAL' | 'OUTSOURCED'>('ALL');

  const handleDepartmentChange = (dept: CTVillDepartment) => {
    setContDepartment(dept);
    const roles = getRolesForDepartment(dept);
    if (roles.length > 0) {
      const defaultRole = roles[0];
      setContRoleTitle(defaultRole);
      const rate = getDefaultDailyRate(defaultRole);
      setContDailyRate(rate);
      setContMonthlySalary(rate * 22);
    }
  };

  const handleRoleChange = (role: CTVillRole) => {
    setContRoleTitle(role);
    const rate = getDefaultDailyRate(role);
    setContDailyRate(rate);
    setContMonthlySalary(rate * 22);
  };

  const handleRegisterContractorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contName.trim()) return;
    const isInternal = contEmploymentType === 'INTERNAL';
    const newContractor: Contractor = {
      id: `CONT-${Date.now()}`,
      name: contName.trim(),
      company: isInternal ? 'CTVill Builders Corporation' : (contComp.trim() || contName.trim()),
      specialty: isInternal ? contRoleTitle : contSpec,
      activeManpower: isInternal ? 1 : (contManpower || 1),
      milestoneProgress: 0,
      contractAmount: isInternal ? (contDailyRate * 22) : contAmt,
      paidAmount: 0,
      rating: 5.0,
      employmentType: contEmploymentType,
      department: isInternal ? contDepartment : null,
      roleTitle: isInternal ? contRoleTitle : null,
      dailyRate: isInternal && contDailyRate > 0 ? contDailyRate : null,
      monthlySalary: isInternal && contMonthlySalary > 0 ? contMonthlySalary : (contDailyRate ? contDailyRate * 22 : null),
      contact: contContact.trim() || undefined,
      status: 'ACTIVE',
    };
    onRegisterContractor(newContractor);
    setIsContractorModalOpen(false);
    setContName('');
    setContComp('');
    setContContact('');
    setContDailyRate(1200);
    setContMonthlySalary(26400);
    setContManpower(1);
    notify(`✅ ${isInternal ? 'CTVill In-House Staff' : 'Outsourced Contractor'} "${newContractor.name}" registered and saved to database!`);
  };

  // Allocation modal also tracks free-text contractor name when list is empty
  const [allocContractorNameFreeText, setAllocContractorNameFreeText] = useState<string>('');

  // Manual Manpower Allocation Form States
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState<boolean>(false);
  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
  const [allocSectorName, setAllocSectorName] = useState<string>('Sector A (North Crest Hillside)');
  const [allocTargetLots, setAllocTargetLots] = useState<string>('Lots 01 - 06');
  const [allocContractorId, setAllocContractorId] = useState<string>(contractors[0]?.id || '');
  const [allocHeadcount, setAllocHeadcount] = useState<number>(16);
  const [allocWorkScope, setAllocWorkScope] = useState<string>('Subgrade Compaction & Boundary Marker Staking');
  const [allocStatus, setAllocStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ACTIVE');
  const [allocNotes, setAllocNotes] = useState<string>('');

  // AI Workforce Dispatch Assistant States
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiScanMessage, setAiScanMessage] = useState<string | null>(null);

  // Auto-lock body scroll and ensure modals center on active screen
  useEffect(() => {
    if (isAllocationModalOpen || isContractorModalOpen || transitioningSlot || showDefectModal || showClientModal || showHandoverModal || isNewParcelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAllocationModalOpen, isContractorModalOpen, transitioningSlot, showDefectModal, showClientModal, showHandoverModal, isNewParcelModalOpen]);

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
    { id: 'gis-scanner', label: 'Project Map', icon: Compass, desc: 'Interactive Vector Space Map' },
    { id: 'tasks', label: 'PM Tasks (Kanban)', icon: Sparkles, desc: `${tasks.length} Construction Tasks` },
    { id: 'gantt', label: 'Gantt Schedule', icon: BarChart3, desc: '16-Week Milestone Timeline' },
    { id: 'site-diary', label: 'Weather Report', icon: CloudSun, desc: 'Live Atmospheric Telemetry & Station' },
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
      setAllocContractorNameFreeText(alloc.contractorName || '');
      setAllocHeadcount(alloc.assignedHeadcount);
      setAllocWorkScope(alloc.workScope);
      setAllocStatus(alloc.status);
      setAllocNotes(alloc.notes || '');
    } else {
      setEditingAllocationId(null);
      setAllocSectorName('Sector A (North Crest Hillside)');
      setAllocTargetLots('Lots 01 - 06');
      setAllocContractorId(contractors[0]?.id || '');
      setAllocContractorNameFreeText('');
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
    const resolvedName = selContractor?.name || allocContractorNameFreeText.trim() || 'Assigned Workforce Crew';
    const finalContractorId = selContractor?.id || (allocContractorNameFreeText.trim() ? `CONT-${Date.now().toString().slice(-4)}` : 'CONT-CREW');

    // If user entered a custom contractor name and it's not yet in the roster, auto-register them
    if (!selContractor && allocContractorNameFreeText.trim() && onRegisterContractor) {
      onRegisterContractor({
        id: finalContractorId,
        name: allocContractorNameFreeText.trim(),
        company: allocContractorNameFreeText.trim(),
        specialty: 'Civil Engineering',
        contractAmount: 0,
        paidAmount: 0,
        activeManpower: Number(allocHeadcount) || 1,
        milestoneProgress: 0,
        rating: 5.0,
      });
    }

    const allocData: LaborAllocation = {
      id: editingAllocationId || `ALLOC-${Date.now()}`,
      contractorId: finalContractorId,
      contractorName: resolvedName,
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
    setAllocContractorNameFreeText('');
    notify(`✅ Allocation directive dispatched! ${allocHeadcount} workers assigned to ${allocSectorName}.`);
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
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          {/* Hideable Navigation Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={isSidebarOpen ? "Collapse Navigation Sidebar" : "Expand Navigation Sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-black border border-slate-800 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
              <img src={logoJpg} alt="CTVill Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight">CTVILL</h1>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                  OPERATIONS PM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Turnkey Fit-Out & Commercial Project Management
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Sync: <strong>Neon DB Active</strong></span>
          </div>

          <button
            onClick={() => setActiveTab('account-settings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'account-settings'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px] overflow-hidden border border-amber-500/40 shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(profileName)}</span>
              )}
            </div>
            <span className="hidden md:inline">Account Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-red-950/50 border border-slate-700 hover:border-red-600 text-slate-300 hover:text-red-300 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* System Toast Notification */}
      {systemNotice && (
        <div className="bg-amber-600 text-slate-950 text-xs font-bold px-6 py-2.5 flex items-center justify-between border-b border-amber-400 animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{systemNotice}</span>
          </div>
          <button onClick={() => setSystemNotice(null)} className="text-slate-900 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Layout Container with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left-Side Hideable Navigation Sidebar */}
        <aside 
          className={`transition-all duration-300 ease-in-out bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none z-20 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          {/* Sidebar Navigation Items */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {[
              {
                title: 'PROJECT EXECUTION',
                items: [
                  { id: 'projects', label: 'Projects', icon: Building2 },
                  { id: 'gantt', label: 'Gantt Chart', icon: BarChart3 },
                  { id: 'schedule', label: 'Schedule', icon: CalendarDays, badge: `${scheduleEvents.length}` },
                  { id: 'site-diary', label: 'Weather Report', icon: CloudSun, badge: `${siteLogs.length}` },
                  { id: 'documents', label: 'Document Management', icon: FileCode, badge: `${documents.length}` },
                ]
              },
              {
                title: 'FINANCE & COMPLIANCE',
                items: [
                  { id: 'payments', label: 'Payments', icon: DollarSign, badge: `${clients.length}` },
                  { id: 'permits', label: 'Government Permits', icon: FileCheck, badge: `${permits.length}` },
                  { id: 'payroll', label: 'Payroll', icon: Banknote, badge: `${payroll.length}` },
                ]
              },
              {
                title: 'OPERATIONS & WORKFORCE',
                items: [
                  { id: 'contractors', label: 'Crew & Workforce', icon: Users, badge: `${totalManpower}` },
                  { id: 'dashboard', label: 'Executive Overview', icon: TrendingUp },
                  { id: 'gis-scanner', label: 'Project Map & CAD', icon: MapPin },
                  { id: 'audit-trail', label: 'Audit Trail', icon: History },
                ]
              },
              {
                title: 'SYSTEM',
                items: [
                  { id: 'account-settings', label: 'Account Settings', icon: Settings2 },
                ]
              }
            ].map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {isSidebarOpen ? (
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {section.title}
                  </div>
                ) : (
                  <div className="h-px bg-slate-800/80 my-2 mx-2" />
                )}

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={!isSidebarOpen ? item.label : undefined}
                      className={`
                        w-full flex items-center gap-3 rounded-xl transition-all cursor-pointer
                        ${isSidebarOpen ? 'px-3 py-2 text-xs font-semibold' : 'px-0 py-2.5 justify-center'}
                        ${isActive 
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'}
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
                      {isSidebarOpen && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ml-1.5 ${
                              isActive 
                                ? 'bg-slate-950/30 text-slate-950' 
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Sidebar User Profile Card */}
          <div className={`border-t border-slate-800/80 bg-slate-950/80 ${isSidebarOpen ? 'p-3' : 'p-2'}`}>
            <div 
              onClick={() => setActiveTab('account-settings')}
              className={`flex items-center gap-2.5 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer ${
                isSidebarOpen ? 'p-1.5' : 'justify-center p-1'
              } ${activeTab === 'account-settings' ? 'ring-1 ring-amber-500/40' : ''}`}
              title="Open Account Settings"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-amber-500/20 overflow-hidden border border-amber-500/40">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(profileName)}</span>
                )}
              </div>
              {isSidebarOpen && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {profileName}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono truncate">
                    Operations Director
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* TAB 0.1: COMMERCIAL PROJECTS PROFILE & HUB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <ProjectProfileHub
              projects={projects}
              tasks={tasks}
              contractors={contractors}
              onCreateProject={onCreateProject}
              onUpdateProject={onUpdateProject}
              onDeleteProject={onDeleteProject}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 0.2: INSTALLMENT PAYMENTS & BILLING */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <PaymentsTracker
              clients={clients}
              projects={projects}
              onRecordPayment={onRecordPayment}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 0.3: MASTER SCHEDULE & CALENDAR */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <ProjectScheduleCalendar
              events={scheduleEvents}
              onAddEvent={onAddScheduleEvent}
              onUpdateEvent={onUpdateScheduleEvent}
              onDeleteEvent={onDeleteScheduleEvent}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 0.4: GOVERNMENT PERMITS & LEGAL COMPLIANCE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'permits' && (
          <div className="space-y-6">
            <GovernmentPermitsTracker
              permits={permits}
              onAddPermit={onAddPermit}
              onUpdatePermitStatus={onUpdatePermitStatus}
              onUpdatePermit={onUpdatePermit}
              onDeletePermit={onDeletePermit}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 0.5: PAYROLL & ARTISAN WAGE DISBURSAL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <PayrollManager
              initialPayroll={extendedPayroll}
              payrollRecords={payroll}
              contractors={contractors}
              onDisburse={onDisbursePayroll}
              onAddWageEntry={onAddExtendedPayroll}
              onUpdateWageEntry={onUpdateExtendedPayroll}
              onDeleteWageEntry={onDeleteExtendedPayroll}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: CTVILL COMMERCIAL FIT-OUT DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Executive Welcome Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0 shadow-lg shadow-amber-500/10">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      CTVill Turnkey Fit-Out Command Center
                    </h2>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                      Live Dynamic State
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time operational metrics driven by your live projects, daily diary entries, and workforce allocations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('gantt')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Gantt Timeline</span>
                </button>
                <button
                  onClick={() => setActiveTab('site-diary')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                >
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Weather Report</span>
                </button>
              </div>
            </div>

            {/* Top KPI Metrics Cards — 100% Dynamic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>ACTIVE FIT-OUT SITES</span>
                  <Building className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2 font-mono">
                  {parcels.length} {parcels.length === 1 ? 'Site' : 'Sites'}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span className="text-amber-400 font-semibold">
                    {parcels.reduce((sum, p) => sum + (p.totalAreaSqm || 0), 0).toLocaleString()} sqm
                  </span>
                  <span className="text-slate-500 font-mono">
                    {parcels.length > 0 ? 'Configured' : 'Empty'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>OVERALL FIT-OUT PROGRESS</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                  {civilWorksMilestones.length > 0
                    ? `${(civilWorksMilestones.reduce((sum, m) => sum + m.currentPercentage, 0) / civilWorksMilestones.length).toFixed(1)}%`
                    : '0.0%'}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold">
                    {civilWorksMilestones.length > 0 ? 'Live Schedule' : 'No Active Milestones'}
                  </span>
                  <span className="text-slate-500 font-mono">Critical Path</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>FIELD WORKFORCE DEPLOYED</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2 font-mono">
                  {totalManpower} Specialists
                </div>
                <div className="text-xs text-blue-400 mt-2">
                  {contractors.length > 0 ? `${contractors.length} Trade Teams Active` : 'No Trades Registered'}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                  <span>WEATHER OBSERVATION LOGS</span>
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2 font-mono">
                  {siteLogs.length} Field Reports
                </div>
                <div className="text-xs text-purple-400 mt-2">
                  {siteLogs.length > 0 ? 'Daily logs recorded' : 'No logs recorded yet'}
                </div>
              </div>
            </div>

            {/* Active Commercial Projects Breakdown */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Active Commercial Fit-Out Projects ({parcels.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time status across ongoing corporate and interior fit-out projects
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('gantt')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Gantt Critical Path</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {parcels.length === 0 ? (
                <div className="py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Building2 className="w-10 h-10 text-slate-600" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">No fit-out projects configured yet</h4>
                    <p className="text-xs text-slate-400 max-w-md">
                      Start by importing AutoCAD plans in Project Map, checking live conditions in Weather Report, or uploading documents in Blueprint DMS.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('gis-scanner')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    Open Project Map
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                  {parcels.map((proj) => {
                    const projectMilestones = civilWorksMilestones.filter(m => m.parcelId === proj.id);
                    const avgProg = projectMilestones.length > 0
                      ? Math.round(projectMilestones.reduce((s, m) => s + m.currentPercentage, 0) / projectMilestones.length)
                      : 0;
                    return (
                      <div key={proj.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{proj.location} • <span className="font-mono text-amber-400 font-semibold">{proj.totalAreaSqm.toLocaleString()} sqm</span></p>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-amber-950/80 border border-amber-800 text-amber-300">
                            {avgProg === 100 ? 'COMPLETED' : avgProg > 0 ? 'IN PROGRESS' : 'PLANNING'}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px] font-medium">{projectMilestones.length} Schedule Milestones</span>
                            <span className="font-mono text-amber-400 font-bold">{avgProg}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                              style={{ width: `${avgProg}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Middle Row: Trade Manpower Distribution & Quick Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Fit-Out Workforce by Trade Specialty */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Trade Workforce On-Site ({contractors.length} Teams)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Live technician headcount mapped from Workforce & Manpower
                  </p>
                </div>

                {contractors.length === 0 ? (
                  <div className="h-56 my-3 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 space-y-2">
                    <Users className="w-8 h-8 text-slate-600" />
                    <p className="text-xs">No trade contractors registered yet.</p>
                    <button
                      onClick={() => setActiveTab('contractors')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
                    >
                      Add Contractors in Workforce & Manpower
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="h-56 my-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={contractors.map(c => ({ trade: c.specialty || c.name, workers: c.activeManpower }))}>
                          <XAxis dataKey="trade" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                          />
                          <Bar dataKey="workers" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs pt-3 border-t border-slate-800 font-mono">
                      {contractors.slice(0, 5).map(c => (
                        <div key={c.id} className="text-center p-2 bg-slate-900/50 rounded-lg flex-1 min-w-[70px]">
                          <span className="text-slate-400 block text-[10px] truncate">{c.specialty || c.name}</span>
                          <strong className="text-amber-400 text-sm">{c.activeManpower}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Quick Navigation Cards */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Quick Project Operations Modules
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct access to site management workspaces
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveTab('gis-scanner')}
                    className="w-full p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300">Project Map</div>
                        <div className="text-[10px] text-slate-400">Review architectural plans & space zoning</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('gantt')}
                    className="w-full p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300">Gantt Milestone Schedule</div>
                        <div className="text-[10px] text-slate-400">Critical path & completion tracking</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('site-diary')}
                    className="w-full p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                        <CloudSun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300">Weather Report</div>
                        <div className="text-[10px] text-slate-400">Live atmospheric telemetry & forecasts</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('documents')}
                    className="w-full p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">Document Management</div>
                        <div className="text-[10px] text-slate-400">CAD files, spreadsheets & project archives</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

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
              onTransitionSlotStatus={onTransitionSlotStatus}
              onAssignClient={onAssignClient}
              onImportCADLots={onImportCADLots}
              onClearAllLots={onClearAllLots}
              onApplyAIPricing={onApplyAIPricing}
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
        {/* TAB 5.4: CENTRALIZED DOCUMENT MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentManager
              documents={documents}
              onUploadDocument={onAddDocument || (() => {})}
              onUpdateDocument={onUpdateDocument || (() => {})}
              onDeleteDocument={onDeleteDocument || (() => {})}
              milestones={civilWorksMilestones}
              onUpdateMilestone={onUpdateCivilMilestone}
              onSyncSchedule={onSyncSchedule}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
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
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsContractorModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Worker</span>
                </button>
                <button
                  onClick={() => handleOpenAllocationModal()}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Users className="w-4 h-4" />
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
                <span className="text-[10px] text-teal-400 block font-mono">{contractors.length} Registered Trade Partners</span>
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
                  {manpowerAudits.length > 0 ? (manpowerAudits.reduce((sum, a) => sum + a.productivityIndex, 0) / manpowerAudits.length).toFixed(1) : '0.0'}%
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
                    A discrepancy between contractor billed manifest and verified on-site headcount was flagged. Payout releases remain guarded until rectified on next shift inspection.
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

            {/* Section 2: Contractor & In-House Workforce Rosters */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-teal-400" />
                    CTVill Builders Corporation Workforce Roster &amp; Trade Partners
                  </h4>
                  <p className="text-xs text-slate-400">
                    Internal workforce across 5 company divisions and authorized outsourced contractors
                  </p>
                </div>
                {/* Workforce Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setWorkforceFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${workforceFilter === 'ALL' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    All ({contractors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkforceFilter('INTERNAL')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${workforceFilter === 'INTERNAL' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    🏢 CTVill In-House ({contractors.filter(c => c.employmentType !== 'OUTSOURCED').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkforceFilter('OUTSOURCED')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${workforceFilter === 'OUTSOURCED' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    🤝 Outsourced ({contractors.filter(c => c.employmentType === 'OUTSOURCED').length})
                  </button>
                </div>
              </div>

              {contractors.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                  <Users className="w-10 h-10 text-slate-600 mx-auto" />
                  <div className="text-slate-300 font-bold text-sm">No Registered Workforce Yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    CTVill Builders Corporation operates its own workforce. Click "Register Worker" to add your in-house engineers, site foremen, skilled trade crews, or optional contractor firms.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsContractorModalOpen(true)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold font-mono transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register CTVill Staff</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contractors
                    .filter(c => {
                      if (workforceFilter === 'INTERNAL') return c.employmentType !== 'OUTSOURCED';
                      if (workforceFilter === 'OUTSOURCED') return c.employmentType === 'OUTSOURCED';
                      return true;
                    })
                    .map((c) => {
                      const isInternal = c.employmentType !== 'OUTSOURCED';
                      return (
                        <div key={c.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isInternal ? (
                                  <span className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    🏢 CTVILL IN-HOUSE
                                  </span>
                                ) : (
                                  <span className="bg-amber-950/80 border border-amber-700 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    🤝 OUTSOURCED PARTNER
                                  </span>
                                )}
                                {isInternal && c.department && (
                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${getDepartmentBadge(c.department)}`}>
                                    {c.department.split('(')[0].trim()}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-white mt-1">{c.name}</h4>
                              <p className="text-xs text-slate-400 font-medium">
                                {c.roleTitle || c.specialty || 'Staff'} • <span className="text-slate-500">{c.company}</span>
                              </p>
                            </div>
                            <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0">
                              ● ACTIVE
                            </span>
                          </div>

                          <div className="space-y-2 text-xs pt-2 border-t border-slate-800 font-sans">
                            {isInternal ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Daily Wage Rate:</span>
                                  <strong className="text-emerald-400 font-mono">
                                    {c.dailyRate ? `₱${c.dailyRate.toLocaleString()} / day` : 'Monthly Salary Basis'}
                                  </strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Monthly Compensation:</span>
                                  <span className="text-slate-200 font-mono font-bold">
                                    ₱{(c.monthlySalary || (c.dailyRate ? c.dailyRate * 22 : 0)).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Department / Division:</span>
                                  <span className="text-slate-300 text-[11px] truncate max-w-[170px]">
                                    {c.department || 'CONSTRUCT Phase'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Active Deployed Crew:</span>
                                  <strong className="text-white font-mono">{c.activeManpower} Workers</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Milestone Completion:</span>
                                  <strong className="text-blue-400 font-mono">{c.milestoneProgress}%</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Contract Lump-Sum:</span>
                                  <span className="text-slate-300 font-mono font-bold">₱{c.contractAmount?.toLocaleString()}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-400">QA Performance Rating:</span>
                              <strong className="text-amber-400 font-mono">⭐ {c.rating || 5.0} / 5.0</strong>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenAllocationModal({
                                  id: `ALLOC-${Date.now()}`,
                                  contractorId: c.id,
                                  contractorName: c.name,
                                  sectorName: 'Sector A (North Crest Hillside)',
                                  targetLots: 'Lots 01 - 06',
                                  assignedHeadcount: c.activeManpower || 1,
                                  workScope: c.roleTitle || c.specialty || 'General Scope',
                                  status: 'ACTIVE',
                                  notes: `Direct allocation for ${c.name} (${c.roleTitle || c.specialty})`
                                });
                              }}
                              className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Allocate to Sector</span>
                            </button>
                            {onDeleteContractor && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove "${c.name}" from CTVill workforce roster?`)) {
                                    onDeleteContractor(c.id);
                                    notify(`Worker "${c.name}" removed from roster.`);
                                  }
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg text-xs cursor-pointer transition-colors"
                                title="Remove worker"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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
        {/* TAB: ACCOUNT & OPERATIONS SETTINGS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'account-settings' && (
          <div className="space-y-6 max-w-5xl">
            {/* Header banner with Avatar Uploader */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Interactive Avatar Container */}
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20 overflow-hidden border-2 border-amber-500/40">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(profileName)}</span>
                    )}
                  </div>
                  
                  {/* Camera Quick Action Badge */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Change Avatar Photo"
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border border-amber-500/60 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-md cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hidden File Input for Avatar */}
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{profileName}</h2>
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                      EXECUTIVE ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {profileTitle} • {profileDivision}
                  </p>
                  
                  {/* Avatar Upload & Remove Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{avatarUrl ? 'Change Avatar' : 'Upload Avatar'}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors bg-red-950/40 hover:bg-red-950/70 px-2.5 py-1 rounded-lg border border-red-800/40"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => persistSettingsToStorageAndDb()}
                  disabled={isSavingProfile}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving All...' : 'Save All Changes'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Profile Form & Security */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Operations Profile */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <UserCog className="w-4 h-4 text-amber-400" />
                      <span>Operations Manager Profile</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">USER ID: OPS-001</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Official Job Title</label>
                      <input
                        type="text"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Official Email Address</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Direct Contact Number</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-semibold mb-1">Department / Division</label>
                      <input
                        type="text"
                        value={profileDivision}
                        onChange={(e) => setProfileDivision(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <p className="text-[11px] text-slate-500">
                      Profile changes are persisted directly to PostgreSQL and cached locally.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveProfileToDb}
                      disabled={isSavingProfile}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Security & Passkey */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Security & Passkey Credentials</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400">ACCOUNT:</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                        {(session && typeof session === 'object' && session.email) || profileEmail}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        POSTGRESQL SYNCED
                      </span>
                    </div>
                  </div>

                  {/* Inline Error Alert */}
                  {passError && (
                    <div className="p-3 bg-red-950/60 border border-red-500/60 rounded-xl text-xs text-red-200 flex items-center gap-2.5 animate-fadeIn">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="font-medium">{passError}</span>
                    </div>
                  )}

                  {/* Inline Success Alert */}
                  {passSuccess && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">{passSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Current Passkey</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={currentPass}
                          onChange={(e) => { setCurrentPass(e.target.value); setPassError(null); }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Default initial: <code className="text-amber-400/80">admin123</code></p>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">New Passkey</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={newPass}
                          onChange={(e) => { setNewPass(e.target.value); setPassError(null); }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">At least 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Confirm New Passkey</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          placeholder="Confirm passkey"
                          value={confirmPass}
                          onChange={(e) => { setConfirmPass(e.target.value); setPassError(null); }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Must match new passkey</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-slate-500">
                      Changes are hashed using <code className="text-amber-400/80">scrypt</code> and written directly to your live PostgreSQL database record.
                    </p>
                    <button
                      type="button"
                      onClick={handleUpdatePasskey}
                      disabled={isUpdatingPass}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isUpdatingPass ? 'Updating in Database...' : 'Update & Sync Passkey'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Project Management Workspace Preferences */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>PMS Workspace Preferences</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">GLOBAL CONFIG</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Default View Upon Sign-In</label>
                      <select
                        value={defaultPmsView}
                        onChange={(e) => setDefaultPmsView(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="dashboard">Operations Dashboard</option>
                        <option value="gantt">Gantt Milestone Schedule</option>
                        <option value="gis-scanner">Project Map</option>
                        <option value="site-diary">Weather Report</option>
                        <option value="documents">Document Management</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Session Inactivity Timeout</label>
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="2h">2 Hours (Strict)</option>
                        <option value="4h">4 Hours</option>
                        <option value="8h">8 Hours (Standard Shift)</option>
                        <option value="24h">24 Hours (Extended)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Automatically persisted to workspace profile
                    </span>
                    <button
                      type="button"
                      onClick={() => persistSettingsToStorageAndDb()}
                      disabled={isSavingProfile}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Company Credentials & Notification Triggers */}
              <div className="space-y-6">
                
                {/* CTVill Company Accreditation */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>CTVill Enterprise Profile</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Company Name</span>
                      <span className="text-white font-bold block mt-0.5">CTVill Design & Construction</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Laguna Headquarters</span>
                      <span className="text-slate-300 block mt-0.5 text-[11px] leading-relaxed">
                        Centennial Plaza Bldg., Brgy. Pulo, Cabuyao, Laguna 4025
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Licensing & Accreditations</span>
                      <div className="mt-1 space-y-1">
                        <span className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold mr-1 mb-1">
                          PCAB Category AAA (#94821)
                        </span>
                        <span className="inline-block bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold mr-1 mb-1">
                          PEZA Accredited Fit-Out
                        </span>
                        <span className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          MACEA Certified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-Time Automated Alerts */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Operational Alert Triggers</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400">REAL-TIME</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <div>
                        <div className="font-bold text-white text-[11px]">Gantt Milestone Slippages</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Alert if critical path tasks slip &gt; 2 days</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setAlertGantt(!alertGantt)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${alertGantt ? 'bg-amber-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alertGantt ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <div>
                        <div className="font-bold text-white text-[11px]">QA Punch-List Escalations</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Immediate push for CRITICAL defect tickets</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setAlertPunchlist(!alertPunchlist)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${alertPunchlist ? 'bg-amber-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alertPunchlist ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <div>
                        <div className="font-bold text-white text-[11px]">17:00 Daily Site Diary Prompt</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Notify field engineers if diary is unfiled</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setAlertSiteDiary(!alertSiteDiary)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${alertSiteDiary ? 'bg-amber-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alertSiteDiary ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <div>
                        <div className="font-bold text-white text-[11px]">Contractor Manpower Discrepancies</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Warn if actual crew is &gt; 15% below planned</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setAlertManpower(!alertManpower)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${alertManpower ? 'bg-amber-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alertManpower ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* ============================================================= */}
      {/* GLOBAL VIEWPORT-CENTERED MODALS LAYER (Z-INDEX 99999) */}
      {/* ============================================================= */}

      {/* 1. Lot Lifecycle Stage Advance Modal */}
      {typeof document !== 'undefined' && transitioningSlot && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => setTransitioningSlot(null)}
          />
          <div 
            className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 p-5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Transition Stage for {transitioningSlot.id}</h3>
                <p className="text-xs text-slate-400 font-mono">Current Status: {transitioningSlot.status}</p>
              </div>
              <button 
                type="button"
                onClick={() => setTransitioningSlot(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs font-sans">
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

            <div className="shrink-0 flex gap-3 p-4 border-t border-slate-800 bg-slate-950/80">
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
        </div>,
        document.body
      )}

      {/* 2. Site Defect Ticket Modal */}
      {typeof document !== 'undefined' && showDefectModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowDefectModal(false)}
          />
          <div 
            className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 p-5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                Log Site Punch-List Defect
              </h3>
              <button 
                type="button"
                onClick={() => setShowDefectModal(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs font-sans">
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

            <div className="shrink-0 flex gap-3 p-4 border-t border-slate-800 bg-slate-950/80">
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
        </div>,
        document.body
      )}

      {/* 3. Manual Manpower & Sector Labor Allocation Modal */}
      {/* CONTRACTOR / IN-HOUSE WORKER REGISTRATION MODAL */}
      {typeof document !== 'undefined' && isContractorModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsContractorModalOpen(false)} 
          />
          <div 
            className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            {/* Header */}
            <div className="shrink-0 flex justify-between items-start border-b border-slate-800 p-5 pb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">CTVILL WORKFORCE REGISTRY</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <HardHat className="w-4 h-4 text-emerald-400" />
                  Register Worker / Staff
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Register internal CTVill staff across company departments, or optionally add outsourced contractor partners.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsContractorModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-House vs Outsourced Switcher */}
            <div className="px-5 pt-4 pb-1">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setContEmploymentType('INTERNAL')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    contEmploymentType === 'INTERNAL'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>CTVill In-House (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContEmploymentType('OUTSOURCED')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    contEmploymentType === 'OUTSOURCED'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Outsourced Contractor</span>
                </button>
              </div>
            </div>

            <form id="contractorForm" onSubmit={handleRegisterContractorSubmit} className="flex-1 overflow-y-auto p-5 pt-3 space-y-3.5 text-xs font-sans">
              {contEmploymentType === 'INTERNAL' ? (
                <>
                  {/* Department & Role Dynamic Selectors */}
                  <div className="bg-slate-900/90 border border-emerald-600/30 rounded-xl p-3.5 space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider mb-1">
                        🏢 CTVill Department *
                      </label>
                      <select
                        value={contDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value as CTVillDepartment)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {ALL_CTVILL_DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider mb-1">
                        👔 Company Role Title *
                      </label>
                      <select
                        value={contRoleTitle}
                        onChange={(e) => handleRoleChange(e.target.value as CTVillRole)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {getRolesForDepartment(contDepartment).map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Worker Name */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Staff / Worker Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contName}
                      onChange={(e) => setContName(e.target.value)}
                      placeholder="e.g. Engr. Marco Bautista / Danilo R. Santos"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Compensation Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Daily Wage Rate (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={contDailyRate}
                        onChange={(e) => {
                          const r = Number(e.target.value);
                          setContDailyRate(r);
                          setContMonthlySalary(r * 22);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">Used in payroll wage calculations</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Est. Monthly Salary (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={contMonthlySalary}
                        onChange={(e) => {
                          const m = Number(e.target.value);
                          setContMonthlySalary(m);
                          if (m > 0) setContDailyRate(Math.round(m / 22));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">Based on 22 working days</span>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Contact Number / Mobile (Optional)
                    </label>
                    <input
                      type="text"
                      value={contContact}
                      onChange={(e) => setContContact(e.target.value)}
                      placeholder="e.g. +63 917 555 0192"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Outsourced Contractor Partner Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Contractor Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contComp}
                        onChange={(e) => setContComp(e.target.value)}
                        placeholder="e.g. Apex Earthworks & Civils Corp."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Contact Person / Lead *
                      </label>
                      <input
                        type="text"
                        required
                        value={contName}
                        onChange={(e) => setContName(e.target.value)}
                        placeholder="e.g. Engr. Arthur Velasco"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Trade / Specialty */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Trade / Specialty
                    </label>
                    <select
                      value={contSpec}
                      onChange={(e) => setContSpec(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option>General Contractor</option>
                      <option>Carpentry &amp; Millwork</option>
                      <option>Electrical Works</option>
                      <option>Plumbing &amp; Sanitary</option>
                      <option>HVAC &amp; Mechanical</option>
                      <option>Painting &amp; Finishing</option>
                      <option>Tiling &amp; Flooring</option>
                      <option>Steel &amp; Structural</option>
                      <option>Civil &amp; Concrete</option>
                      <option>Land Leveling &amp; Grading</option>
                      <option>Road Construction</option>
                      <option>Manpower Supply</option>
                      <option>Interior Design &amp; Fit-Out</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Headcount & Contract Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Active Crew Headcount
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={contManpower}
                        onChange={(e) => setContManpower(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                        Contract Amount (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={contAmt}
                        onChange={(e) => setContAmt(Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </form>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-800 p-4 flex justify-end gap-2 bg-slate-950/80">
              <button 
                type="button" 
                onClick={() => setIsContractorModalOpen(false)} 
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="contractorForm" 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Save to CTVill Database</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4. Manual Sector Labor Allocation Modal */}
      {typeof document !== 'undefined' && isAllocationModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsAllocationModalOpen(false)}
          />
          <div 
            className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex justify-between items-start border-b border-slate-800 p-5 pb-4">
              <div>
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                  {editingAllocationId ? 'MODIFY SECTOR ALLOCATION' : 'NEW WORKFORCE DISPATCH'}
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                  {editingAllocationId ? 'Edit Sector Manpower Allocation' : 'Manual Sector Labor Allocation'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAllocationModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form id="allocationForm" onSubmit={handleSaveAllocationSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Target Sector / Zone *
                  </label>
                  <select
                    value={allocSectorName}
                    onChange={(e) => setAllocSectorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  >
                    <option value="Sector A (North Crest Hillside)">Sector A - Prime Ridge View (Lots 1-5)</option>
                    <option value="Sector B (Valley View Terraces)">Sector B - Valley View Terraces (Lots 6-11)</option>
                    <option value="Sector C (Lake Panorama)">Sector C - Lake Panorama (Lots 12-16)</option>
                    <option value="Main Spine Road & Storm Drain">Main Access - 8m Spine Road &amp; Storm Drain</option>
                    <option value="Gatehouse & Guard Post">Gatehouse - Security Barrier &amp; Perimeter</option>
                    <option value="Utilities Infrastructure">Utilities - Water Reservoir &amp; Power Grid</option>
                    <option value="Community Park & Amenities">Amenity - Nature Trail &amp; Clubhouse Lot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Target Lots / Station
                  </label>
                  <input
                    type="text"
                    value={allocTargetLots}
                    onChange={(e) => setAllocTargetLots(e.target.value)}
                    placeholder="e.g. Lots 01 - 06, STA 0+240"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* 2. Contractor and Headcount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Contractor / Workforce Firm *
                    </label>
                    <button
                      type="button"
                      onClick={() => { setIsAllocationModalOpen(false); setIsContractorModalOpen(true); }}
                      className="underline text-emerald-400 text-[10px] font-mono cursor-pointer font-bold"
                    >
                      + Register New Worker
                    </button>
                  </div>
                  {contractors.length > 0 ? (
                    <select
                      value={allocContractorId}
                      onChange={(e) => {
                        setAllocContractorId(e.target.value);
                        const c = contractors.find(item => item.id === e.target.value);
                        if (c) {
                          setAllocContractorNameFreeText(c.name);
                          if (c.roleTitle || c.specialty) {
                            setAllocWorkScope(`${c.roleTitle || c.specialty} Operations`);
                          }
                          if (c.activeManpower && c.activeManpower > 1) {
                            setAllocHeadcount(c.activeManpower);
                          }
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                    >
                      <option value="">-- Choose Assigned Workforce / Contractor --</option>
                      <optgroup label="🏢 CTVill In-House Workforce">
                        {contractors.filter(c => c.employmentType !== 'OUTSOURCED').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.roleTitle || c.specialty}) • {c.department ? c.department.split('(')[0].trim() : 'CTVill'}
                          </option>
                        ))}
                      </optgroup>
                      {contractors.some(c => c.employmentType === 'OUTSOURCED') && (
                        <optgroup label="🤝 Outsourced Contractor Partners">
                          {contractors.filter(c => c.employmentType === 'OUTSOURCED').map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.company || c.name} ({c.specialty}) • {c.activeManpower} crew
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={allocContractorNameFreeText}
                      onChange={(e) => setAllocContractorNameFreeText(e.target.value)}
                      placeholder="Enter crew / contractor name (e.g. Taskforce Civils)..."
                      className="w-full bg-slate-900 border border-teal-600/60 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                    />
                  )}
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
                  Operations Notes &amp; Milestone Targets
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
            <div className="shrink-0 border-t border-slate-800 p-4 flex justify-end gap-2 bg-slate-950/80">
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
                <span>Save &amp; Transmit Directive to Field</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. Buyer Handover Activation Modal */}
      {typeof document !== 'undefined' && showHandoverModal && activeHandoverClient && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowHandoverModal(false)}
          />
          <div 
            className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
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
        </div>,
        document.body
      )}

      {/* 6. Onboard New Buyer Modal */}
      {typeof document !== 'undefined' && showClientModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowClientModal(false)}
          />
          <div 
            className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 p-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Onboard Buyer Profile</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Register buyer &amp; generate handover token</p>
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

            <form id="clientForm" onSubmit={handleRegisterClientSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs font-sans">
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
            </form>

            <div className="shrink-0 p-4 border-t border-slate-800 flex justify-end gap-2.5 bg-slate-950/80">
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="clientForm"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Register Buyer &amp; Issue Handover</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 7. Register New Land Parcel Modal */}
      {typeof document !== 'undefined' && isNewParcelModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer" 
            onClick={() => setIsNewParcelModalOpen(false)} 
          />
          <div 
            className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            <div className="shrink-0 flex items-center justify-between border-b border-slate-800 p-5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Acquire &amp; Register New Land Parcel
              </h3>
              <button 
                type="button"
                onClick={() => setIsNewParcelModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="parcelForm"
              onSubmit={(e) => {
                e.preventDefault();
                if (!parcelName.trim() || !parcelLoc.trim()) {
                  alert('Please enter parcel name and location.');
                  return;
                }
                const newId = `PARCEL-${Date.now().toString().slice(-4)}`;
                const newParcelObj = {
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
              className="flex-1 overflow-y-auto p-5 space-y-3 text-xs font-sans"
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
            </form>

            <div className="shrink-0 p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/80">
              <button
                type="button"
                onClick={() => setIsNewParcelModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="parcelForm"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                Save &amp; Acquire Parcel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
