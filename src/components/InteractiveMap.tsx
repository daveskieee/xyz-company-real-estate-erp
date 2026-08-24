/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, FileImage, Layers, Eye, RefreshCw, UserPlus, FileText, Check, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { Slot, Client, SlotStatus } from '../types';

interface InteractiveMapProps {
  slots: Slot[];
  clients: Client[];
  onTransitionSlotStatus: (slotId: string, status: string, notes?: string, assignedClientId?: string | null) => void;
  onAssignClient: (slotId: string, clientId: string) => void;
}

export default function InteractiveMap({ slots, clients, onTransitionSlotStatus, onAssignClient }: InteractiveMapProps) {
  const [isScanned, setIsScanned] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('blueprint-cavinti-crest.dwg');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [assignmentClientId, setAssignmentClientId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setIsScanned(true);
        setSelectedSlot(null);
      }, 1200);
    }
  };

  const getStatusColorConfig = (status: SlotStatus) => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100/80',
          border: 'border-emerald-300',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          text: 'text-emerald-950',
          dot: 'bg-emerald-500'
        };
      case 'Reserved':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100/80',
          border: 'border-amber-300',
          badgeBg: 'bg-amber-100 text-amber-800',
          text: 'text-amber-950',
          dot: 'bg-amber-500'
        };
      case 'Under Contract':
        return {
          bg: 'bg-blue-50 hover:bg-blue-100/80',
          border: 'border-blue-300',
          badgeBg: 'bg-blue-100 text-blue-800',
          text: 'text-blue-950',
          dot: 'bg-blue-500'
        };
      case 'Developing':
        return {
          bg: 'bg-indigo-50 hover:bg-indigo-100/80',
          border: 'border-indigo-300',
          badgeBg: 'bg-indigo-100 text-indigo-800',
          text: 'text-indigo-950',
          dot: 'bg-indigo-500'
        };
      case 'Titling Phase':
        return {
          bg: 'bg-purple-50 hover:bg-purple-100/80',
          border: 'border-purple-300',
          badgeBg: 'bg-purple-100 text-purple-800',
          text: 'text-purple-950',
          dot: 'bg-purple-500'
        };
      case 'Turnover Ready':
        return {
          bg: 'bg-teal-50 hover:bg-teal-100/80',
          border: 'border-teal-300',
          badgeBg: 'bg-teal-100 text-teal-800',
          text: 'text-teal-950',
          dot: 'bg-teal-500'
        };
      case 'Handed Over':
        return {
          bg: 'bg-slate-100 hover:bg-slate-200/80',
          border: 'border-slate-300',
          badgeBg: 'bg-slate-200 text-slate-800',
          text: 'text-slate-900',
          dot: 'bg-slate-600'
        };
      default:
        return {
          bg: 'bg-slate-50 hover:bg-slate-100',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-100 text-slate-700',
          text: 'text-slate-800',
          dot: 'bg-slate-400'
        };
    }
  };

  const currentAssignedClient = selectedSlot?.assignedClientId 
    ? clients.find(c => c.id === selectedSlot.assignedClientId) 
    : null;

  const filteredSlots = filterStatus === 'ALL' 
    ? slots 
    : slots.filter(s => s.status === filterStatus);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="virtual-scanner-layout">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-sans font-semibold text-lg text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Subdivision Masterplan & Interactive 2D Lot GIS Grid
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Real-time lot inventory lifecycle mapping • Click any slot to view or transition operational stages
          </p>
        </div>
        
        {/* File Upload Zone & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.dwg,.dxf,.pdf"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-medium cursor-pointer transition-colors bg-white shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Upload Masterplan CAD
          </button>
          {uploadedFileName && (
            <div className="flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-md px-3 py-1 font-mono">
              <FileImage className="w-3.5 h-3.5" />
              <span>{uploadedFileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <span>Filter Status:</span>
          {['ALL', 'Available', 'Reserved', 'Under Contract', 'Developing', 'Titling Phase', 'Turnover Ready', 'Handed Over'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === st 
                  ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="font-mono text-xs text-slate-500">
          Showing {filteredSlots.length} of {slots.length} lots
        </div>
      </div>

      {/* Interactive Scan Canvas / Dynamic Workspace */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
        
        {/* The 2D Map Workspace */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-6 min-h-[420px] relative shadow-sm">
          {isScanning && (
            <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-mono text-xs text-blue-900 font-bold mt-4 animate-pulse">
                PARSING BLUEPRINT LAYOUT SCHEMATIC...
              </p>
            </div>
          )}

          <div className="w-full">
            {/* HUD Status Bar */}
            <div className="flex justify-between items-center mb-4 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Active Masterplan: Cavinti Highland Crest (10,000 sqm)
              </span>
              <span>20 Lots Subdivided (500 sqm / lot)</span>
            </div>

            {/* Grid Coordinates Table */}
            <div className="border border-blue-100 bg-slate-50/50 rounded-xl p-4 sm:p-6 relative">
              <div className="grid grid-cols-5 gap-3 text-center text-[10px] font-mono text-slate-400 mb-2">
                <span>COL 1 (WEST)</span>
                <span>COL 2</span>
                <span>COL 3 (CENTER)</span>
                <span>COL 4</span>
                <span>COL 5 (EAST)</span>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const cfg = getStatusColorConfig(slot.status);
                  const isFiltered = filterStatus === 'ALL' || slot.status === filterStatus;
                  const assignedClient = slot.assignedClientId ? clients.find(c => c.id === slot.assignedClientId) : null;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      id={`map-slot-btn-${slot.id}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        aspect-square p-2.5 rounded-lg border flex flex-col justify-between text-left transition-all cursor-pointer relative group overflow-hidden
                        ${cfg.bg} ${cfg.border} ${cfg.text}
                        ${isSelected ? 'ring-2 ring-blue-600 border-blue-600 ring-offset-2 scale-102 z-10 shadow-md' : 'hover:scale-[1.02] shadow-xs'}
                        ${!isFiltered ? 'opacity-30' : 'opacity-100'}
                      `}
                    >
                      <div className="flex justify-between items-start w-full gap-0.5">
                        <span className="font-mono text-[10px] font-bold opacity-60">
                          #{slot.slotNumber.toString().padStart(2, '0')}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-tight ${cfg.badgeBg}`}>
                          {slot.status}
                        </span>
                      </div>

                      <div className="my-1">
                        <span className="font-sans font-bold text-xs block">
                          {slot.id}
                        </span>
                        <span className="font-mono text-[9px] opacity-70 block">
                          {slot.areaSqm} sqm
                        </span>
                      </div>

                      {assignedClient ? (
                        <div className="text-[9px] font-sans font-medium truncate pt-1 border-t border-slate-200/50 opacity-90">
                          {assignedClient.name}
                        </div>
                      ) : (
                        <div className="text-[9px] font-mono opacity-50 pt-1 border-t border-slate-200/50">
                          Unassigned
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Comprehensive 7-Stage Legend */}
              <div className="flex justify-center flex-wrap gap-4 mt-6 pt-4 border-t border-slate-200 text-xs">
                {[
                  { name: 'Available', color: 'bg-emerald-500' },
                  { name: 'Reserved', color: 'bg-amber-500' },
                  { name: 'Under Contract', color: 'bg-blue-500' },
                  { name: 'Developing', color: 'bg-indigo-500' },
                  { name: 'Titling Phase', color: 'bg-purple-500' },
                  { name: 'Turnover Ready', color: 'bg-teal-500' },
                  { name: 'Handed Over', color: 'bg-slate-600' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded ${item.color} inline-block shadow-xs`}></span>
                    <span className="text-slate-600 text-[11px]">{item.name} ({slots.filter(s => s.status === item.name).length})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lot Audit Details & Lifecycle Transition Controller */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="font-sans font-semibold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Lot Inspector & Lifecycle Hub
              </span>
              {selectedSlot ? (
                <span className="text-xxs font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase font-bold">
                  {selectedSlot.id}
                </span>
              ) : (
                <span className="text-xxs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                  Click a lot
                </span>
              )}
            </h4>

            {selectedSlot ? (
              <div className="space-y-4">
                {/* Lot Metadata Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Slot Identifier</span>
                      <strong className="text-slate-900 text-sm">{selectedSlot.id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Lot Number</span>
                      <strong className="text-slate-900 text-sm">Lot {selectedSlot.slotNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Area</span>
                      <strong className="text-slate-800">{selectedSlot.areaSqm} sqm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Contract Value</span>
                      <strong className="text-blue-600 font-mono">₱{selectedSlot.basePrice.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-medium">Lifecycle Stage:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColorConfig(selectedSlot.status).badgeBg}`}>
                      {selectedSlot.status}
                    </span>
                  </div>
                </div>

                {/* Assigned Client Card */}
                {currentAssignedClient ? (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 uppercase text-[11px] font-mono tracking-wider">
                        Assigned Buyer Record
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {currentAssignedClient.id}
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <p><strong>Name:</strong> {currentAssignedClient.name}</p>
                      <p className="text-slate-500"><strong>Email:</strong> {currentAssignedClient.email}</p>
                      <p className="text-slate-500"><strong>Package:</strong> {currentAssignedClient.packageName}</p>
                      <p className="text-purple-800 font-medium mt-1">
                        <strong>Titling Phase:</strong> {currentAssignedClient.titleMilestones.currentPhase}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2 text-xs">
                    <span className="font-bold text-amber-900 uppercase text-[11px] font-mono block">
                      Assign Buyer to this Lot
                    </span>
                    <select
                      value={assignmentClientId}
                      onChange={(e) => setAssignmentClientId(e.target.value)}
                      className="w-full text-xs border border-amber-300 rounded p-2 bg-white text-slate-800"
                    >
                      <option value="">-- Choose Unassigned Buyer --</option>
                      {clients.filter(c => !c.slotId).map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                      ))}
                    </select>
                    <button
                      disabled={!assignmentClientId}
                      onClick={() => {
                        if (assignmentClientId) {
                          onAssignClient(selectedSlot.id, assignmentClientId);
                          setSelectedSlot({ ...selectedSlot, status: 'Reserved', assignedClientId: assignmentClientId });
                          setAssignmentClientId('');
                        }
                      }}
                      className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Assign Buyer & Mark Reserved
                    </button>
                  </div>
                )}

                {/* Direct Stage Transitioner */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Advance Lot Lifecycle Stage:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Available', 'Reserved', 'Under Contract', 'Developing', 'Titling Phase', 'Turnover Ready', 'Handed Over'].map((stage) => (
                      <button
                        key={stage}
                        disabled={selectedSlot.status === stage}
                        onClick={() => {
                          onTransitionSlotStatus(selectedSlot.id, stage, `Quick transition via Masterplan Inspector`);
                          setSelectedSlot({ ...selectedSlot, status: stage as SlotStatus });
                        }}
                        className={`text-[11px] py-1.5 px-2 rounded border text-left font-medium transition-all cursor-pointer ${
                          selectedSlot.status === stage
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <Eye className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-sans">
                  Click on any lot coordinate in the 2D grid above to view details, inspect assigned buyer records, or advance lifecycle stages.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>AutoCAD Masterplan Linked</span>
            <span>20 Subdivision Lots</span>
          </div>
        </div>

      </div>
    </div>
  );
}
