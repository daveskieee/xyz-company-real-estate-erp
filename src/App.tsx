/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LandParcel, Slot, Client, QALog, Contractor, PayrollRecord, 
  CompanyBudget, UserSession, PunchListDefect, CivilWorksMilestone, ProcessAuditLog, DailyManpowerAudit,
  LaborAllocation, AIManpowerRecommendation, ProjectTask, DailySiteLog, ProjectDocument, ProjectRisk,
  ChangeOrder, CADParsedLot, TaskStatus
} from './types';
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
  const [manpowerAudits, setManpowerAudits] = useState<DailyManpowerAudit[]>([]);
  const [laborAllocations, setLaborAllocations] = useState<LaborAllocation[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIManpowerRecommendation[]>([]);

  // Project Management System (PMS) Modules
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [siteLogs, setSiteLogs] = useState<DailySiteLog[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);

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

  // SSE reconnect ref
  const sseRef = useRef<EventSource | null>(null);
  const sseReconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ============================================================================
  // GRANULAR FETCH HELPERS — fetch only the changed entity slice
  // Much faster than reloadAllData() which queries every table.
  // ============================================================================

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) setClients(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/slots');
      if (res.ok) setSlots(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchPunchLists = useCallback(async () => {
    try {
      const res = await fetch('/api/punch-lists');
      if (res.ok) setPunchListDefects(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchCivilMilestones = useCallback(async () => {
    try {
      const res = await fetch('/api/civil-milestones');
      if (res.ok) setCivilWorksMilestones(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) setAuditLogs(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchPayroll = useCallback(async () => {
    try {
      const res = await fetch('/api/payroll-records');
      if (res.ok) setPayroll(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks-list');
      if (res.ok) setTasks(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchContractors = useCallback(async () => {
    try {
      const res = await fetch('/api/contractors-list');
      if (res.ok) setContractors(await res.json());
    } catch { /* silent */ }
  }, []);

  // --- PERSISTENCE STATE SYNCHRONIZER (FETCH FROM DB) ---
  // Used for initial page load only. After that, SSE + granular fetches handle updates.
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
      setTasks(data.tasks || []);
      setSiteLogs(data.siteLogs || []);
      setDocuments(data.documents || []);
      setRisks(data.risks || []);
      setChangeOrders(data.changeOrders || []);
    } catch (err) {
      console.error('Failed to load data from database:', err);
    }
  };

  // Initial load
  useEffect(() => {
    reloadAllData();
  }, []);

  // ============================================================================
  // SSE REAL-TIME SYNC ENGINE
  // Connects to /api/events and listens for data_changed push events from server.
  // On each push, only the affected entity slice is re-fetched (not everything).
  // Auto-reconnects if the connection drops.
  // ============================================================================

  const connectSSE = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
    }

    const es = new EventSource('/api/events');
    sseRef.current = es;

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type !== 'data_changed') return;

        // Route to the correct granular fetch based on the entity that changed
        switch (msg.entity) {
          case 'clients':    fetchClients(); break;
          case 'slots':      fetchSlots(); break;
          case 'punchLists': fetchPunchLists(); break;
          case 'civilMilestones': fetchCivilMilestones(); break;
          case 'auditLogs':  fetchAuditLogs(); break;
          case 'payroll':    fetchPayroll(); break;
          case 'tasks':      fetchTasks(); break;
          case 'contractors': fetchContractors(); break;
          case 'siteLogs':
            // Site logs not on a granular endpoint — just part of all-data, skip heavy reload
            break;
          case 'documents':
            // Documents not on a granular endpoint — skip
            break;
          case 'risks':
            // Risks not on a granular endpoint — skip
            break;
          case 'qaLogs':
            // QA logs not on a granular endpoint — skip
            break;
          case 'manpowerAudits':
            // Manpower audits not on a granular endpoint — skip
            break;
          default: break;
        }
      } catch { /* malformed message */ }
    };

    es.onerror = () => {
      es.close();
      sseRef.current = null;
      // Auto-reconnect after 3 seconds
      if (sseReconnectTimer.current) clearTimeout(sseReconnectTimer.current);
      sseReconnectTimer.current = setTimeout(connectSSE, 3000);
    };
  }, [fetchClients, fetchSlots, fetchPunchLists, fetchCivilMilestones, fetchAuditLogs, fetchPayroll, fetchTasks, fetchContractors]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (sseRef.current) sseRef.current.close();
      if (sseReconnectTimer.current) clearTimeout(sseReconnectTimer.current);
    };
  }, [connectSSE]);

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

  // --- CHRONOLOGICAL DATA MUTATORS (with Optimistic UI Updates) ---
  // Pattern: update state instantly → call API → reconcile with server data
  // If API fails, rollback to previous state.

  // 1. Add Land Parcel
  const handleAddParcel = async (parcel: LandParcel) => {
    // Optimistic: add immediately
    setParcels(prev => [...prev, parcel]);
    try {
      const res = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parcel)
      });
      if (!res.ok) {
        // Rollback
        setParcels(prev => prev.filter(p => p.id !== parcel.id));
      }
      // Server broadcasts → SSE handles the granular refetch
    } catch (err) {
      setParcels(prev => prev.filter(p => p.id !== parcel.id));
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
        const newSlots = await res.json();
        // Reconcile: merge new slots from server response (already have optimistic data)
        setSlots(prev => [...prev, ...newSlots.map((s: any) => ({
          id: s.id, parcelId: s.parcelId, slotNumber: s.slotNumber, areaSqm: s.sizeSqm,
          basePrice: Number(s.price), status: 'Available', row: s.row, col: s.col,
          polygonPoints: s.polygonPoints, blockName: s.blockName, assignedClientId: null,
        }))]);
      }
    } catch (err) {
      console.error('Error subdividing parcel:', err);
    }
  };

  // 3. Register Buyer Profile
  const handleRegisterClient = async (client: Client) => {
    // Optimistic: add immediately
    setClients(prev => [...prev, client]);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      if (res.ok) {
        const serverClient = await res.json();
        // Reconcile: replace optimistic entry with server's canonical version
        setClients(prev => prev.map(c => c.id === client.id ? serverClient : c));
      } else {
        setClients(prev => prev.filter(c => c.id !== client.id));
      }
    } catch (err) {
      setClients(prev => prev.filter(c => c.id !== client.id));
      console.error('Error registering client:', err);
    }
  };

  // 3.5. Delete Buyer Account
  const handleDeleteClient = async (clientId: string) => {
    // Optimistic: remove immediately
    const removedClient = clients.find(c => c.id === clientId);
    setClients(prev => prev.filter(c => c.id !== clientId));
    // Release slot optimistically
    if (removedClient?.slotId) {
      setSlots(prev => prev.map(s => s.id === removedClient.slotId ? { ...s, status: 'Available', assignedClientId: null } : s));
    }
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
      if (!res.ok && removedClient) {
        // Rollback
        setClients(prev => [...prev, removedClient]);
        if (removedClient.slotId) {
          setSlots(prev => prev.map(s => s.id === removedClient.slotId ? { ...s, status: 'Reserved', assignedClientId: clientId } : s));
        }
      }
    } catch (err) {
      if (removedClient) {
        setClients(prev => [...prev, removedClient]);
      }
      console.error('Error deleting client:', err);
    }
  };

  // 4. Assign Client to Lot
  const handleAssignClient = async (slotId: string, clientId: string) => {
    // Optimistic: update slot and client linkage
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, assignedClientId: clientId, status: 'Reserved' } : s));
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, slotId } : c));
    try {
      const res = await fetch('/api/clients/assign-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, slotId })
      });
      if (!res.ok) {
        // Rollback
        setSlots(prev => prev.map(s => s.id === slotId ? { ...s, assignedClientId: null } : s));
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, slotId: undefined } : c));
      }
    } catch (err) {
      console.error('Error assigning client to slot:', err);
    }
  };

  // 5. Lot Lifecycle State Machine Transitions
  const handleTransitionSlotStatus = async (slotId: string, newStatus: string, notes?: string, clientId?: string | null) => {
    // Optimistic: update slot status immediately
    const prevSlot = slots.find(s => s.id === slotId);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: newStatus as import('./types').SlotStatus } : s));
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
      if (!res.ok && prevSlot) {
        setSlots(prev => prev.map(s => s.id === slotId ? prevSlot : s));
      }
    } catch (err) {
      if (prevSlot) setSlots(prev => prev.map(s => s.id === slotId ? prevSlot : s));
      console.error('Error transitioning slot status:', err);
    }
  };

  // 6. Government Titling & Permitting Pipeline Step Manager
  const handleUpdateTitlePipeline = async (clientId: string, stepKey?: string, value?: boolean, tctNumber?: string, taxDecNumber?: string) => {
    // Optimistic: update client title milestones
    if (stepKey) {
      setClients(prev => prev.map(c => c.id === clientId ? {
        ...c,
        titleMilestones: c.titleMilestones ? { ...c.titleMilestones, [stepKey]: value } : c.titleMilestones
      } : c));
    }
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
        // Reconcile from server (currentPhase may have changed)
        fetchClients();
      } else {
        fetchClients(); // Revert by fetching real state
      }
    } catch (err) {
      fetchClients();
      console.error('Error updating titling pipeline:', err);
    }
  };

  // 7. Buyer KYC Document Verification
  const handleVerifyKyc = async (clientId: string, docKey: string, verified: boolean, notes?: string) => {
    // Optimistic: flip the KYC field immediately
    setClients(prev => prev.map(c => c.id === clientId ? {
      ...c,
      buyerKyc: c.buyerKyc ? { ...c.buyerKyc, [docKey]: verified } : c.buyerKyc
    } : c));
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
        const updatedKyc = await res.json();
        // Reconcile kycStatus from server (server computes allVerified)
        setClients(prev => prev.map(c => c.id === clientId ? {
          ...c,
          buyerKyc: updatedKyc
        } : c));
      } else {
        fetchClients(); // Revert
      }
    } catch (err) {
      fetchClients();
      console.error('Error verifying buyer KYC:', err);
    }
  };

  // 8. Client Certificate of Lot Acceptance & Handover Sign-Off
  const handleSignAcceptance = async (clientId: string, clientName: string) => {
    // Optimistic: advance slot to Handed Over
    const client = clients.find(c => c.id === clientId);
    if (client?.slotId) {
      setSlots(prev => prev.map(s => s.id === client.slotId ? { ...s, status: 'Handed Over' } : s));
    }
    try {
      const res = await fetch('/api/clients/sign-acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientName })
      });
      if (!res.ok) {
        fetchSlots(); // Revert
      }
    } catch (err) {
      fetchSlots();
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
    const optimisticDefect: PunchListDefect = {
      id: `DEFECT-OPT-${Date.now()}`,
      inspectorId: '',
      inspectorName: 'Site Monitor',
      contractorId: defectData.contractorId || null,
      contractorName: 'Unassigned Contractor',
      status: 'OPEN' as const,
      resolutionNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slotId: defectData.slotId,
      title: defectData.title,
      description: defectData.description,
      severity: defectData.severity as PunchListDefect['severity'],
      category: defectData.category as PunchListDefect['category'],
      targetDate: defectData.targetDate || null,
    };
    setPunchListDefects(prev => [optimisticDefect, ...prev]);
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
        const serverDefect = await res.json();
        // Reconcile: replace optimistic with server version
        setPunchListDefects(prev => prev.map(d => d.id === optimisticDefect.id ? serverDefect : d));
      } else {
        setPunchListDefects(prev => prev.filter(d => d.id !== optimisticDefect.id));
      }
    } catch (err) {
      setPunchListDefects(prev => prev.filter(d => d.id !== optimisticDefect.id));
      console.error('Error creating defect ticket:', err);
    }
  };

  const handleUpdateDefect = async (id: string, updateData: {
    status?: string;
    resolutionNotes?: string;
    contractorId?: string | null;
  }) => {
    // Optimistic: update immediately
    const prevDefect = punchListDefects.find(d => d.id === id);
    setPunchListDefects(prev => prev.map(d => d.id === id ? {
      ...d,
      ...(updateData.status ? { status: updateData.status as PunchListDefect['status'] } : {}),
      ...(updateData.resolutionNotes !== undefined ? { resolutionNotes: updateData.resolutionNotes } : {}),
      ...(updateData.contractorId !== undefined ? { contractorId: updateData.contractorId } : {}),
    } : d));
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
        const serverDefect = await res.json();
        setPunchListDefects(prev => prev.map(d => d.id === id ? serverDefect : d));
      } else if (prevDefect) {
        setPunchListDefects(prev => prev.map(d => d.id === id ? prevDefect : d));
      }
    } catch (err) {
      if (prevDefect) setPunchListDefects(prev => prev.map(d => d.id === id ? prevDefect : d));
      console.error('Error updating defect ticket:', err);
    }
  };

  // 10. Civil Works Engineering Milestone Sign-Off
  const handleUpdateCivilMilestone = async (milestoneId: string, currentPercentage: number, status: string, inspectorSignOff: boolean, remarks?: string) => {
    // Optimistic
    const prev = civilWorksMilestones.find(m => m.id === milestoneId);
    setCivilWorksMilestones(p => p.map(m => m.id === milestoneId ? {
      ...m,
      currentPercentage,
      status: status as CivilWorksMilestone['status'],
      inspectorSignOff,
      remarks: remarks || m.remarks,
    } : m));
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
        const updated = await res.json();
        setCivilWorksMilestones(p => p.map(m => m.id === milestoneId ? updated : m));
      } else if (prev) {
        setCivilWorksMilestones(p => p.map(m => m.id === milestoneId ? prev : m));
      }
    } catch (err) {
      if (prev) setCivilWorksMilestones(p => p.map(m => m.id === milestoneId ? prev : m));
      console.error('Error updating civil works milestone:', err);
    }
  };

  // 11. Contractor Roster
  const handleRegisterContractor = async (contractor: Contractor) => {
    setContractors(prev => [...prev, contractor]);
    try {
      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractor)
      });
      if (!res.ok) {
        setContractors(prev => prev.filter(c => c.id !== contractor.id));
      }
    } catch (err) {
      setContractors(prev => prev.filter(c => c.id !== contractor.id));
      console.error('Error registering contractor:', err);
    }
  };

  const handleUpdateContractors = async (updated: Contractor[]) => {
    // Optimistic
    const prevContractors = contractors;
    setContractors(updated);
    try {
      const res = await fetch('/api/contractors/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractors: updated })
      });
      if (!res.ok) {
        setContractors(prevContractors);
      }
    } catch (err) {
      setContractors(prevContractors);
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
        const newLog = await res.json();
        setQaLogs(prev => [newLog, ...prev]);
      }
    } catch (err) {
      console.error('Error adding QA log:', err);
    }
  };

  // 13. Payroll Records
  const handleAddPayroll = async (record: PayrollRecord) => {
    setPayroll(prev => [record, ...prev]);
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!res.ok) {
        setPayroll(prev => prev.filter(p => p.id !== record.id));
      }
    } catch (err) {
      setPayroll(prev => prev.filter(p => p.id !== record.id));
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
        const newAudit = await res.json();
        setManpowerAudits(prev => [newAudit, ...prev]);
        setContractors(prev => prev.map(c => c.id === auditData.contractorId ? { ...c, activeManpower: Number(auditData.verifiedHeadcount) } : c));
      } else {
        // Fallback: add locally
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

  // --- AUTOCAD & PMS SUITE HANDLERS ---
  const handleImportCADLots = async (lots: CADParsedLot[]) => {
    try {
      const res = await fetch('/api/slots/import-cad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelId: 'PARCEL-CST', lots }),
      });
      if (res.ok) {
        fetchSlots();
      }
    } catch (e) {
      console.error('Failed to import CAD lots:', e);
    }
  };

  const handleClearAllLots = async () => {
    // Optimistic: clear immediately
    const prevSlots = slots;
    setSlots([]);
    try {
      const res = await fetch('/api/slots/clear-all', { method: 'DELETE' });
      if (!res.ok) {
        setSlots(prevSlots);
      }
    } catch (e) {
      setSlots(prevSlots);
      console.error('Failed to clear lots:', e);
    }
  };

  const handleAddTask = async (taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [{ ...newTask, subtasks: newTask.subtasksJson ? JSON.parse(newTask.subtasksJson) : [], tags: newTask.tags ? newTask.tags.split(',') : [] }, ...prev]);
      }
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    // Optimistic: update immediately
    const prevTask = tasks.find(t => t.id === taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok && prevTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? prevTask : t));
      }
    } catch (e) {
      if (prevTask) setTasks(prev => prev.map(t => t.id === taskId ? prevTask : t));
      console.error('Failed to update task:', e);
    }
  };

  const handleAddSiteLog = async (logData: Omit<DailySiteLog, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/site-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        const newLog = await res.json();
        setSiteLogs(prev => [newLog, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save site log:', e);
    }
  };

  const handleAddDocument = async (docData: Omit<ProjectDocument, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [newDoc, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save document:', e);
    }
  };

  const handleAddRisk = async (riskData: Omit<ProjectRisk, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskData),
      });
      if (res.ok) {
        const newRisk = await res.json();
        setRisks(prev => [newRisk, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save risk:', e);
    }
  };

  const handleDeleteParcel = async (parcelId: string) => {
    const prevParcel = parcels.find(p => p.id === parcelId);
    setParcels(prev => prev.filter(p => p.id !== parcelId));
    try {
      const res = await fetch(`/api/parcels/${parcelId}`, { method: 'DELETE' });
      if (!res.ok && prevParcel) {
        setParcels(prev => [...prev, prevParcel]);
      }
    } catch (e) {
      if (prevParcel) setParcels(prev => [...prev, prevParcel]);
      console.error('Failed to delete parcel:', e);
    }
  };

  const handleApplyAIPricing = async (updates: { slotId: string; newBasePrice: number }[], targetMargin: number) => {
    // Optimistic: apply prices immediately
    setSlots(prev => prev.map(s => {
      const update = updates.find(u => u.slotId === s.id);
      return update ? { ...s, basePrice: update.newBasePrice } : s;
    }));
    try {
      const res = await fetch('/api/slots/apply-ai-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates,
          targetMargin,
          actorName: session && typeof session === 'object' ? session.name : 'Operations Lead',
          actorRole: 'ADMIN'
        })
      });
      if (!res.ok) {
        fetchSlots(); // Revert from server
      }
    } catch (e) {
      fetchSlots();
      console.error('Failed to apply AI pricing:', e);
    }
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
              initialCapital: 1000000,
              landAcquisitionCost: 0,
              subdevelopmentCostPaid: 0,
              collectedInstallments: 0,
              currentCashReserve: 1000000,
              roadInfrastructureFee: 0,
              nextHectareCost: 500000,
            }}
            manpowerAudits={manpowerAudits}
            laborAllocations={laborAllocations}
            aiRecommendations={aiRecommendations}
            tasks={tasks}
            siteLogs={siteLogs}
            documents={documents}
            risks={risks}
            changeOrders={changeOrders}
            onAddParcel={handleAddParcel}
            onDeleteParcel={handleDeleteParcel}
            onSubdivideParcel={handleSubdivideParcel}
            onRegisterClient={handleRegisterClient}
            onDeleteClient={handleDeleteClient}
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
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddSiteLog={handleAddSiteLog}
            onAddDocument={handleAddDocument}
            onAddRisk={handleAddRisk}
            onImportCADLots={handleImportCADLots}
            onClearAllLots={handleClearAllLots}
            onApplyAIPricing={handleApplyAIPricing}
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
