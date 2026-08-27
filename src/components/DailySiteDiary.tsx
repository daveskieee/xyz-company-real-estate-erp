/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sun, CloudRain, Cloud, CloudLightning, HardHat, 
  Truck, ShieldCheck, Plus, X, Calendar, User, AlertCircle 
} from 'lucide-react';
import { DailySiteLog } from '../types';

interface DailySiteDiaryProps {
  logs: DailySiteLog[];
  onAddLog: (log: Omit<DailySiteLog, 'id' | 'createdAt'>) => void;
}

export default function DailySiteDiary({ logs, onAddLog }: DailySiteDiaryProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form state
  const [newWeather, setNewWeather] = useState<DailySiteLog['weather']>('SUNNY');
  const [newTemperature, setNewTemperature] = useState<string>('31°C');
  const [newHeadcount, setNewHeadcount] = useState<number>(42);
  const [newEquipment, setNewEquipment] = useState<string>('1x CAT 320 Excavator, 1x Bomag 12-Ton Vibratory Roller, 2x Isuzu 10-Wheeler Dump Trucks');
  const [newToolboxTopic, setNewToolboxTopic] = useState<string>('Trench Safety, PPE Compliance & Earthmoving Exclusion Zones');
  const [newWorkCompleted, setNewWorkCompleted] = useState<string>('');
  const [newDelays, setNewDelays] = useState<string>('');
  const [newSupervisor, setNewSupervisor] = useState<string>('Engr. Ricardo Gomez');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkCompleted.trim()) return;

    onAddLog({
      date: new Date().toISOString(),
      weather: newWeather,
      temperature: newTemperature,
      activeHeadcount: Number(newHeadcount) || 0,
      equipmentOnSite: newEquipment,
      toolboxTopic: newToolboxTopic,
      workCompleted: newWorkCompleted.trim(),
      delaysOrIssues: newDelays.trim() || undefined,
      supervisorName: newSupervisor,
    });

    setNewWorkCompleted('');
    setNewDelays('');
    setIsModalOpen(false);
  };

  const getWeatherIcon = (weather: DailySiteLog['weather']) => {
    switch (weather) {
      case 'SUNNY':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'RAINY':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'STORM':
        return <CloudLightning className="w-5 h-5 text-rose-400" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-400" />
            Daily Construction Site Diary & Weather Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Field engineer daily logs: weather impacts on concrete curing, on-site heavy equipment, and labor headcount.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-amber-950 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Site Entry</span>
        </button>
      </div>

      {/* Diary Entries List */}
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
          >
            {/* Top Bar: Date, Weather, Headcount */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  {getWeatherIcon(log.weather)}
                  <span className="text-xs font-bold text-white uppercase">{log.weather}</span>
                  {log.temperature && (
                    <span className="text-[11px] text-slate-400 font-mono">({log.temperature})</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5" />
                  {log.activeHeadcount} Active Manpower
                </span>

                <span className="text-xs text-slate-400">
                  Supervisor: <strong className="text-white">{log.supervisorName}</strong>
                </span>
              </div>
            </div>

            {/* Scope / Work Completed */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Civil Works & Physical Progress Executed
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {log.workCompleted}
              </p>
            </div>

            {/* Equipment & Toolbox Talk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {log.equipmentOnSite && (
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Heavy Equipment Deployed</span>
                    <span className="text-slate-300 text-xs">{log.equipmentOnSite}</span>
                  </div>
                </div>
              )}

              {log.toolboxTopic && (
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Safety Toolbox Meeting</span>
                    <span className="text-slate-300 text-xs">{log.toolboxTopic}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delays or Warnings */}
            {log.delaysOrIssues && (
              <div className="bg-rose-950/30 border border-rose-800/60 p-2.5 rounded-xl flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[11px] font-bold text-rose-200">Site Obstruction / Weather Delay Alert:</strong>
                  {log.delaysOrIssues}
                </div>
              </div>
            )}
          </div>
        ))}

        {logs.length === 0 && (
          <div className="h-40 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500">
            <HardHat className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs">No daily construction site logs recorded yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                Log Daily Site Operations & Weather Report
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weather Condition</label>
                  <select
                    value={newWeather}
                    onChange={(e) => setNewWeather(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="SUNNY">Sunny / Clear</option>
                    <option value="OVERCAST">Overcast</option>
                    <option value="RAINY">Rainy (Slowdown)</option>
                    <option value="STORM">Storm (Suspended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Temperature</label>
                  <input
                    type="text"
                    value={newTemperature}
                    onChange={(e) => setNewTemperature(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Labor Headcount</label>
                  <input
                    type="number"
                    value={newHeadcount}
                    onChange={(e) => setNewHeadcount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Heavy Machinery & Equipment Active</label>
                <input
                  type="text"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Work Completed & Sectors *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Completed rough subgrade leveling on Lots 1 to 5. 140 linear meters of RCBC drainage trenches excavated..."
                  value={newWorkCompleted}
                  onChange={(e) => setNewWorkCompleted(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Safety Toolbox Topic</label>
                <input
                  type="text"
                  value={newToolboxTopic}
                  onChange={(e) => setNewToolboxTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Delays, Weather Stoppages, or Road Blockages</label>
                <input
                  type="text"
                  placeholder="Optional notes on weather delays or supply deliveries..."
                  value={newDelays}
                  onChange={(e) => setNewDelays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-950 cursor-pointer"
                >
                  Save Daily Site Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
