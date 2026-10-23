import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { 
  Scissors, 
  AlertTriangle, 
  Shield, 
  RotateCcw, 
  Layers, 
  BarChart3, 
  FileText, 
  Package, 
  Download,
  Check
} from 'lucide-react';

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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-700 flex items-center justify-center shadow-xs shrink-0">
                <Scissors className="w-4 h-4 text-white transform -rotate-45" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900">
                    Taskora<span className="text-indigo-600 font-extrabold">.AI</span>
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 rounded-full tracking-wide">
                    Garment Tracker
                  </span>
                  {isInstalled && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                      App
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 hidden md:block">
                  Stage-wise Piece Accountability & Loss Detection
                </p>
              </div>
            </div>

            {/* Desktop Nav Tabs */}
            <nav className="hidden md:flex items-center space-x-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/80">
              <button
                onClick={() => onTabChange('tracker')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                  activeTab === 'tracker'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                Stage Tracker
              </button>
              <button
                onClick={() => onTabChange('dashboard')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                Live Dashboard
              </button>
              <button
                onClick={() => onTabChange('reports')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                Reports & Audit
              </button>
              <button
                onClick={() => onTabChange('master')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                  activeTab === 'master'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                Products & Batches
              </button>
            </nav>

            {/* Right Side: Install Button, Alerts, Role Switcher */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              {/* Install PWA Prompt on mobile/desktop */}
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-xs cursor-pointer"
                  title="Install Taskora AI App on your device"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Install App</span>
                </button>
              )}

              {/* Discrepancy Alert Pill */}
              {discrepancyCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenAlerts}
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-semibold shadow-xs hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Open Discrepancy Reports"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                  <span className="hidden sm:inline">{discrepancyCount} Discrepanc{discrepancyCount > 1 ? 'ies' : 'y'}</span>
                  <span className="sm:hidden">{discrepancyCount}</span>
                </button>
              )}

              {/* Alerts icon button */}
              <button
                onClick={onOpenAlerts}
                className="relative p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors shadow-xs cursor-pointer"
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
                <Shield className="w-3.5 h-3.5 text-indigo-600 ml-1 mr-1" />
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

              {/* Reset button (Desktop) */}
              <button
                onClick={onResetData}
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 text-xs transition-colors shadow-xs cursor-pointer"
                title="Reset to default demo data"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* NATIVE APP MOBILE BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-4 h-15">
          <button
            onClick={() => onTabChange('tracker')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-100 active:scale-95 cursor-pointer ${
              activeTab === 'tracker'
                ? 'text-indigo-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${activeTab === 'tracker' ? 'bg-indigo-50 text-indigo-700' : ''}`}>
              <Scissors className="w-4 h-4 transform -rotate-45" />
            </div>
            <span className="text-[10px] tracking-tight">Tracker</span>
          </button>

          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-100 active:scale-95 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-indigo-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : ''}`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-100 active:scale-95 cursor-pointer ${
              activeTab === 'reports'
                ? 'text-indigo-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-700' : ''}`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">Reports</span>
          </button>

          <button
            onClick={() => onTabChange('master')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-100 active:scale-95 cursor-pointer ${
              activeTab === 'master'
                ? 'text-indigo-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className={`p-1 rounded-md transition-colors ${activeTab === 'master' ? 'bg-indigo-50 text-indigo-700' : ''}`}>
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">Batches</span>
          </button>
        </div>
      </nav>
    </>
  );
};
