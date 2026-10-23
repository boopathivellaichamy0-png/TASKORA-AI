import React from 'react';
import { UserRole } from '../types';
import { Scissors, AlertTriangle, Shield, RotateCcw, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
  alertCount: number;
  discrepancyCount?: number;
  onOpenAlerts: () => void;
  activeTab: 'tracker' | 'dashboard' | 'master' | 'reports';
  onTabChange: (tab: 'tracker' | 'dashboard' | 'master' | 'reports') => void;
}

const ROLES: UserRole[] = ['Admin', 'Stage Supervisor', 'Operator', 'QC Inspector', 'Viewer'];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onResetData,
  alertCount,
  discrepancyCount = 0,
  onOpenAlerts,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-indigo-500/20 shadow-lg">
              <Scissors className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Taskora<span className="text-indigo-400">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-full uppercase tracking-wider">
                  Garment Tracker
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Stage-wise Piece Accountability & Loss Detection
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => onTabChange('tracker')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'tracker'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Stage Tracker
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Live Dashboard
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Reports & Audit
            </button>
            <button
              onClick={() => onTabChange('master')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'master'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Products & Batches
            </button>
          </nav>

          {/* Right Side: Alerts, Role Switcher & Reset */}
          <div className="flex items-center space-x-3">
            {/* Discrepancy Alert Pill (If open discrepancies exist) */}
            {discrepancyCount > 0 && (
              <button
                type="button"
                onClick={onOpenAlerts}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-600/80 text-rose-300 text-xs font-bold shadow-md shadow-rose-950 animate-pulse hover:bg-rose-900"
                title="Open Discrepancy Reports"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>🚨 {discrepancyCount} Discrepanc{discrepancyCount > 1 ? 'ies' : 'y'}</span>
              </button>
            )}

            {/* Alerts button */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="View Alerts & Discrepancies"
            >
              <AlertTriangle className={`w-4 h-4 ${alertCount > 0 || discrepancyCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              {(alertCount > 0 || discrepancyCount > 0) && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                  {alertCount + discrepancyCount}
                </span>
              )}
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-1">
              <Shield className="w-3.5 h-3.5 text-indigo-400 ml-1.5 mr-1" />
              <select
                aria-label="Active User Role"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-900 text-slate-100">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset button */}
            <button
              onClick={onResetData}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/70 text-xs transition-colors"
              title="Reset to default demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/70 text-xs">
          <button
            onClick={() => onTabChange('tracker')}
            className={`px-3 py-1 rounded ${activeTab === 'tracker' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Tracker
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1 rounded ${activeTab === 'dashboard' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('reports')}
            className={`px-3 py-1 rounded ${activeTab === 'reports' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Reports
          </button>
          <button
            onClick={() => onTabChange('master')}
            className={`px-3 py-1 rounded ${activeTab === 'master' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Batches
          </button>
        </div>
      </div>
    </header>
  );
};
