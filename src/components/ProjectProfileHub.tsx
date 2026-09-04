/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, Users, CheckCircle2, TrendingUp, DollarSign, Calendar, 
  Layers, Plus, ExternalLink, ShieldCheck, Clock, FileText, ArrowRight, 
  X, AlertCircle, Edit3, Trash2, Check, Sliders
} from 'lucide-react';
import { ProjectProfile, ProjectTask, Contractor } from '../types';

interface ProjectProfileHubProps {
  projects: ProjectProfile[];
  tasks: ProjectTask[];
  contractors: Contractor[];
  onSelectProject?: (project: ProjectProfile) => void;
  onUpdateProjectProgress?: (projectId: string, progress: number) => void;
  onCreateProject?: (project: Partial<ProjectProfile>) => Promise<void> | void;
  onUpdateProject?: (projectId: string, updates: Partial<ProjectProfile>) => Promise<void> | void;
  onDeleteProject?: (projectId: string) => Promise<void> | void;
}

export default function ProjectProfileHub({
  projects = [],
  tasks = [],
  contractors = [],
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}: ProjectProfileHubProps) {
  // Local state initialized strictly from live database projects
  const [localProjects, setLocalProjects] = useState<ProjectProfile[]>(projects || []);

  // Sync when parent projects prop updates from database
  React.useEffect(() => {
    setLocalProjects(projects || []);
  }, [projects]);

  const [selectedProject, setSelectedProject] = useState<ProjectProfile | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [activeTabInsideProfile, setActiveTabInsideProfile] = useState<'OVERVIEW' | 'TASKS' | 'MILESTONES' | 'WORKERS'>('OVERVIEW');

  // Form State for New / Edit
  const [formName, setFormName] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formBudget, setFormBudget] = useState(6000000);
  const [formCollected, setFormCollected] = useState(2500000);
  const [formProgress, setFormProgress] = useState(50);
  const [formStatus, setFormStatus] = useState<ProjectProfile['status']>('IN_PROGRESS');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [formWorkers, setFormWorkers] = useState(15);
  const [formTasksCount, setFormTasksCount] = useState(20);
  const [formMilestonesCount, setFormMilestonesCount] = useState(5);

  const filteredProjects = localProjects.filter(p => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  const totalPortfolioBudget = localProjects.reduce((acc, p) => acc + p.budget, 0);
  const totalFundsCollected = localProjects.reduce((acc, p) => acc + p.fundsCollected, 0);
  const avgPortfolioProgress = Math.round(
    localProjects.reduce((acc, p) => acc + p.progressPercentage, 0) / (localProjects.length || 1)
  );
  const totalSiteManpower = localProjects.reduce((acc, p) => acc + (p.assignedWorkersCount || 0), 0);

  const openNewModal = () => {
    setFormName('');
    setFormClient('');
    setFormDescription('');
    setFormLocation('');
    setFormBudget(5000000);
    setFormCollected(1500000);
    setFormProgress(25);
    setFormStatus('IN_PROGRESS');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('2026-12-31');
    setFormWorkers(12);
    setFormTasksCount(15);
    setFormMilestonesCount(4);
    setShowNewModal(true);
  };

  const openEditModal = (p: ProjectProfile) => {
    setFormName(p.name);
    setFormClient(p.clientName);
    setFormDescription(p.description);
    setFormLocation(p.location);
    setFormBudget(p.budget);
    setFormCollected(p.fundsCollected);
    setFormProgress(p.progressPercentage);
    setFormStatus(p.status);
    setFormStartDate(p.startDate);
    setFormEndDate(p.targetHandoverDate);
    setFormWorkers(p.assignedWorkersCount);
    setFormTasksCount(p.tasksCount);
    setFormMilestonesCount(p.milestonesCount);
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newProj: ProjectProfile = {
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      clientName: formClient.trim() || 'Commercial Fit-Out Client',
      description: formDescription.trim() || 'Commercial interior design & build project.',
      location: formLocation.trim() || 'Cabuyao, Laguna',
      budget: Number(formBudget),
      fundsCollected: Number(formCollected),
      progressPercentage: Number(formProgress),
      status: formStatus,
      targetHandoverDate: formEndDate,
      startDate: formStartDate,
      assignedWorkersCount: Number(formWorkers),
      assignedContractorIds: [],
      tasksCount: Number(formTasksCount),
      milestonesCount: Number(formMilestonesCount)
    };

    setLocalProjects(prev => [...prev, newProj]);

    if (onCreateProject) {
      await onCreateProject(newProj);
    } else {
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      }).catch(console.error);
    }

    setShowNewModal(false);
    setSelectedProject(newProj);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const updated: ProjectProfile = {
      ...selectedProject,
      name: formName.trim(),
      clientName: formClient.trim(),
      description: formDescription.trim(),
      location: formLocation.trim(),
      budget: Number(formBudget),
      fundsCollected: Number(formCollected),
      progressPercentage: Number(formProgress),
      status: formStatus,
      targetHandoverDate: formEndDate,
      startDate: formStartDate,
      assignedWorkersCount: Number(formWorkers),
      tasksCount: Number(formTasksCount),
      milestonesCount: Number(formMilestonesCount)
    };

    setLocalProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);

    if (onUpdateProject) {
      await onUpdateProject(updated.id, updated);
    } else {
      fetch(`/api/projects/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(console.error);
    }

    setShowEditModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project profile?')) return;
    setLocalProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);

    if (onDeleteProject) {
      await onDeleteProject(id);
    } else {
      fetch(`/api/projects/${id}`, { method: 'DELETE' }).catch(console.error);
    }
  };

  const handleQuickProgressUpdate = async (id: string, newProgress: number) => {
    const clamped = Math.max(0, Math.min(100, newProgress));
    setLocalProjects(prev => prev.map(p => p.id === id ? { ...p, progressPercentage: clamped } : p));
    if (selectedProject?.id === id) {
      setSelectedProject(prev => prev ? { ...prev, progressPercentage: clamped } : null);
    }

    fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPercentage: clamped })
    }).catch(console.error);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold tracking-wider uppercase">
              Operational Command Hub
            </span>
            <span className="text-xs text-slate-400">Enterprise Fit-Out Portfolio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-amber-400" />
            Projects Profile Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Central hub for project-specific tracking: budget vs. collected funds, live progress %, assigned workers, tasks, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Project Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PUNCHLIST_QA">Punchlist & QA</option>
            <option value="PLANNING">Planning Phase</option>
            <option value="HANDED_OVER">Handed Over</option>
          </select>

          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Project Profile
          </button>
        </div>
      </div>

      {/* Portfolio Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Contract Value</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            ₱{totalPortfolioBudget.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {localProjects.length} active fit-out sites
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Funds Collected</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            ₱{totalFundsCollected.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {totalPortfolioBudget > 0 ? Math.round((totalFundsCollected / totalPortfolioBudget) * 100) : 0}% portfolio collection rate
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Average Progress</span>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2 font-mono">
            {avgPortfolioProgress}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${avgPortfolioProgress}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Deployed Workers</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {totalSiteManpower} Artisans
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Carpenters, Electricians, HVAC & QA
          </div>
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            There are currently no projects matching your filter in the database. Create a new commercial project profile to get started.
          </p>
          <button
            onClick={openNewModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            Create Project Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
          const collectionRate = project.budget > 0 ? Math.round((project.fundsCollected / project.budget) * 100) : 0;
          const remainingFunds = Math.max(0, project.budget - project.fundsCollected);

          return (
            <div
              key={project.id}
              className="group bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition" />

              <div>
                {/* Status Badge & Code & Quick Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {project.id}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      project.status === 'COMPLETED' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                      project.status === 'PUNCHLIST_QA' ? 'bg-purple-950/80 text-purple-300 border-purple-800' :
                      project.status === 'PLANNING' ? 'bg-blue-950/80 text-blue-300 border-blue-800' :
                      'bg-amber-950/80 text-amber-300 border-amber-800'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                        openEditModal(project);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
                      title="Edit Project Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Project Title & Client */}
                <h3 
                  onClick={() => setSelectedProject(project)}
                  className="text-xl font-bold text-white group-hover:text-amber-300 transition cursor-pointer"
                >
                  {project.name}
                </h3>
                <p className="text-xs text-amber-400 font-medium mt-0.5">
                  {project.clientName}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="truncate">{project.location}</span>
                </div>

                {/* Progress Bar with Quick Interactive Slider */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Execution Progress</span>
                    <span className="text-amber-400 font-bold">{project.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${project.progressPercentage}%` }}
                    />
                  </div>
                  {/* Interactive Quick Slider */}
                  <div className="flex items-center gap-2 pt-1">
                    <Sliders className="w-3 h-3 text-slate-500" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={project.progressPercentage}
                      onChange={(e) => handleQuickProgressUpdate(project.id, Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>

                {/* Financial Health Split */}
                <div className="grid grid-cols-2 gap-3 mt-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Contract Budget</span>
                    <span className="text-sm font-bold text-white font-mono">₱{project.budget.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Funds Collected</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">₱{project.fundsCollected.toLocaleString()} ({collectionRate}%)</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Metrics */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-mono">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    {project.assignedWorkersCount} Workers
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    {project.tasksCount} Tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    {project.milestonesCount} Milestones
                  </span>
                </div>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center gap-1 text-amber-400 font-medium hover:translate-x-1 transition-transform cursor-pointer"
                >
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Detailed Project Profile Modal */}
      {selectedProject && !showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                    {selectedProject.id}
                  </span>
                  <span className="text-xs text-slate-400">Commercial Fit-Out Profile</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                <p className="text-sm text-amber-400 font-medium">{selectedProject.clientName}</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {selectedProject.location}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedProject)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedProject.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    selectedProject.status === 'PUNCHLIST_QA' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                    'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {selectedProject.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Target Handover: {selectedProject.targetHandoverDate}
                </span>
              </div>
            </div>

            {/* Scope & Description */}
            <div className="mt-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Fit-Out Scope & Architectural Brief</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedProject.description}</p>
            </div>

            {/* Financial Status Breakdown */}
            <div className="mt-6">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Financial Transparency & Installment Billing
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono uppercase">Total Contract Value</span>
                  <div className="text-xl font-bold text-white font-mono mt-1">₱{selectedProject.budget.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500">Fixed Turnkey BOQ</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono uppercase">Funds Collected</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-1">₱{selectedProject.fundsCollected.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-500/80">
                    {selectedProject.budget > 0 ? Math.round((selectedProject.fundsCollected / selectedProject.budget) * 100) : 0}% collected to date
                  </span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono uppercase">Outstanding Balance</span>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                    ₱{Math.max(0, selectedProject.budget - selectedProject.fundsCollected).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-amber-500/80">Progress billing installment schedule</span>
                </div>
              </div>
            </div>

            {/* Execution Progress Bar + Live Interactive Slider */}
            <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">Overall Site Progress</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{selectedProject.progressPercentage}% Complete</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${selectedProject.progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-slate-400 font-mono">Adjust Progress:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedProject.progressPercentage}
                  onChange={(e) => handleQuickProgressUpdate(selectedProject.id, Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-mono text-amber-400 font-bold w-12 text-right">
                  {selectedProject.progressPercentage}%
                </span>
              </div>
            </div>

            {/* Milestones Roadmap */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Fit-Out Milestones & Deliverable Gates ({selectedProject.milestonesCount} Phases)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { title: '1. Demolition & MEP Roughing', pct: 100, done: true },
                  { title: '2. Framing & Acoustic Walls', pct: selectedProject.progressPercentage >= 60 ? 100 : selectedProject.progressPercentage, done: selectedProject.progressPercentage >= 60 },
                  { title: '3. Millwork & Finishes', pct: selectedProject.progressPercentage >= 85 ? 100 : Math.max(0, (selectedProject.progressPercentage - 50) * 2), done: selectedProject.progressPercentage >= 85 },
                  { title: '4. Testing & QA Punch-List', pct: selectedProject.progressPercentage >= 95 ? 100 : 0, done: selectedProject.progressPercentage >= 95 },
                ].map((m, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{m.title}</span>
                        {m.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${m.done ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-2">
                      {m.done ? 'Completed' : `${m.pct}% in progress`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Workforce */}
            <div className="mt-6">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Allocated Field Manpower ({selectedProject.assignedWorkersCount} Active Workers)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {contractors.slice(0, 3).map((c, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{c.company || c.name}</div>
                      <div className="text-[10px] text-amber-400">{c.specialty}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded">
                      {c.activeManpower || 6} Pax
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Close / Action Footer */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleDelete(selectedProject.id)}
                className="px-4 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-medium transition"
              >
                Delete Project
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => openEditModal(selectedProject)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
                >
                  Edit Parameters
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Create Commercial Project Profile</h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summit Tower Executive Suites"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Client / Corporate Account</label>
                <input
                  type="text"
                  placeholder="e.g., Summit Holdings Philippines"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Site Location</label>
                <input
                  type="text"
                  placeholder="e.g., 9th Floor, Laguna Technopark Tower"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Total Budget (₱)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Funds Collected (₱)</label>
                  <input
                    type="number"
                    value={formCollected}
                    onChange={(e) => setFormCollected(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Assigned Workers</label>
                  <input
                    type="number"
                    min={1}
                    value={formWorkers}
                    onChange={(e) => setFormWorkers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectProfile['status'])}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PUNCHLIST_QA">Punchlist & QA</option>
                    <option value="HANDED_OVER">Handed Over</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Target Handover Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Scope & Description</label>
                <textarea
                  rows={2}
                  placeholder="Architectural scope, design tier, finish requirements..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save Project Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Edit Profile: {selectedProject.name}</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Client / Corporate Account</label>
                <input
                  type="text"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Site Location</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Total Budget (₱)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Funds Collected (₱)</label>
                  <input
                    type="number"
                    value={formCollected}
                    onChange={(e) => setFormCollected(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Workers Count</label>
                  <input
                    type="number"
                    min={1}
                    value={formWorkers}
                    onChange={(e) => setFormWorkers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProjectProfile['status'])}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PUNCHLIST_QA">Punchlist & QA</option>
                    <option value="HANDED_OVER">Handed Over</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Scope & Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
