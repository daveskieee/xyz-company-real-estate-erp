/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle, Layers, ChevronRight, BarChart3, Filter } from 'lucide-react';
import { CivilWorksMilestone, ProjectTask } from '../types';

interface GanttTimelineProps {
  milestones: CivilWorksMilestone[];
  tasks: ProjectTask[];
  onUpdateMilestoneProgress?: (milestoneId: string, progress: number) => void;
}

export default function GanttTimeline({ milestones, tasks }: GanttTimelineProps) {
  const [viewMode, setViewMode] = useState<'MONTHS' | 'WEEKS'>('WEEKS');

  // Standard construction phases mapping with scheduled durations (in weeks)
  const scheduleData = [
    {
      id: 'PHASE-A',
      name: 'Phase A: Boundary Staking & Land Grading',
      startWeek: 1,
      durationWeeks: 4,
      category: 'EARTHWORKS',
      contractor: 'Laguna Geodetic Earthmovers',
      progress: milestones.find((m) => m.phaseName.includes('Phase A'))?.currentPercentage || 0,
      status: milestones.find((m) => m.phaseName.includes('Phase A'))?.status || 'NOT_STARTED',
    },
    {
      id: 'PHASE-B',
      name: 'Phase B: Road Network & Concrete Curbing',
      startWeek: 4,
      durationWeeks: 6,
      category: 'PAVEMENT',
      contractor: 'Calabarzon Road Masters',
      progress: milestones.find((m) => m.phaseName.includes('Phase B'))?.currentPercentage || 0,
      status: milestones.find((m) => m.phaseName.includes('Phase B'))?.status || 'NOT_STARTED',
    },
    {
      id: 'PHASE-C',
      name: 'Phase C: Storm Drainage & RCBC Culverts',
      startWeek: 7,
      durationWeeks: 5,
      category: 'UTILITIES',
      contractor: 'Agua-Laguna Drainage Corp',
      progress: milestones.find((m) => m.phaseName.includes('Phase C'))?.currentPercentage || 0,
      status: milestones.find((m) => m.phaseName.includes('Phase C'))?.status || 'NOT_STARTED',
    },
    {
      id: 'PHASE-D',
      name: 'Phase D: Water Reticulation & Power Grid Post Lines',
      startWeek: 10,
      durationWeeks: 4,
      category: 'ELECTROMECHANICAL',
      contractor: 'Agua-Laguna Drainage Corp',
      progress: milestones.find((m) => m.phaseName.includes('Phase D'))?.currentPercentage || 0,
      status: milestones.find((m) => m.phaseName.includes('Phase D'))?.status || 'NOT_STARTED',
    },
    {
      id: 'PHASE-E',
      name: 'Phase E: Security Perimeter & Subdivision Gate',
      startWeek: 12,
      durationWeeks: 4,
      category: 'STRUCTURE',
      contractor: 'Calabarzon Road Masters',
      progress: milestones.find((m) => m.phaseName.includes('Phase E'))?.currentPercentage || 0,
      status: milestones.find((m) => m.phaseName.includes('Phase E'))?.status || 'NOT_STARTED',
    },
  ];

  const totalWeeks = 16;
  const currentWeek = 6; // Projected timeline position

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Interactive Gantt Schedule & Milestone Critical Path
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            16-Week Phase 1 Masterplan schedule with dependencies, civil works critical paths, and current completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('WEEKS')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'WEEKS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setViewMode('MONTHS')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'MONTHS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Quarters
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Timeline Header Columns */}
          <div className="grid grid-cols-12 gap-1 pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="col-span-4 font-bold text-slate-200 uppercase tracking-wider">
              Engineering Work Phase
            </div>
            <div className="col-span-8 grid grid-cols-16 gap-0 text-center">
              {Array.from({ length: totalWeeks }).map((_, i) => (
                <div
                  key={i}
                  className={`text-[10px] py-1 rounded ${
                    i + 1 === currentWeek ? 'bg-indigo-950/80 text-indigo-400 font-bold border border-indigo-700/50' : 'text-slate-500'
                  }`}
                >
                  W{i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Phase Rows */}
          <div className="space-y-4 pt-3">
            {scheduleData.map((phase) => {
              const startCol = phase.startWeek;
              const spanCols = phase.durationWeeks;

              return (
                <div key={phase.id} className="grid grid-cols-12 gap-1 items-center group">
                  {/* Phase Label & Info */}
                  <div className="col-span-4 pr-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {phase.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                        {phase.progress}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-slate-500">{phase.contractor}</span>
                      <span>•</span>
                      <span className={`font-semibold ${
                        phase.status === 'COMPLETED' ? 'text-emerald-400' : phase.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {phase.status}
                      </span>
                    </div>
                  </div>

                  {/* Gantt Bar Grid */}
                  <div className="col-span-8 relative h-10 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center p-1">
                    {/* Today indicator vertical line */}
                    <div
                      className="absolute top-0 bottom-0 z-10 w-[2px] bg-rose-500/80 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                      style={{ left: `${((currentWeek - 0.5) / totalWeeks) * 100}%` }}
                      title="Current Project Week"
                    />

                    {/* Progress Bar Segment */}
                    <div
                      className="relative h-7 rounded-lg overflow-hidden flex items-center justify-between px-2 text-[10px] font-bold text-white shadow-lg transition-all duration-300"
                      style={{
                        left: `${((startCol - 1) / totalWeeks) * 100}%`,
                        width: `${(spanCols / totalWeeks) * 100}%`,
                        background: phase.progress === 100 
                          ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
                          : 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)',
                      }}
                    >
                      <span className="truncate drop-shadow">{phase.category}</span>
                      <span className="font-mono bg-black/30 px-1.5 py-0.2 rounded text-[9px]">
                        {spanCols}w
                      </span>

                      {/* Internal percentage fill overlay */}
                      <div
                        className="absolute top-0 left-0 bottom-0 bg-white/20 pointer-events-none"
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span>Completed Phase</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-500" />
              <span>In Progress / Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-rose-500" />
              <span>Current Project Week (W6)</span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Total Phase 1 Duration: 16 Calendar Weeks
          </span>
        </div>
      </div>
    </div>
  );
}
