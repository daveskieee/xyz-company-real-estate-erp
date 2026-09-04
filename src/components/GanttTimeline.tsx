/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Clock, AlertCircle, Layers, 
  ChevronRight, BarChart3, Filter, Plus, Edit3, Trash2, 
  X, Check, Building2, Sliders, ArrowRight, GitBranch
} from 'lucide-react';
import { CivilWorksMilestone, ProjectTask } from '../types';

export interface GanttTaskItem {
  id: string;
  name: string;
  projectName: string;
  startWeek: number;
  durationWeeks: number;
  progress: number;
  dependencies?: string; // ID or name of prerequisite task
  contractor: string;
  category: 'CIVIL_WORKS' | 'MEPFS' | 'ARCHITECTURAL' | 'FINISHES' | 'QA_HANDOVER';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'CRITICAL_PATH';
}

interface GanttTimelineProps {
  milestones?: CivilWorksMilestone[];
  tasks?: ProjectTask[];
  onUpdateMilestoneProgress?: (milestoneId: string, progress: number) => void;
}

function mapProjectTasksToGantt(tasks: ProjectTask[]): GanttTaskItem[] {
  if (!tasks || tasks.length === 0) return [];
  return tasks.map((t, idx) => {
    const isCompleted = t.status === 'COMPLETED';
    const isInProgress = t.status === 'IN_PROGRESS';
    const durationWeeks = Math.max(1, Math.min(16, Math.round((t.estimatedHours || 120) / 40)));

    // Look for startWeek tag (e.g. "startWeek:3")
    const weekTag = (t.tags || []).find(tag => tag.startsWith('startWeek:'));
    const parsedWeek = weekTag ? parseInt(weekTag.split(':')[1], 10) : NaN;
    const startWeek = !isNaN(parsedWeek) ? Math.max(1, Math.min(16, parsedWeek)) : Math.max(1, (idx % 6) + 1);

    // Look for dependencies tag (e.g. "dep:Foundation Pouring")
    const depTag = (t.tags || []).find(tag => tag.startsWith('dep:'));
    const dependencyName = depTag 
      ? depTag.slice(4) 
      : (t.tags && t.tags.length > 0 ? t.tags.filter(tg => !tg.startsWith('startWeek:') && tg !== t.category).join(', ') : 'None');

    let progress = 0;
    if (t.actualHours !== undefined && t.actualHours !== null && !isNaN(t.actualHours)) {
      progress = Math.max(0, Math.min(100, Math.round(t.actualHours)));
    } else if (isCompleted) {
      progress = 100;
    } else if (t.subtasks && t.subtasks.length > 0) {
      const done = t.subtasks.filter(s => s.completed).length;
      progress = Math.round((done / t.subtasks.length) * 100);
    } else if (isInProgress) {
      progress = 50;
    }

    return {
      id: t.id,
      name: t.title,
      projectName: t.milestonePhase || 'NexBridge Software Hub',
      startWeek,
      durationWeeks,
      progress,
      dependencies: dependencyName || 'None',
      contractor: t.assigneeName || 'SolidFoundations Engineering',
      category: (['CIVIL_WORKS', 'MEPFS', 'ARCHITECTURAL', 'FINISHES', 'QA_HANDOVER'].includes(t.category || '')
        ? t.category
        : 'ARCHITECTURAL') as any,
      status: isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'NOT_STARTED'
    };
  });
}

export default function GanttTimeline({ milestones = [], tasks = [] }: GanttTimelineProps) {
  const [ganttTasks, setGanttTasks] = useState<GanttTaskItem[]>(() => mapProjectTasksToGantt(tasks));

  React.useEffect(() => {
    setGanttTasks(mapProjectTasksToGantt(tasks));
  }, [tasks]);

  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'WEEKS' | 'MONTHS'>('WEEKS');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<GanttTaskItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formProject, setFormProject] = useState('NexBridge Software Hub');
  const [formStartWeek, setFormStartWeek] = useState(1);
  const [formDuration, setFormDuration] = useState(3);
  const [formProgress, setFormProgress] = useState(0);
  const [formDependencies, setFormDependencies] = useState('None');
  const [formContractor, setFormContractor] = useState('SolidFoundations Engineering');
  const [formCategory, setFormCategory] = useState<GanttTaskItem['category']>('ARCHITECTURAL');

  const filteredTasks = ganttTasks.filter(t => {
    if (projectFilter === 'ALL') return true;
    return t.projectName.toLowerCase().includes(projectFilter.toLowerCase());
  });

  const totalWeeks = 16;
  const currentWeek = 4; // Current operational week

  const openAddModal = () => {
    setFormName('');
    setFormProject('NexBridge Software Hub');
    setFormStartWeek(currentWeek);
    setFormDuration(3);
    setFormProgress(0);
    setFormDependencies('None');
    setFormContractor('SolidFoundations Engineering');
    setFormCategory('ARCHITECTURAL');
    setEditingTask(null);
    setShowAddModal(true);
  };

  const openEditModal = (task: GanttTaskItem) => {
    setEditingTask(task);
    setFormName(task.name);
    setFormProject(task.projectName);
    setFormStartWeek(task.startWeek);
    setFormDuration(task.durationWeeks);
    setFormProgress(task.progress);
    setFormDependencies(task.dependencies || 'None');
    setFormContractor(task.contractor);
    setFormCategory(task.category);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingTask) {
      const updatedStatus = Number(formProgress) === 100 ? 'COMPLETED' : Number(formProgress) > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      const updated: GanttTaskItem = {
        ...editingTask,
        name: formName.trim(),
        projectName: formProject,
        startWeek: Number(formStartWeek),
        durationWeeks: Number(formDuration),
        progress: Number(formProgress),
        dependencies: formDependencies,
        contractor: formContractor,
        category: formCategory,
        status: updatedStatus
      };
      setGanttTasks(prev => prev.map(t => t.id === updated.id ? updated : t));

      fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updated.name,
          category: updated.category,
          milestonePhase: updated.projectName,
          assigneeName: updated.contractor,
          estimatedHours: updated.durationWeeks * 40,
          actualHours: updated.progress,
          status: updated.status === 'NOT_STARTED' ? 'TODO' : updated.status,
          tags: [updated.category, `startWeek:${updated.startWeek}`, `dep:${updated.dependencies}`],
          description: `Gantt task: ${updated.name} (Duration: ${updated.durationWeeks} wks)`
        })
      }).catch(console.error);
    } else {
      const tempId = `TSK-${Date.now().toString().slice(-4)}`;
      const newStatus = Number(formProgress) === 100 ? 'COMPLETED' : Number(formProgress) > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      const newTask: GanttTaskItem = {
        id: tempId,
        name: formName.trim(),
        projectName: formProject,
        startWeek: Number(formStartWeek),
        durationWeeks: Number(formDuration),
        progress: Number(formProgress),
        dependencies: formDependencies,
        contractor: formContractor,
        category: formCategory,
        status: newStatus
      };
      setGanttTasks(prev => [...prev, newTask]);

      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.name,
          category: newTask.category,
          milestonePhase: newTask.projectName,
          assigneeName: newTask.contractor,
          estimatedHours: newTask.durationWeeks * 40,
          actualHours: newTask.progress,
          status: newTask.status === 'NOT_STARTED' ? 'TODO' : newTask.status,
          tags: [newTask.category, `startWeek:${newTask.startWeek}`, `dep:${newTask.dependencies}`],
          description: `Gantt task: ${newTask.name} (Duration: ${newTask.durationWeeks} wks)`
        })
      })
      .then(r => r.json())
      .then(saved => {
        if (saved && saved.id) {
          setGanttTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: saved.id } : t));
        }
      })
      .catch(console.error);
    }

    setShowAddModal(false);
  };

  const handleDeleteTask = (id: string) => {
    setGanttTasks(prev => prev.filter(t => t.id !== id));
    fetch(`/api/tasks/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleQuickProgress = (id: string, newProgress: number) => {
    const p = Math.max(0, Math.min(100, newProgress));
    const newStatus = p === 100 ? 'COMPLETED' : p > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
    setGanttTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        progress: p,
        status: newStatus
      };
    }));

    const backendStatus = p === 100 ? 'COMPLETED' : p > 0 ? 'IN_PROGRESS' : 'TODO';
    fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: backendStatus,
        actualHours: p
      })
    }).catch(console.error);
  };

  const getCategoryBadge = (category: GanttTaskItem['category']) => {
    switch (category) {
      case 'CIVIL_WORKS': return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'MEPFS': return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'ARCHITECTURAL': return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'FINISHES': return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'QA_HANDOVER': return 'bg-rose-950/80 text-rose-300 border-rose-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold tracking-wider uppercase">
              Phase Timeline
            </span>
            <span className="text-xs text-slate-400">Critical Path & Overlapping Durations</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Interactive Gantt Schedule & Milestone Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual timeline of tasks, dependencies, durations, and interactive progress sliders per project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">All Commercial Projects</option>
              <option value="NexBridge">NexBridge Software Hub</option>
              <option value="BGComm">BGComm Global BPO Floor</option>
              <option value="RedBin">RedBin Commercial HQ</option>
              <option value="Owl">Owl Creative Studio</option>
            </select>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Task / Milestone
          </button>
        </div>
      </div>

      {/* Gantt Interactive Board */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow-2xl">
        <div className="min-w-[900px]">
          {/* Timeline Header Columns */}
          <div className="grid grid-cols-12 gap-2 pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="col-span-5 font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Task & Dependencies</span>
              <span className="text-[10px] text-slate-500 font-normal">({filteredTasks.length} phases)</span>
            </div>
            <div className="col-span-7 grid grid-cols-16 gap-1 text-center font-mono">
              {Array.from({ length: totalWeeks }).map((_, i) => {
                const isCurrent = i + 1 === currentWeek;
                return (
                  <div
                    key={i}
                    className={`text-[10px] py-1 rounded transition-colors ${
                      isCurrent
                        ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    W{i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase Rows */}
          <div className="divide-y divide-slate-800/60 pt-2 space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                No tasks found matching project filter. Click "Add Task / Milestone" to schedule a phase.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const startCol = Math.max(1, Math.min(16, task.startWeek));
                const duration = Math.max(1, Math.min(16 - startCol + 1, task.durationWeeks));

                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-2 py-3 items-center hover:bg-slate-800/30 rounded-xl px-2 transition"
                  >
                    {/* Left Details: Name, Project, Dependencies, Progress Slider */}
                    <div className="col-span-5 pr-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${getCategoryBadge(task.category)}`}>
                          {task.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-slate-500 hover:text-indigo-400 p-1 transition"
                            title="Edit Task"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-xs text-white leading-snug">
                        {task.name}
                      </div>

                      <div className="text-[10px] text-amber-400 font-medium">
                        {task.projectName}
                      </div>

                      {task.dependencies && task.dependencies !== 'None' && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <GitBranch className="w-3 h-3 text-indigo-400" />
                          <span>{task.dependencies}</span>
                        </div>
                      )}

                      {/* Interactive Progress Slider */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[9px] font-mono text-slate-500">Progress:</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={task.progress}
                          onChange={(e) => handleQuickProgress(task.id, Number(e.target.value))}
                          className="w-24 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                        />
                        <span className="text-[10px] font-mono font-bold text-indigo-300">
                          {task.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Right Timeline Bar Render */}
                    <div className="col-span-7 grid grid-cols-16 gap-1 relative h-9 items-center bg-slate-950/40 rounded-xl p-1 border border-slate-800/60">
                      {/* Current Week Vertical Guide Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-indigo-500/50 z-10 pointer-events-none"
                        style={{ left: `${((currentWeek - 1) / 16) * 100}%` }}
                      />

                      {/* Span Gantt Bar */}
                      <div
                        className="absolute top-1 bottom-1 rounded-lg overflow-hidden border shadow-md transition-all flex items-center justify-between px-2 cursor-pointer group"
                        style={{
                          left: `${((startCol - 1) / 16) * 100}%`,
                          width: `${(duration / 16) * 100}%`,
                          backgroundColor: task.status === 'COMPLETED' ? '#064e3b' : task.status === 'CRITICAL_PATH' ? '#7f1d1d' : '#1e1b4b',
                          borderColor: task.status === 'COMPLETED' ? '#059669' : task.status === 'CRITICAL_PATH' ? '#dc2626' : '#6366f1'
                        }}
                        onClick={() => openEditModal(task)}
                      >
                        {/* Progress Fill Layer */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 transition-all ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500/40'
                              : task.status === 'CRITICAL_PATH'
                              ? 'bg-rose-500/40'
                              : 'bg-indigo-500/40'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />

                        {/* Bar Label */}
                        <span className="relative z-10 text-[10px] font-bold text-white truncate pr-1">
                          {task.name}
                        </span>

                        <span className="relative z-10 text-[9px] font-mono text-slate-300 shrink-0 font-bold bg-slate-900/80 px-1 py-0.5 rounded">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">
                {editingTask ? 'Edit Gantt Task / Phase' : 'Add Gantt Task / Phase'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Task / Phase Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Acoustic Glass Partitions & Glazing"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Project</label>
                  <select
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="NexBridge Software Hub">NexBridge Software Hub</option>
                    <option value="BGComm Global BPO Floor">BGComm Global BPO Floor</option>
                    <option value="RedBin Commercial HQ">RedBin Commercial HQ</option>
                    <option value="Owl Creative Studio">Owl Creative Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GanttTaskItem['category'])}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="CIVIL_WORKS">Civil Works & Core</option>
                    <option value="MEPFS">MEPFS & Fire Safety</option>
                    <option value="ARCHITECTURAL">Architectural & Walls</option>
                    <option value="FINISHES">Finishes & Millwork</option>
                    <option value="QA_HANDOVER">QA & Commissioning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Start Week (1-16)</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={formStartWeek}
                    onChange={(e) => setFormStartWeek(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Prerequisite Dependency</label>
                <input
                  type="text"
                  placeholder="e.g. Demolition Roughing sign-off, or None"
                  value={formDependencies}
                  onChange={(e) => setFormDependencies(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Assigned Trade Crew / Contractor</label>
                <input
                  type="text"
                  placeholder="e.g. SolidFoundations Engineering"
                  value={formContractor}
                  onChange={(e) => setFormContractor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
