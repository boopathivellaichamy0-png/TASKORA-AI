import React, { useState } from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Copy, 
  Check, 
  Layers, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Zap, 
  Lock, 
  Scissors, 
  BarChart3,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SynapseLandingProps {
  onLaunchTracker: () => void;
  onOpenDashboard: () => void;
  onOpenReports: () => void;
}

export const SynapseLanding: React.FC<SynapseLandingProps> = ({
  onLaunchTracker,
  onOpenDashboard,
  onOpenReports,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleCode = `import { SynapseEngine, ProductionPipeline } from "@synapse/core";

// Initialize stage-wise zero-loss tracking pipeline
const pipeline = new ProductionPipeline({
  batchId: "BATCH-2026-001",
  stages: ["Cutting", "Stitching", "QC", "Finishing", "Packing"],
  strictAccountability: true,
  zeroLossProtocol: true
});

// Autonomous piece-level verification & loss interception
pipeline.onStageTransition(async ({ stage, received, passed, rejected, missing }) => {
  if (missing > 0) {
    await SynapseEngine.dispatchDiscrepancyIncident({
      variance: -missing,
      notifyAdmin: true,
      mandatoryReasonEnforced: true
    });
  }
  return { status: "LOCKED_IMMUTABLE", yieldRate: (passed / received) * 100 };
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tickerItems = [
    { label: "PIPELINE LINEAGE", value: "5 STAGES ACTIVE", color: "text-[#06B6D4]" },
    { label: "REAL-TIME YIELD", value: "98.7% EFFICIENCY", color: "text-[#10B981]" },
    { label: "SHORTAGE INTERCEPTION", value: "0.00 MS LATENCY", color: "text-[#8B5CF6]" },
    { label: "AUDIT PROTOCOL", value: "IMMUTABLE LEDGER", color: "text-white" },
    { label: "FACTORY BATCHES", value: "100% TRACEABLE", color: "text-[#06B6D4]" },
    { label: "DEFECT SCRAP TOLERANCE", value: "ZERO-TOLERANCE", color: "text-[#10B981]" },
    { label: "ADMIN INCIDENT DISPATCH", value: "LIVE AUTOMATION", color: "text-[#8B5CF6]" },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-[#F3F4F6] selection:bg-[#8B5CF6]/30 selection:text-white overflow-hidden">
      {/* FLOATING AMBIENT ORBS & BACKGROUND GRADIENTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Top Center Violet Glow */}
        <div 
          className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full bg-[rgba(139,92,246,0.35)] blur-[120px] animate-float-orb1"
        />
        {/* Left Center Cyan Glow */}
        <div 
          className="absolute top-[35%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[rgba(6,182,212,0.12)] blur-[110px] animate-float-orb2"
        />
        {/* Bottom Right Subtle Violet Glow */}
        <div 
          className="absolute bottom-[10%] -right-[5%] w-[450px] h-[450px] rounded-full bg-[rgba(139,92,246,0.18)] blur-[100px] animate-float-orb1"
        />
        {/* Tech Grid Overlay */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        />
      </div>

      {/* FIXED NAVIGATION PILL */}
      <nav 
        aria-label="Synapse Floating Navigation"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[672px] rounded-full px-4 py-2.5 flex items-center justify-between glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10"
      >
        {/* Left-aligned logo (4px gradient circle + Instrument Serif text) */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#8B5CF6] via-[#06B6D4] to-[#10B981] shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          <span className="font-serif-instrument text-xl tracking-tight text-white font-normal">
            Synapse
          </span>
          <span className="text-[9px] font-mono tracking-widest text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-1.5 py-0.5 rounded-full uppercase">
            2.0
          </span>
        </div>

        {/* Center-aligned links (12px uppercase Inter, neutral-400) */}
        <div className="hidden sm:flex items-center space-x-6 text-[12px] font-semibold uppercase tracking-wider text-neutral-400 font-inter">
          <a 
            href="#architecture" 
            className="hover:text-white transition-colors duration-200"
          >
            Architecture
          </a>
          <a 
            href="#features" 
            className="hover:text-white transition-colors duration-200"
          >
            Features
          </a>
          <a 
            href="#code" 
            className="hover:text-white transition-colors duration-200"
          >
            API
          </a>
        </div>

        {/* Right-aligned CTA (White background, black text, rounded-full) */}
        <button
          onClick={onLaunchTracker}
          className="rounded-full bg-white text-black text-xs font-semibold px-4 py-2 hover:bg-neutral-200 active:scale-95 transition-all duration-200 flex items-center space-x-1.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
        >
          <span>Launch Tracker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-8 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-300">
            Autonomous Factory Intelligence
          </span>
        </div>

        {/* Massive Font-Serif Heading */}
        <h1 className="font-serif-instrument text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] leading-[0.92] text-white max-w-5xl mb-8">
          Stage-wise piece precision, zero loss <span className="text-shimmer italic font-normal">intelligence.</span>
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl text-neutral-400 text-base sm:text-lg lg:text-xl font-normal leading-relaxed mb-12 font-inter">
          Synapse replaces fragmented spreadsheets with an immutable 5-stage tracking neural network. Every piece is verified through Cutting, Stitching, QC, Finishing, and Packing with instant shortage detection.
        </p>

        {/* Interactive CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
          {/* Primary Shiny Border Button */}
          <div 
            onClick={onLaunchTracker}
            className="shiny-border-btn"
            role="button"
            tabIndex={0}
          >
            <div className="shiny-border-btn-inner flex items-center space-x-3">
              <span className="text-white text-sm sm:text-base font-semibold tracking-wide">
                Deploy Production System
              </span>
              <ArrowRight className="w-4 h-4 text-[#06B6D4] transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Secondary Text Link */}
          <button
            onClick={onOpenDashboard}
            className="text-neutral-400 hover:text-white text-sm font-semibold tracking-wide flex items-center space-x-2 px-5 py-3 rounded-full hover:bg-white/[0.04] transition-all transition-snappy cursor-pointer"
          >
            <span>Inspect Live Analytics</span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Micro System Indicators */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 border-t border-white/5 pt-8 max-w-3xl w-full">
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-light text-white block">5/5</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mt-1 block">
              Sequential Stages
            </span>
          </div>
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-light text-[#06B6D4] block">0.00%</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mt-1 block">
              Unaccounted Pieces
            </span>
          </div>
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-light text-[#8B5CF6] block">&lt;100ms</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mt-1 block">
              Admin Dispatch
            </span>
          </div>
          <div>
            <span className="font-mono text-2xl sm:text-3xl font-light text-[#10B981] block">100%</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mt-1 block">
              Audit Accuracy
            </span>
          </div>
        </div>
      </section>

      {/* METRICS TICKER */}
      <section className="relative z-10 w-full overflow-hidden bg-black/40 border-y border-white/5 py-4">
        <div className="flex animate-ticker whitespace-nowrap">
          {/* First loop */}
          {tickerItems.map((item, idx) => (
            <div key={`ticker-1-${idx}`} className="inline-flex items-center space-x-3 px-8">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                {item.label}:
              </span>
              <span className={`text-sm sm:text-base font-mono font-medium ${item.color}`}>
                {item.value}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20 ml-6" />
            </div>
          ))}
          {/* Duplicate loop for seamless infinite scroll */}
          {tickerItems.map((item, idx) => (
            <div key={`ticker-2-${idx}`} className="inline-flex items-center space-x-3 px-8">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                {item.label}:
              </span>
              <span className={`text-sm sm:text-base font-mono font-medium ${item.color}`}>
                {item.value}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20 ml-6" />
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8B5CF6] block mb-3">
            Core Architecture
          </span>
          <h2 className="font-serif-instrument text-4xl sm:text-6xl text-white tracking-tight leading-tight">
            Designed for high-precision manufacturing.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-4">
            Engineered from ground up to block lost garments before bundles leave the workstation.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div 
            onClick={onLaunchTracker}
            className="group relative rounded-3xl p-10 bg-white/[0.02] border border-white/5 hover:border-[#8B5CF6]/40 hover:-translate-y-3 hover:bg-white/[0.035] transition-all transition-snappy hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.35)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 transition-snappy">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="font-serif-instrument text-2xl text-white mb-3 tracking-normal">
              Stage-wise Piece Lineage
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-inter">
              Pieces flow sequentially from Cutting to Stitching, QC, Finishing, and Packing. Output from each stage automatically presets the baseline input for the next workstation.
            </p>
            <div className="mt-8 flex items-center text-xs font-mono text-[#8B5CF6] group-hover:text-white transition-colors">
              <span>EXPLORE PIPELINE</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Feature 2 */}
          <div 
            onClick={onOpenReports}
            className="group relative rounded-3xl p-10 bg-white/[0.02] border border-white/5 hover:border-[#06B6D4]/40 hover:-translate-y-3 hover:bg-white/[0.035] transition-all transition-snappy hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.35)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 transition-snappy">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-serif-instrument text-2xl text-white mb-3 tracking-normal">
              Live Discrepancy Matrix
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-inter">
              Auto-calculates shortages and surplus tallies in real-time. If count doesn't balance, submission is halted until operators provide mandatory incident reasons and dispatch alerts.
            </p>
            <div className="mt-8 flex items-center text-xs font-mono text-[#06B6D4] group-hover:text-white transition-colors">
              <span>VIEW INCIDENT SYSTEM</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Feature 3 */}
          <div 
            onClick={onOpenDashboard}
            className="group relative rounded-3xl p-10 bg-white/[0.02] border border-white/5 hover:border-[#10B981]/40 hover:-translate-y-3 hover:bg-white/[0.035] transition-all transition-snappy hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.35)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 transition-snappy">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-serif-instrument text-2xl text-white mb-3 tracking-normal">
              Immutable Yield Auditing
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-inter">
              Full factory transparency with 6 audit reports. Track operator yield percentages, defect categorizations, bundle losses, and high-loss alerts with instant CSV and PDF exports.
            </p>
            <div className="mt-8 flex items-center text-xs font-mono text-[#10B981] group-hover:text-white transition-colors">
              <span>INSPECT ANALYTICS</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* CODE INTEGRATION BLOCK */}
      <section id="code" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#06B6D4] block mb-2">
            Developer & System Integration
          </span>
          <h2 className="font-serif-instrument text-3xl sm:text-5xl text-white">
            Programmatic Garment Neural Flow
          </h2>
        </div>

        {/* Dark IDE-style window */}
        <div className="rounded-3xl border border-white/10 bg-[#080808]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Window Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]">
            {/* Window Controls */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>

            {/* File name */}
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-neutral-500" />
              <span className="font-mono text-xs text-neutral-400">synapse.pipeline.ts</span>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax-highlighted code block */}
          <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-neutral-300">
            <p><span className="text-[#8B5CF6]">import</span> &#123; <span className="text-[#06B6D4]">SynapseEngine</span>, <span className="text-[#06B6D4]">ProductionPipeline</span> &#125; <span className="text-[#8B5CF6]">from</span> <span className="text-[#10B981]">"@synapse/core"</span>;</p>
            <p className="mt-3 text-neutral-500">// Initialize stage-wise zero-loss tracking pipeline</p>
            <p><span className="text-[#8B5CF6]">const</span> pipeline = <span className="text-[#8B5CF6]">new</span> <span className="text-[#06B6D4]">ProductionPipeline</span>(&#123;</p>
            <p className="pl-4">batchId: <span className="text-[#10B981]">"BATCH-2026-001"</span>,</p>
            <p className="pl-4">stages: [<span className="text-[#10B981]">"Cutting"</span>, <span className="text-[#10B981]">"Stitching"</span>, <span className="text-[#10B981]">"QC"</span>, <span className="text-[#10B981]">"Finishing"</span>, <span className="text-[#10B981]">"Packing"</span>],</p>
            <p className="pl-4">strictAccountability: <span className="text-[#8B5CF6]">true</span>,</p>
            <p className="pl-4">zeroLossProtocol: <span className="text-[#8B5CF6]">true</span></p>
            <p>&#125;);</p>
            <p className="mt-3 text-neutral-500">// Autonomous piece-level verification & loss interception</p>
            <p>pipeline.<span className="text-[#06B6D4]">onStageTransition</span>(<span className="text-[#8B5CF6]">async</span> (&#123; stage, received, passed, rejected, missing &#125;) =&gt; &#123;</p>
            <p className="pl-4"><span className="text-[#8B5CF6]">if</span> (missing &gt; <span className="text-white">0</span>) &#123;</p>
            <p className="pl-8"><span className="text-[#8B5CF6]">await</span> <span className="text-[#06B6D4]">SynapseEngine</span>.<span className="text-[#06B6D4]">dispatchDiscrepancyIncident</span>(&#123;</p>
            <p className="pl-12">variance: -missing,</p>
            <p className="pl-12">notifyAdmin: <span className="text-[#8B5CF6]">true</span>,</p>
            <p className="pl-12">mandatoryReasonEnforced: <span className="text-[#8B5CF6]">true</span></p>
            <p className="pl-8">&#125;);</p>
            <p className="pl-4">&#125;</p>
            <p className="pl-4"><span className="text-[#8B5CF6]">return</span> &#123; status: <span className="text-[#10B981]">"LOCKED_IMMUTABLE"</span>, yieldRate: (passed / received) * <span className="text-white">100</span> &#125;;</p>
            <p>&#125;);</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#050505] border-t border-white/5 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/5">
            {/* Branding */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4]" />
                <span className="font-serif-instrument text-2xl text-white">Synapse</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed max-w-xs font-inter">
                Futuristic editorial manufacturing architecture. Precision tracking from raw fabric rolls to final export shipping bundles.
              </p>
            </div>

            {/* Column 1 */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block mb-4 font-semibold">
                SYSTEM PIPELINE
              </span>
              <ul className="space-y-2.5 text-xs text-neutral-500 font-inter">
                <li><button onClick={onLaunchTracker} className="hover:text-white transition-colors cursor-pointer">Cutting Stage</button></li>
                <li><button onClick={onLaunchTracker} className="hover:text-white transition-colors cursor-pointer">Stitching Line</button></li>
                <li><button onClick={onLaunchTracker} className="hover:text-white transition-colors cursor-pointer">Quality Control</button></li>
                <li><button onClick={onLaunchTracker} className="hover:text-white transition-colors cursor-pointer">Finishing & Ironing</button></li>
                <li><button onClick={onLaunchTracker} className="hover:text-white transition-colors cursor-pointer">Packing Verification</button></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block mb-4 font-semibold">
                GOVERNANCE & AUDIT
              </span>
              <ul className="space-y-2.5 text-xs text-neutral-500 font-inter">
                <li><button onClick={onOpenReports} className="hover:text-white transition-colors cursor-pointer">Discrepancy Reports</button></li>
                <li><button onClick={onOpenReports} className="hover:text-white transition-colors cursor-pointer">Operator Performance</button></li>
                <li><button onClick={onOpenReports} className="hover:text-white transition-colors cursor-pointer">High Loss Thresholds</button></li>
                <li><button onClick={onOpenReports} className="hover:text-white transition-colors cursor-pointer">Immutable Audit Logs</button></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block mb-4 font-semibold">
                ENTERPRISE
              </span>
              <ul className="space-y-2.5 text-xs text-neutral-500 font-inter">
                <li><button onClick={onOpenDashboard} className="hover:text-white transition-colors cursor-pointer">Live Flow Metrics</button></li>
                <li><button onClick={onLaunchTracker} className="hover:text-white transition-colors cursor-pointer">PWA Mobile Station</button></li>
                <li><a href="https://github.com/boopathivellaichamy0-png/TASKORA-AI" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1"><span>GitHub Repository</span><ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
            <div>
              &copy; {new Date().getFullYear()} Synapse Neural Manufacturing. All rights reserved.
            </div>

            {/* Emerald Operational Status Indicator */}
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
              <span className="text-[#10B981] font-semibold text-[11px] tracking-wide">
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
