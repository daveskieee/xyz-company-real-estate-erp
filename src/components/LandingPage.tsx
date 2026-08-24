/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowRight, Building2, Map, ShieldCheck, TreePine, Award, Landmark, 
  Sparkles, Phone, Mail, Globe, MapPin, Activity, FileText, CheckCircle2,
  Calendar, Calculator, Compass, Layers, Eye, X, Check, Send, ChevronRight,
  HardHat, Scale, UserCheck
} from 'lucide-react';
// @ts-ignore
import heroImg from '../assets/images/ph_subdivision_hero_1779708147860.png';
// @ts-ignore
import plotImg from '../assets/images/ph_orchard_plot_1779708171233.png';

interface LandingPageProps {
  onEnterPortal: () => void;
}

export default function LandingPage({ onEnterPortal }: LandingPageProps) {
  // Navigation & interaction states
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showTrippingModal, setShowTrippingModal] = useState<boolean>(false);
  const [trippingSubmitted, setTrippingSubmitted] = useState<boolean>(false);

  // Land Plot Calculator State
  const [lotWidth, setLotWidth] = useState<number>(20);
  const [lotDepth, setLotDepth] = useState<number>(25);
  const [pricePerSqm, setPricePerSqm] = useState<number>(1200);

  const calculatedArea = lotWidth * lotDepth;
  const calculatedPerimeter = (lotWidth * 2) + (lotDepth * 2);
  const calculatedTotalPrice = calculatedArea * pricePerSqm;

  // Form state for tripping
  const [tripName, setTripName] = useState('');
  const [tripContact, setTripContact] = useState('');
  const [tripDate, setTripDate] = useState('2026-06-15');
  const [tripLocation, setTripLocation] = useState('Cavinti Highland Crest');

  // Smooth Portal Entry Handler
  const handleSmoothEnterPortal = () => {
    setIsNavigating(true);
    setTimeout(() => {
      onEnterPortal();
    }, 280);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrippingSubmitted(true);
    setTimeout(() => {
      setShowTrippingModal(false);
      setTrippingSubmitted(false);
      setTripName('');
      setTripContact('');
    }, 2200);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-blue-600 selection:text-white" id="landing-page-root">
      
      {/* Top Banner Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[11px] font-mono py-2 px-6 flex justify-between items-center tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold">JRAM REALTY DEVELOPMENT CORP</span>
          <span className="hidden sm:inline text-slate-500">• STA. CRUZ & CAVINTI LAGUNA</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span>HOTLINE: (+63) 953-435-5175</span>
          <span className="text-blue-400 hidden md:inline">PHILGEPS ACCREDITED</span>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-lg shadow-blue-500/20">
              JRAM
            </div>
            <div>
              <span className="font-sans font-extrabold text-base sm:text-lg text-white tracking-tight block leading-tight">
                JRAM REALTY DEVELOPMENT
              </span>
              <span className="text-[10px] text-blue-400 font-mono tracking-widest block uppercase">
                Subdivision & Land Acquisitions
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Our Vision
            </a>
            <a 
              href="#projects" 
              onClick={(e) => scrollToSection(e, 'projects')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Ventures
            </a>
            <a 
              href="#calculator" 
              onClick={(e) => scrollToSection(e, 'calculator')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Lot Calculator
            </a>
            <a 
              href="#testimonials" 
              onClick={(e) => scrollToSection(e, 'testimonials')}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Testimonials
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTrippingModal(true)}
              className="hidden sm:flex px-4 py-2 border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-all items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Schedule Tripping
            </button>

            <button
              onClick={handleSmoothEnterPortal}
              disabled={isNavigating}
              id="nav-log-in-btn"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 group"
            >
              {isNavigating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Opening Portal...</span>
                </>
              ) : (
                <>
                  <span>Enterprise Portal Sign-In</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        
        {/* Animated Background Ambience */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-[140px] animate-pulseGlow"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-700/80 text-blue-300 text-xs font-mono font-bold tracking-wider uppercase animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Laguna Land Subdivision & Deed Registry
          </div>

          <h1 className="font-sans font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto animate-slideUp">
            Subdividing Prime Laguna Acreage into Secure, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Permanent Wealth</span>
          </h1>

          <p className="font-sans text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            JRAM Realty Development specializes in acquiring raw agricultural tracts, subdividing with licensed geodetic surveys, executing civil road grading, and processing official <strong>Transfer Certificates of Title (TCT)</strong> across <strong>Cavinti</strong>, <strong>Sta. Cruz</strong>, and <strong>Pagsanjan</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleSmoothEnterPortal}
              disabled={isNavigating}
              id="cta-enter-portal-btn"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl cursor-pointer shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 group"
            >
              {isNavigating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to System...</span>
                </>
              ) : (
                <>
                  <span>Access Client & Staff Portal</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Subdivision Projects ↓
            </button>
          </div>

          {/* Hero Visual Asset */}
          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/80 p-2.5 relative group">
            <div className="overflow-hidden rounded-2xl">
              <img 
                src={heroImg} 
                alt="JRAM Premium Subdivision Hills Estate" 
                className="w-full h-auto max-h-[460px] object-cover rounded-2xl shadow-inner transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cavinti Highland Crest Masterplan</h4>
                  <p className="text-[11px] text-slate-400 font-mono">20 Subdivided Lots • Approved Geodetic Survey • DHSUD Compliant</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject('cavinti')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
              >
                View Project Specs ➔
              </button>
            </div>
          </div>

          {/* Core High-Level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs text-left">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-blue-400 block">10+ Hectares</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Acquisitions Managed</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs text-left">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 block">100% Verified</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Clean Government Titles</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs text-left">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-purple-400 block">7-Stage</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Lot Lifecycle Engine</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs text-left">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 block">Weekly QA</span>
              <span className="text-xs text-slate-400 block mt-1 font-medium">Field Inspector Reports</span>
            </div>
          </div>

        </div>
      </section>

      {/* Development Vision Section */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800" id="about">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-950 border border-blue-800 text-blue-300 rounded-full px-3.5 py-1 text-xs font-mono font-bold uppercase mb-4">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Company Vision & Standards
            </div>
            <h2 className="font-sans font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              An End-to-End Civil Development Supporting Laguna Families
            </h2>
            <p className="text-slate-300 mt-6 text-xs sm:text-sm leading-relaxed">
              At JRAM Realty Development, we acquire fertile land parcels within <strong>Sta. Cruz</strong>, <strong>Cavinti</strong>, and <strong>Pagsanjan</strong>, surveying with licensed geodetic engineers, building solid aggregate access roads, and organizing local municipal permit structures for you.
            </p>
            <p className="text-slate-400 mt-4 text-xs sm:text-sm leading-relaxed">
              By controlling this entire value chain from municipal zoning up to subgraded ready-to-build lots, we pass incredible savings to our local and OFW investors. Our integration of dynamic, weekly inspection logs guarantees complete structural and legal clarity.
            </p>

            {/* Executive Leadership Card */}
            <div className="mt-6 border border-slate-800 bg-slate-950 p-4 rounded-2xl shadow-xs space-y-3">
              <span className="text-[10px] text-blue-400 uppercase font-extrabold font-mono tracking-widest block">Executive Leadership</span>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  MP
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm">MAURO R. PRINCIPE JR.</h4>
                  <p className="text-xs text-slate-400 font-medium">Chief Operating Officer</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">angelfiremaui_03@yahoo.com • 09534355175</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-1 leading-relaxed border-t border-slate-850 italic">
                "Directing local geodetic operations, subdivision layouts, and automated title processing models for modern Filpino homestead planning."
              </p>
            </div>
            
            {/* Visual core values list */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                <div className="bg-emerald-950 text-emerald-400 p-2 rounded-lg border border-emerald-800 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-white">Zero-Trust Deed Guarantee</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">We do not release individual lot payments until local registry zoning clearances are fully satisfied.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                <div className="bg-blue-950 text-blue-400 p-2 rounded-lg border border-blue-800 shrink-0">
                  <TreePine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-white">Eco-Conscious Integration</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Incorporating environmental drainage culverts and retaining structures in all plots to stabilize soil permanently.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="font-sans font-bold text-white text-sm flex items-center gap-2 border-b border-slate-850 pb-3">
              <Award className="w-4 h-4 text-blue-400" />
              JRAM Realty Corporate Verification Checklist
            </h3>
            
            <div className="space-y-3.5 font-mono text-xs">
              <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-blue-400 uppercase font-extrabold block">Acquisitions Tier 1</span>
                  <span className="text-white font-semibold block mt-1">1-Hectare Block Vetting</span>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">Verified titles, physical soil checks, slope assessments completed prior to subdivision setup.</p>
                </div>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] px-2.5 py-0.5 rounded font-bold">PASSED</span>
              </div>

              <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-purple-400 uppercase font-extrabold block">Legal Permitting</span>
                  <span className="text-white font-semibold block mt-1">8-Stage Titling Pipeline</span>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">DAR, LGU Dev Permit, DHSUD LTS, BIR eCAR, and Registry of Deeds individual TCT releases.</p>
                </div>
                <span className="bg-purple-950 text-purple-300 border border-purple-700 text-[10px] px-2.5 py-0.5 rounded font-bold">STANDARD</span>
              </div>

              <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-extrabold block">Quality Assurance</span>
                  <span className="text-white font-semibold block mt-1">Defect Punch-List Management</span>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">Field engineers log compaction defects and verify contractor corrections before property turnover.</p>
                </div>
                <span className="bg-amber-950 text-amber-300 border border-amber-700 text-[10px] px-2.5 py-0.5 rounded font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Current Ventures Section */}
      <section className="py-20 bg-slate-950" id="projects">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="bg-blue-950 border border-blue-800 text-blue-300 rounded-full px-3.5 py-1 text-xs font-mono font-bold uppercase inline-block">
              Corporate Real Estate Ventures
            </span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Active Tract Subdivision Projects</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Browse master parcels subdivided under our current infrastructure development phase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            
            {/* Project Card 1 */}
            <div className="border border-slate-800 hover:border-blue-500/60 rounded-2xl overflow-hidden shadow-lg bg-slate-900/60 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between group">
              <div className="h-48 overflow-hidden border-b border-slate-800 relative">
                <img 
                  src={plotImg} 
                  alt="Hectare Orchard Alpha Subdivision Lot View" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold font-mono">
                  8 LOTS AVAILABLE
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-blue-950 border border-blue-800 text-blue-400 rounded-xl">
                    <Map className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono text-slate-400">Cavinti, Laguna</span>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-white">Cavinti Highland Crest</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    A fertile 1-Hectare foothill parcel subdivided into twenty premium 500 sqm garden and orchard plots. Features pre-designed road subgrades and certified DHSUD zoning clearances.
                  </p>
                </div>
              </div>
              <div className="bg-slate-950 border-t border-slate-800 p-4 shrink-0 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">10,000 SQM Total Area</span>
                <button 
                  onClick={() => setSelectedProject('cavinti')}
                  className="text-blue-400 font-bold hover:text-blue-300 cursor-pointer flex items-center gap-1"
                >
                  View Details →
                </button>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg bg-slate-900/40 flex flex-col justify-between opacity-85">
              <div className="h-48 overflow-hidden border-b border-slate-800 bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="space-y-2">
                  <TreePine className="w-8 h-8 text-slate-600 mx-auto" />
                  <span className="text-xs font-mono text-slate-500 block">Future Expansion Tract</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl">
                    <Compass className="w-5 h-5" />
                  </span>
                  <span className="bg-blue-950 border border-blue-800 text-blue-300 text-[10px] px-2.5 py-0.5 rounded font-bold font-mono">
                    TARGET Q3 2026
                  </span>
                </div>
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-300">Pagsanjan Riverview Tract</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Our upcoming 1.5-Hectare purchase target situated next to Pagsanjan Ridge view blocks. Capital reinvestment triggers automatically upon full funding of the current Cavinti parcel.
                  </p>
                </div>
              </div>
              <div className="bg-slate-950 border-t border-slate-800 p-4 shrink-0 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>15,000 SQM Target</span>
                <span className="italic">In Survey Phase</span>
              </div>
            </div>

            {/* Quick ERP Card */}
            <div className="border border-blue-900/80 bg-gradient-to-b from-blue-950/60 to-slate-950 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-blue-900/80 border border-blue-700 text-blue-300 text-[10px] font-bold rounded-full uppercase font-mono inline-block">
                  Unified System Access
                </span>
                <h3 className="font-sans font-bold text-lg text-white">Are you an Assigned Buyer, Inspector, or Admin?</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Access live property development schedules, execute government titling steps, submit weekly field monitoring reports, or sign digital lot acceptance certificates.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={handleSmoothEnterPortal}
                  disabled={isNavigating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  Enter Unified Workspace ➔
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Land Plot Dimension & Price Calculator Section */}
      <section className="py-20 bg-slate-900/70 border-t border-slate-800" id="calculator">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center space-y-3 mb-12">
            <span className="bg-blue-950 border border-blue-800 text-blue-300 rounded-full px-3.5 py-1 text-xs font-mono font-bold uppercase inline-block">
              Interactive Tools
            </span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Lot Dimension & Price Estimator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Test custom lot boundaries to preview total square meters, perimeter fencing footage, and package valuation.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Area */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Width Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">LOT FRONTAGE / WIDTH:</span>
                  <span className="text-blue-400 font-bold">{lotWidth} METERS</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="1"
                  value={lotWidth}
                  onChange={(e) => setLotWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-blue-500"
                />
              </div>

              {/* Depth Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">LOT DEPTH / LENGTH:</span>
                  <span className="text-blue-400 font-bold">{lotDepth} METERS</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={lotDepth}
                  onChange={(e) => setLotDepth(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-blue-500"
                />
              </div>

              {/* Price Per SQM */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">RATE PER SQM:</span>
                  <span className="text-emerald-400 font-bold">₱{pricePerSqm.toLocaleString()} / SQM</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 1200, 1500].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPricePerSqm(rate)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                        pricePerSqm === rate 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      ₱{rate.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Results Preview Box */}
            <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                ESTIMATED LOT VALUATION
              </span>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  ₱{calculatedTotalPrice.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Total Land Package Valuation
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TOTAL AREA</span>
                  <strong className="text-white text-sm">{calculatedArea} sqm</strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">PERIMETER</span>
                  <strong className="text-white text-sm">{calculatedPerimeter} m</strong>
                </div>
              </div>

              <button
                onClick={() => setShowTrippingModal(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all"
              >
                Inquire for This Plot Size ➔
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-800" id="testimonials">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="bg-blue-950 border border-blue-800 text-blue-300 rounded-full px-3.5 py-1 text-xs font-mono font-bold uppercase inline-block">
              Client Testimonials
            </span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight">Vouched by Real Estate Builders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-amber-400 flex gap-1 text-sm">★★★★★</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "What blew me away was the Client Portal. I can log in, look at my property, and see the exact status of my Land Permit and Title deeds. In parallel, Engr. Ricardo Gomez updates weekly logs detailing road subgrades. No secrets!"
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  JD
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Juan Dela Cruz</h4>
                  <p className="text-[10px] text-slate-400">Pioneer Buyer, Slot 01</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="text-amber-400 flex gap-1 text-sm">★★★★★</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Being able to review soil mechanics and contractor schedules through the main panel is wonderful. The micro-financing ledger tracks payments cleanly. Best land developer tool in the country."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  SO
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Sophia Rodriguez</h4>
                  <p className="text-[10px] text-slate-400">Pioneer Buyer, Slot 12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Industry-Grade Footer */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-800 font-sans" id="corporate-footer">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            
            {/* Column 1: Brand Profile */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                  JRAM
                </div>
                <span className="font-sans font-black text-white text-base tracking-tight">
                  JRAM REALTY DEVELOPMENT
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                A premier land acquisition, subdivision planning, and deed registration firm operating under rigorous legal standards across Laguna.
              </p>
              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>National Highway, Sta. Cruz, Laguna, Philippines</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>angelfiremaui_03@yahoo.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>(+63) 953-435-5175</span>
                </div>
              </div>
            </div>

            {/* Column 2: Subdivision Sites */}
            <div className="lg:col-span-3 space-y-4 text-left">
              <h4 className="text-[10px] font-mono font-bold text-slate-300 tracking-wider uppercase border-l-2 border-blue-500 pl-2">
                DEVELOPMENT LOCATIONS
              </h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="hover:text-white transition-colors">
                  <span className="font-bold text-slate-200">Sta. Cruz Estates</span>
                  <span className="block text-[10px] text-slate-500 font-mono">Subgraded ready-to-build residential lots</span>
                </li>
                <li className="hover:text-white transition-colors">
                  <span className="font-bold text-slate-200">Cavinti Green Orchards</span>
                  <span className="block text-[10px] text-slate-500 font-mono">High elevational agricultural-residential plots</span>
                </li>
                <li className="hover:text-white transition-colors">
                  <span className="font-bold text-slate-200">Pagsanjan Premium Tracts</span>
                  <span className="block text-[10px] text-slate-500 font-mono">Secure suburban plots with rapid title transfer</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Professional Portals */}
            <div className="lg:col-span-2 space-y-4 text-left">
              <h4 className="text-[10px] font-mono font-bold text-slate-300 tracking-wider uppercase border-l-2 border-teal-500 pl-2">
                PM SYSTEM WORKSPACES
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={handleSmoothEnterPortal} className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors text-left bg-transparent border-none p-0">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>Executive Hub</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleSmoothEnterPortal} className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors text-left bg-transparent border-none p-0">
                    <Scale className="w-3.5 h-3.5 text-purple-400" />
                    <span>Titling Pipeline</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleSmoothEnterPortal} className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors text-left bg-transparent border-none p-0">
                    <HardHat className="w-3.5 h-3.5 text-amber-400" />
                    <span>Field QA Inspector</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Leadership */}
            <div className="lg:col-span-3 space-y-4 text-left">
              <h4 className="text-[10px] font-mono font-bold text-slate-300 tracking-wider uppercase border-l-2 border-amber-500 pl-2">
                EXECUTIVE DIRECTORSHIP
              </h4>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 border border-blue-700 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0">
                    MP
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight font-sans">Mauro R. Principe Jr.</h5>
                    <p className="text-[10px] text-slate-400">Chief Operating Officer</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  "Advancing transparent title processing pipelines and digitized geodetic subdivision planning."
                </p>
              </div>
            </div>

          </div>

          {/* Verification Badges */}
          <div className="py-6 flex flex-wrap items-center justify-between gap-6 border-b border-slate-800 text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>REGISTRY OF DEEDS STANDARD VERIFIED</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400 shrink-0" />
              <span>DHSUD LICENSED CODE COMPLIANT</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-400 shrink-0" />
              <span>PHILGEPS REGISTERED SYSTEM</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <span>MUNICIPAL TAX REVENUE ALIGNED</span>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} JRAM Realty Development Corporation. All rights reserved.
            </p>
            <div className="flex items-center gap-3 font-mono">
              <span className="hover:text-blue-400 transition-colors cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-teal-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-amber-400 transition-colors cursor-pointer">Security Certifications</span>
            </div>
          </div>
          
        </div>
      </footer>

      {/* Modal: Project Details Showcase */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">PROJECT SHOWCASE</span>
                <h3 className="text-base font-bold text-white">Cavinti Highland Crest Subdivision</h3>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="h-44 rounded-xl overflow-hidden border border-slate-800">
                <img src={plotImg} alt="Subdivision" className="w-full h-full object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TOTAL PARCEL AREA</span>
                  <strong className="text-white">10,000 SQM (1.0 Ha)</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SUBDIVIDED SLOTS</span>
                  <strong className="text-white">20 Individual Lots (500 sqm)</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">ROAD NETWORK</span>
                  <strong className="text-white">6-Meter Subgraded Gravel Base</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TITLE STATUS</span>
                  <strong className="text-emerald-400">Clean Mother Title Verified</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setShowTrippingModal(true);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Book Site Inspection Tripping
              </button>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  handleSmoothEnterPortal();
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg"
              >
                Open 2D Masterplan Grid ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Schedule Site Tripping */}
      {showTrippingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-slideUp">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Schedule Free Laguna Site Tripping</h3>
              </div>
              <button 
                onClick={() => setShowTrippingModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {trippingSubmitted ? (
              <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs p-5 rounded-2xl text-center space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">Tripping Schedule Received!</h4>
                <p>Our Laguna operations team will contact you shortly to coordinate transportation and site passes.</p>
              </div>
            ) : (
              <form onSubmit={handleTrippingSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mobile Contact / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={tripContact}
                    onChange={(e) => setTripContact(e.target.value)}
                    placeholder="0917-123-4567"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={tripDate}
                      onChange={(e) => setTripDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Target Location</label>
                    <select
                      value={tripLocation}
                      onChange={(e) => setTripLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    >
                      <option value="Cavinti Highland Crest">Cavinti Highland</option>
                      <option value="Sta. Cruz Estates">Sta. Cruz Estates</option>
                      <option value="Pagsanjan Riverview">Pagsanjan Riverview</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer mt-2"
                >
                  Confirm Free Tripping Reservation
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
