/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LandParcel, Slot, Client, QALog, Contractor, PayrollRecord, 
  CompanyBudget, UserSession, PunchListDefect, CivilWorksMilestone, ProcessAuditLog, DailyManpowerAudit,
  LaborAllocation, AIManpowerRecommendation 
} from './types';
import { INITIAL_MANPOWER_AUDITS, INITIAL_LABOR_ALLOCATIONS, INITIAL_AI_RECOMMENDATIONS } from './data/mockData';
import LandingPage from './components/LandingPage';
import LoginPortal from './components/LoginPortal';
import AdminPortal from './components/AdminPortal';
import InspectorPortal from './components/InspectorPortal';
import ClientPortal from './components/ClientPortal';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  // --- DATABASE STATE MODULES ---
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [qaLogs, setQaLogs] = useState<QALog[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [budget, setBudget] = useState<CompanyBudget | null>(null);
  
  // Real Estate Operational Workflow Modules
  const [punchListDefects, setPunchListDefects] = useState<PunchListDefect[]>([]);
  const [civilWorksMilestones, setCivilWorksMilestones] = useState<CivilWorksMilestone[]>([]);
  const [auditLogs, setAuditLogs] = useState<ProcessAuditLog[]>([]);
  const [manpowerAudits, setManpowerAudits] = useState<DailyManpowerAudit[]>(INITIAL_MANPOWER_AUDITS);
  const [laborAllocations, setLaborAllocations] = useState<LaborAllocation[]>(INITIAL_LABOR_ALLOCATIONS);
  const [aiRecommendations, setAiRecommendations] = useState<AIManpowerRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);

  // Active Session context: 
  // null = Landing Page 
  // 'login' = Portal Authenticator Screen
  // UserSession = Active logged-in role Dashboard
  const [session, setSession] = useState<UserSession | 'login' | null>(null);
  const [urlInviteToken, setUrlInviteToken] = useState<string | null>(null);

  // Loading & Animation transition state
  const [loadingState, setLoadingState] = useState<{
    active: boolean;
    mode: 'login' | 'logout';
    pendingSession?: UserSession | null;
  }>({
    active: false,
    mode: 'login',
    pendingSession: null,
  });

  // --- URL TOKEN INSPECTOR & PERSISTENCE RESTORER ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('activateToken') || params.get('token');
      if (token) {
        setUrlInviteToken(token);
        setSession('login');
      } else {
        const saved = localStorage.getItem('xyz_pm_user_session') || localStorage.getItem('xyz_erp_user_session');
        if (saved) {
          try {
            setSession(JSON.parse(saved));
          } catch {
            localStorage.removeItem('xyz_pm_user_session');
            localStorage.removeItem('xyz_erp_user_session');
          }
        }
      }
    }
  }, []);

  // --- PERSISTENCE STATE SYNCHRONIZER (FETCH FROM DB) ---
  const reloadAllData = async () => {
    try {
      const res = await fetch('/api/all-data');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      setParcels(data.parcels || []);
      setSlots(data.slots || []);
      setClients(data.clients || []);
      setContractors(data.contractors || []);
      setQaLogs(data.qaLogs || []);
      setPunchListDefects(data.punchListDefects || []);
      setCivilWorksMilestones(data.civilWorksMilestones || []);
      setAuditLogs(data.auditLogs || []);
      setPayroll(data.payroll || []);
      setBudget(data.budget || null);
      if (data.manpowerAudits && data.manpowerAudits.length > 0) {
        setManpowerAudits(data.manpowerAudits);
      }
    } catch (err) {
      console.error('Failed to load data from database:', err);
    }
  };

  useEffect(() => {
    reloadAllData();
  }, []);

  // --- SESSION AUTH TRANSITIONS WITH ANIMATION ---
  const handleInitiateLogin = (targetSession: UserSession) => {
    localStorage.setItem('xyz_pm_user_session', JSON.stringify(targetSession));
    setLoadingState({
      active: true,
      mode: 'login',
      pendingSession: targetSession,
    });
  };

  const handleInitiateLogout = () => {
    localStorage.removeItem('xyz_pm_user_session');
    localStorage.removeItem('xyz_erp_user_session');
    const currentSession = typeof session === 'object' && session !== null ? session : null;
    setLoadingState({
      active: true,
      mode: 'logout',
      pendingSession: currentSession,
    });
  };

  // --- CHRONOLOGICAL DATA MUTATORS ---

  // 1. Add Land Parcel
  const handleAddParcel = async (parcel: LandParcel) => {
    try {
      const res = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parcel)
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error adding parcel:', err);
    }
  };

  // 2. Subdivide Lots
  const handleSubdivideParcel = async (parcelId: string, areaSqm: number, price: number, isReady: boolean) => {
    const startLotNumber = slots.length + 1;
    try {
      const res = await fetch('/api/slots/subdivide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelId, areaSqm, price, startLotNumber })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error subdividing parcel:', err);
    }
  };

  // 3. Register Buyer Profile
  const handleRegisterClient = async (client: Client) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error registering client:', err);
    }
  };

  // 4. Assign Client to Lot
  const handleAssignClient = async (slotId: string, clientId: string) => {
    try {
      const res = await fetch('/api/clients/assign-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, slotId })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error assigning client to slot:', err);
    }
  };

  // 5. Lot Lifecycle State Machine Transitions
  const handleTransitionSlotStatus = async (slotId: string, newStatus: string, notes?: string, clientId?: string | null) => {
    try {
      const res = await fetch('/api/slots/transition-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId,
          newStatus,
          notes,
          clientId,
          actorName: session && typeof session === 'object' ? session.name : 'Operations Head',
          actorRole: session && typeof session === 'object' ? session.role : 'Admin'
        })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error transitioning slot status:', err);
    }
  };

  // 6. Government Titling & Permitting Pipeline Step Manager
  const handleUpdateTitlePipeline = async (clientId: string, stepKey?: string, value?: boolean, tctNumber?: string, taxDecNumber?: string) => {
    try {
      const res = await fetch('/api/clients/update-title-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          stepKey,
          value,
          tctNumber,
          taxDecNumber,
          actorName: session && typeof session === 'object' ? session.name : 'Legal Officer'
        })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error updating titling pipeline:', err);
    }
  };

  // 7. Buyer KYC Document Verification
  const handleVerifyKyc = async (clientId: string, docKey: string, verified: boolean, notes?: string) => {
    try {
      const res = await fetch('/api/clients/verify-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          docKey,
          verified,
          notes,
          actorName: session && typeof session === 'object' ? session.name : 'Compliance Officer'
        })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error verifying buyer KYC:', err);
    }
  };

  // 8. Client Certificate of Lot Acceptance & Handover Sign-Off
  const handleSignAcceptance = async (clientId: string, clientName: string) => {
    try {
      const res = await fetch('/api/clients/sign-acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientName })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error signing acceptance:', err);
    }
  };

  // 9. Punch-List Defect Management
  const handleCreateDefect = async (defectData: {
    slotId: string;
    title: string;
    description: string;
    severity: string;
    category: string;
    contractorId?: string | null;
    targetDate?: string | null;
  }) => {
    try {
      const res = await fetch('/api/punch-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...defectData,
          inspectorId: session && typeof session === 'object' ? session.email : undefined,
        })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error creating defect ticket:', err);
    }
  };

  const handleUpdateDefect = async (id: string, updateData: {
    status?: string;
    resolutionNotes?: string;
    contractorId?: string | null;
  }) => {
    try {
      const res = await fetch(`/api/punch-lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateData,
          actorName: session && typeof session === 'object' ? session.name : 'Inspector',
          actorRole: session && typeof session === 'object' ? session.role : 'Inspector',
        })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error updating defect ticket:', err);
    }
  };

  // 10. Civil Works Engineering Milestone Sign-Off
  const handleUpdateCivilMilestone = async (milestoneId: string, currentPercentage: number, status: string, inspectorSignOff: boolean, remarks?: string) => {
    try {
      const res = await fetch('/api/civil-works/update-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          currentPercentage,
          status,
          inspectorSignOff,
          remarks,
          actorName: session && typeof session === 'object' ? session.name : 'Site Engineer'
        })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error updating civil works milestone:', err);
    }
  };

  // 11. Contractor Roster
  const handleRegisterContractor = async (contractor: Contractor) => {
    try {
      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractor)
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error registering contractor:', err);
    }
  };

  const handleUpdateContractors = async (updated: Contractor[]) => {
    try {
      const res = await fetch('/api/contractors/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractors: updated })
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error syncing contractors:', err);
    }
  };

  // 12. Weekly Progress QA Log
  const handleAddQALog = async (log: Omit<QALog, 'id' | 'date'>) => {
    try {
      const res = await fetch('/api/qa-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error adding QA log:', err);
    }
  };

  // 13. Payroll Records
  const handleAddPayroll = async (record: PayrollRecord) => {
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        await reloadAllData();
      }
    } catch (err) {
      console.error('Error adding payroll:', err);
    }
  };

  // 14. Daily Manpower Audit & Attendance
  const handleCreateManpowerAudit = async (auditData: any) => {
    try {
      const res = await fetch('/api/manpower-audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData)
      });
      if (res.ok) {
        await reloadAllData();
      } else {
        const newAudit: DailyManpowerAudit = {
          id: `AUD-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          contractorId: auditData.contractorId,
          contractorName: auditData.contractorName,
          specialty: auditData.specialty,
          shift: auditData.shift || 'Morning',
          claimedHeadcount: Number(auditData.claimedHeadcount || 0),
          verifiedHeadcount: Number(auditData.verifiedHeadcount || 0),
          discrepancy: Number(auditData.claimedHeadcount || 0) - Number(auditData.verifiedHeadcount || 0),
          assignedSectorOrLot: auditData.assignedSectorOrLot,
          supervisorName: auditData.supervisorName || 'Engr. Ricardo Gomez',
          gpsCoordinates: auditData.gpsCoordinates || '14.2612° N, 121.5124° E (Cavinti Highland Site)',
          verificationStatus: (Number(auditData.claimedHeadcount || 0) - Number(auditData.verifiedHeadcount || 0)) === 0 ? 'VERIFIED_MATCH' : 'DISCREPANCY_FLAGGED',
          photoEvidenceVerified: true,
          remarks: auditData.remarks || '',
          productivityIndex: Number(auditData.productivityIndex || 90)
        };
        setManpowerAudits(prev => [newAudit, ...prev]);
        setContractors(prev => prev.map(c => c.id === auditData.contractorId ? { ...c, activeManpower: Number(auditData.verifiedHeadcount) } : c));
      }
    } catch (err) {
      console.error('Error logging manpower audit:', err);
    }
  };

  // 15. Manual Labor Allocation Update
  const handleSaveAllocation = (alloc: LaborAllocation) => {
    setLaborAllocations(prev => {
      const exists = prev.some(a => a.id === alloc.id);
      if (exists) {
        return prev.map(a => a.id === alloc.id ? alloc : a);
      }
      return [...prev, alloc];
    });

    // Update contractor active manpower if matching
    setContractors(prev => prev.map(c => {
      if (c.id === alloc.contractorId) {
        return { ...c, activeManpower: alloc.assignedHeadcount };
      }
      return c;
    }));
  };

  // 16. Apply AI Labor Optimization Recommendation
  const handleApplyAIRecommendation = (recId: string) => {
    const rec = aiRecommendations.find(r => r.id === recId);
    if (!rec) return;

    // Apply allocation changes
    setLaborAllocations(prev => {
      const match = prev.find(a => a.sectorName === rec.targetSector || a.contractorId === rec.contractorId);
      if (match) {
        return prev.map(a => a.id === match.id ? {
          ...a,
          assignedHeadcount: rec.recommendedHeadcount,
          targetLots: rec.targetLots,
          workScope: rec.suggestedScope,
          notes: `Optimized via AI Assistant: ${rec.title}`,
          updatedAt: new Date().toISOString().split('T')[0]
        } : a);
      } else {
        const newAlloc: LaborAllocation = {
          id: `ALLOC-${Date.now()}`,
          contractorId: rec.contractorId,
          contractorName: rec.contractorName,
          sectorName: rec.targetSector,
          targetLots: rec.targetLots,
          assignedHeadcount: rec.recommendedHeadcount,
          workScope: rec.suggestedScope,
          status: 'ACTIVE',
          notes: `Optimized via AI Assistant: ${rec.title}`,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        return [...prev, newAlloc];
      }
    });

    // Mark AI recommendation as applied
    setAiRecommendations(prev => prev.map(r => r.id === recId ? { ...r, applied: true } : r));

    // Update contractor headcount
    setContractors(prev => prev.map(c => c.id === rec.contractorId ? { ...c, activeManpower: rec.recommendedHeadcount } : c));
  };

  // --- RENDERING ROUTER ---

  const renderActiveWorkspace = () => {
    if (session === null) {
      return <LandingPage onEnterPortal={() => setSession('login')} />;
    }

    if (session === 'login') {
      return (
        <LoginPortal 
          onLoginSuccess={(s) => handleInitiateLogin(s)} 
          onBackToLanding={() => setSession(null)} 
          initialInviteToken={urlInviteToken}
        />
      );
    }

    // Admin Portal
    if (session.role === 'Admin') {
      return (
        <div className="animate-fadeIn">
          <AdminPortal
            parcels={parcels}
            slots={slots}
            clients={clients}
            contractors={contractors}
            qaLogs={qaLogs}
            punchListDefects={punchListDefects}
            civilWorksMilestones={civilWorksMilestones}
            auditLogs={auditLogs}
            payroll={payroll}
            budget={budget || {
              initialCapital: 800000,
              landAcquisitionCost: 450000,
              subdevelopmentCostPaid: 92700,
              collectedInstallments: 35000,
              currentCashReserve: 292300,
              roadInfrastructureFee: 75000,
              nextHectareCost: 500000,
            }}
            manpowerAudits={manpowerAudits}
            laborAllocations={laborAllocations}
            aiRecommendations={aiRecommendations}
            onAddParcel={handleAddParcel}
            onSubdivideParcel={handleSubdivideParcel}
            onRegisterClient={handleRegisterClient}
            onAssignClient={handleAssignClient}
            onTransitionSlotStatus={handleTransitionSlotStatus}
            onUpdateTitlePipeline={handleUpdateTitlePipeline}
            onVerifyKyc={handleVerifyKyc}
            onCreateDefect={handleCreateDefect}
            onUpdateDefect={handleUpdateDefect}
            onUpdateCivilMilestone={handleUpdateCivilMilestone}
            onRegisterContractor={handleRegisterContractor}
            onUpdateContractors={handleUpdateContractors}
            onAddQALog={handleAddQALog}
            onAddPayroll={handleAddPayroll}
            onCreateManpowerAudit={handleCreateManpowerAudit}
            onSaveAllocation={handleSaveAllocation}
            onApplyAIRecommendation={handleApplyAIRecommendation}
            onLogout={handleInitiateLogout}
          />
        </div>
      );
    }

    // Inspector Portal
    if (session.role === 'Inspector') {
      return (
        <div className="animate-fadeIn">
          <InspectorPortal
            slots={slots}
            qaLogs={qaLogs}
            contractors={contractors}
            punchListDefects={punchListDefects}
            civilWorksMilestones={civilWorksMilestones}
            manpowerAudits={manpowerAudits}
            onAddQALog={handleAddQALog}
            onCreateDefect={handleCreateDefect}
            onUpdateDefect={handleUpdateDefect}
            onUpdateCivilMilestone={handleUpdateCivilMilestone}
            onCreateManpowerAudit={handleCreateManpowerAudit}
            onLogout={handleInitiateLogout}
          />
        </div>
      );
    }

    // Client Portal
    if (session.role === 'Client') {
      const activeClientInDb = clients.find(c => c.id === session.clientId || c.email === session.email) || clients[1] || clients[0];
      return (
        <div className="animate-fadeIn">
          <ClientPortal
            client={activeClientInDb}
            slots={slots}
            qaLogs={qaLogs}
            civilWorksMilestones={civilWorksMilestones}
            punchListDefects={punchListDefects.filter(d => d.slotId === activeClientInDb?.slotId)}
            onSignAcceptance={handleSignAcceptance}
            onLogout={handleInitiateLogout}
          />
        </div>
      );
    }

    return <LandingPage onEnterPortal={() => setSession('login')} />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden relative select-none bg-slate-950">
      
      {/* Fullscreen Animated Loading/Transition Layer */}
      {loadingState.active && (
        <LoadingScreen
          session={loadingState.pendingSession || null}
          mode={loadingState.mode}
          onComplete={() => {
            if (loadingState.mode === 'login' && loadingState.pendingSession) {
              setSession(loadingState.pendingSession);
            } else if (loadingState.mode === 'logout') {
              setSession(null);
            }
            setLoadingState({ active: false, mode: 'login', pendingSession: null });
          }}
        />
      )}

      <div className="flex-1 w-full">
        {renderActiveWorkspace()}
      </div>
    </div>
  );
}
