import React from 'react';
import { UserRole } from '../types';
import { Scissors, AlertTriangle, Shield, RotateCcw } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-700 flex items-center justify-center shadow-sm">
              <Scissors className="w-4 h-4 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-stone-900">
                  Taskora<span className="text-indigo-600 font-extrabold">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 rounded-full tracking-wide">
                  Garment Tracker
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Stage-wise Piece Accountability & Loss Detection
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/80">
            <button
              onClick={() => onTabChange('tracker')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'tracker'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              Stage Tracker
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              Live Dashboard
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'reports'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              Reports & Audit
            </button>
            <button
              onClick={() => onTabChange('master')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                activeTab === 'master'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              Products & Batches
            </button>
          </nav>

          {/* Right Side: Alerts, Role Switcher & Reset */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Discrepancy Alert Pill (If open discrepancies exist) */}
            {discrepancyCount > 0 && (
              <button
                type="button"
                onClick={onOpenAlerts}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs hover:bg-rose-100 transition-colors"
                title="Open Discrepancy Reports"
              >
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                <span>{discrepancyCount} Discrepanc{discrepancyCount > 1 ? 'ies' : 'y'}</span>
              </button>
            )}

            {/* Alerts button */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors shadow-xs"
              title="View Alerts & Discrepancies"
            >
              <AlertTriangle className={`w-4 h-4 ${alertCount > 0 || discrepancyCount > 0 ? 'text-amber-600' : 'text-stone-400'}`} />
              {(alertCount > 0 || discrepancyCount > 0) && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {alertCount + discrepancyCount}
                </span>
              )}
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-600 ml-1.5 mr-1" />
              <select
                aria-label="Active User Role"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-white text-stone-800">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset button */}
            <button
              onClick={onResetData}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 text-xs transition-colors shadow-xs"
              title="Reset to default demo data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-200 text-xs bg-stone-50/50">
          <button
            onClick={() => onTabChange('tracker')}
            className={`px-3 py-1 rounded-md ${activeTab === 'tracker' ? 'text-indigo-600 font-bold bg-white shadow-xs' : 'text-stone-600'}`}
          >
            Tracker
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1 rounded-md ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold bg-white shadow-xs' : 'text-stone-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('reports')}
            className={`px-3 py-1 rounded-md ${activeTab === 'reports' ? 'text-indigo-600 font-bold bg-white shadow-xs' : 'text-stone-600'}`}
          >
            Reports
          </button>
          <button
            onClick={() => onTabChange('master')}
            className={`px-3 py-1 rounded-md ${activeTab === 'master' ? 'text-indigo-600 font-bold bg-white shadow-xs' : 'text-stone-600'}`}
          >
            Batches
          </button>
        </div>
      </div>
    </header>
  );
};
