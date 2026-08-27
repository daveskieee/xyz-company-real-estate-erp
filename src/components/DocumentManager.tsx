/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, Upload, Download, Eye, CheckCircle2, 
  Clock, ShieldAlert, Folder, Filter, Plus, X, FileCode
} from 'lucide-react';
import { ProjectDocument } from '../types';

interface DocumentManagerProps {
  documents: ProjectDocument[];
  onUploadDocument: (doc: Omit<ProjectDocument, 'id' | 'createdAt'>) => void;
}

export default function DocumentManager({ documents, onUploadDocument }: DocumentManagerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ProjectDocument['category']>('CAD_DRAWING');
  const [newVersion, setNewVersion] = useState<string>('1.0');
  const [newStatus, setNewStatus] = useState<ProjectDocument['status']>('APPROVED');
  const [newNotes, setNewNotes] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'All Documents' },
    { id: 'CAD_DRAWING', label: 'CAD & Masterplans' },
    { id: 'PERMIT_DHSUD', label: 'DHSUD License to Sell' },
    { id: 'LGU_CLEARANCE', label: 'LGU Permits' },
    { id: 'STRUCTURAL_PLAN', label: 'Engineering Blueprints' },
    { id: 'DEED_LEGAL', label: 'Titling & Deeds' },
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onUploadDocument({
      title: newTitle.trim(),
      category: newCategory,
      version: newVersion,
      status: newStatus,
      uploadedBy: 'Mauro R. Principe Jr. (COO)',
      fileSize: '4.2 MB',
      notes: newNotes.trim() || 'Uploaded to project central blueprint repository.',
    });

    setNewTitle('');
    setNewNotes('');
    setIsUploadModalOpen(false);
  };

  const filteredDocs = documents.filter((d) => {
    const matchesCategory = activeCategory === 'ALL' || d.category === activeCategory;
    const matchesSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-teal-400" />
            Blueprint & Document Management System (DMS)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized document vault for AutoCAD layouts, structural plans, environmental compliance, and DHSUD permits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-teal-950 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-teal-700/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-teal-400 font-bold uppercase block">
                      {doc.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">v{doc.version} • {doc.fileSize || '2.5 MB'}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  doc.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {doc.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug mb-1.5">
                {doc.title}
              </h4>

              {doc.notes && (
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {doc.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] text-slate-500 font-medium">
                By: {doc.uploadedBy.split(' ')[0]}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Opening preview for ${doc.title}`)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Preview Document"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alert(`Downloading verified copy of ${doc.title}`)}
                  className="p-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-800 text-teal-300 hover:text-white transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full h-40 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs">No documents uploaded in this category.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-400" />
                Upload Project Blueprint / Legal Permit
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approved Drainage Outfall Plan & Hydraulic Calculations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="CAD_DRAWING">CAD Masterplan</option>
                    <option value="PERMIT_DHSUD">DHSUD Permit</option>
                    <option value="LGU_CLEARANCE">LGU Development Clearance</option>
                    <option value="STRUCTURAL_PLAN">Structural Blueprint</option>
                    <option value="DEED_LEGAL">Deed & Land Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Compliance Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Approved by municipal engineer, signed by licensed geodetic engineer..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-950 cursor-pointer"
                >
                  Commit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
