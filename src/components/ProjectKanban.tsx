/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, CheckCircle2, Clock, AlertTriangle, User, Tag, 
  Calendar, CheckSquare, MoreVertical, X, Filter, Sparkles
} from 'lucide-react';
import { ProjectTask, TaskPriority, TaskStatus, TaskSubItem } from '../types';

interface ProjectKanbanProps {
  tasks: ProjectTask[];
  onAddTask: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask?: (taskId: string) => void;
}

export default function ProjectKanban({ tasks, onAddTask, onUpdateTaskStatus }: ProjectKanbanProps) {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newAssignee, setNewAssignee] = useState<string>('Engr. Ricardo Gomez');
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
  const [newStatus, setNewStatus] = useState<TaskStatus>('TODO');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newEstimatedHours, setNewEstimatedHours] = useState<number>(16);
  const [newCategory, setNewCategory] = useState<string>('CIVIL_WORKS');
  const [newSubtaskInput, setNewSubtaskInput] = useState<string>('');
  const [newSubtasks, setNewSubtasks] = useState<TaskSubItem[]>([]);

  const columns: { id: TaskStatus; title: string; color: string; badge: string }[] = [
    { id: 'BACKLOG', title: 'Backlog', color: 'border-slate-700 bg-slate-900/40', badge: 'bg-slate-800 text-slate-300' },
    { id: 'TODO', title: 'To Do', color: 'border-blue-900/60 bg-blue-950/20', badge: 'bg-blue-900/80 text-blue-300' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-amber-900/60 bg-amber-950/20', badge: 'bg-amber-900/80 text-amber-300' },
    { id: 'REVIEW', title: 'Review & QA', color: 'border-purple-900/60 bg-purple-950/20', badge: 'bg-purple-900/80 text-purple-300' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-900/60 bg-emerald-950/20', badge: 'bg-emerald-900/80 text-emerald-300' },
    { id: 'BLOCKED', title: 'Blocked', color: 'border-rose-900/60 bg-rose-950/20', badge: 'bg-rose-900/80 text-rose-300' },
  ];

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setNewSubtasks([...newSubtasks, { id: `sub-${Date.now()}`, title: newSubtaskInput.trim(), completed: false }]);
    setNewSubtaskInput('');
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      assigneeName: newAssignee,
      priority: newPriority,
      status: newStatus,
      dueDate: newDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: Number(newEstimatedHours) || 0,
      actualHours: 0,
      category: newCategory,
      subtasks: newSubtasks,
      tags: [newCategory],
    });

    // Reset
    setNewTitle('');
    setNewDescription('');
    setNewSubtasks([]);
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.assigneeName && t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesCategory && matchesSearch;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/40">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/20 text-slate-400 border border-slate-500/40">LOW</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Project Task Board (Kanban WBS)
            </h2>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {tasks.length} Total Tasks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real estate construction sprints, engineering clearances, and contractor assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="CIVIL_WORKS">Civil Works</option>
            <option value="SURVEYING">Land Surveying</option>
            <option value="PERMITTING">DHSUD / LGU Permits</option>
            <option value="LEGAL">Titling & Deeds</option>
            <option value="QA">Quality Assurance</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-950 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className={`rounded-2xl border ${col.color} p-3 flex flex-col min-h-[480px]`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white uppercase tracking-wider">{col.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards Stack */}
              <div className="space-y-2.5 flex-1">
                {colTasks.map((task) => {
                  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                  const totalSubtasks = task.subtasks?.length || 0;

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-600 rounded-xl p-3 shadow-md hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                          {task.category || 'TASK'}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug mb-1.5 group-hover:text-emerald-300 transition-colors">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Progress */}
                      {totalSubtasks > 0 && (
                        <div className="mb-2 bg-slate-950/80 rounded-lg p-1.5 border border-slate-800">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-emerald-400" />
                              Subtasks
                            </span>
                            <span className="font-mono">{completedSubtasks}/{totalSubtasks}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full transition-all"
                              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <User className="w-3 h-3 text-slate-500" />
                          {task.assigneeName ? task.assigneeName.split(' ')[0] : 'Unassigned'}
                        </span>

                        {task.dueDate && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Move Status Buttons */}
                      <div className="mt-2 pt-1.5 border-t border-slate-800/40 flex items-center gap-1 overflow-x-auto">
                        {columns.map((c) => {
                          if (c.id === task.status) return null;
                          return (
                            <button
                              key={c.id}
                              onClick={() => onUpdateTaskStatus(task.id, c.id)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                              title={`Move to ${c.title}`}
                            >
                              → {c.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-32 border border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-[11px] text-slate-600">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Create Construction & Operational Task
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concrete Pouring for Spine Road Curb (Lots 1-5)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Description / Scope</label>
                <textarea
                  rows={2}
                  placeholder="Details, engineering tolerances, contractor instructions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Engr. Ricardo Gomez">Engr. Ricardo Gomez (Inspector)</option>
                    <option value="Laguna Geodetic Earthmovers">Laguna Geodetic Earthmovers</option>
                    <option value="Calabarzon Road Masters">Calabarzon Road Masters</option>
                    <option value="Agua-Laguna Drainage Corp">Agua-Laguna Drainage Corp</option>
                    <option value="Atty. Katrina Alvero">Atty. Katrina Alvero (Legal/Titling)</option>
                    <option value="Mauro R. Principe Jr.">Mauro R. Principe Jr. (COO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="CIVIL_WORKS">Civil Works</option>
                    <option value="SURVEYING">Land Surveying</option>
                    <option value="PERMITTING">Permitting & LGU</option>
                    <option value="LEGAL">Legal / Titling</option>
                    <option value="QA">Inspection & QA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="TODO">To Do</option>
                    <option value="BACKLOG">Backlog</option>
                    <option value="IN_PROGRESS">In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={newEstimatedHours}
                    onChange={(e) => setNewEstimatedHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Subtasks Checklist Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subtasks & Inspection Checklist</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add step or verification item..."
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {newSubtasks.length > 0 && (
                  <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                    {newSubtasks.map((sub, idx) => (
                      <div key={sub.id} className="flex items-center justify-between text-xs text-slate-300">
                        <span>{idx + 1}. {sub.title}</span>
                        <button
                          type="button"
                          onClick={() => setNewSubtasks(newSubtasks.filter((s) => s.id !== sub.id))}
                          className="text-rose-400 hover:text-rose-300 text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
