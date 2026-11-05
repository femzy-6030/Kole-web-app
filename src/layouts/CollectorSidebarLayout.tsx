// src/layouts/CollectorSidebarLayout.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useClusterStore } from '../store/useClusterStore';
import AddCustomerModal from '../components/collector/AddCustomerModal';
import { exportLedgerToCSV, DEFAULT_HOUSEHOLD_CUSTOMERS } from '../components/collector/CollectorCustomerLedger';
import {
  Truck,
  Users,
  MapPin,
  UserPlus,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  Radio,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  LifeBuoy,
} from 'lucide-react';

export type CollectorNavSection = 'requests' | 'ledger' | 'zones' | 'profiles' | 'assistances';

interface CollectorSidebarLayoutProps {
  activeSection?: CollectorNavSection | string;
  onNavigate?: (sectionKey: CollectorNavSection | string, path: string) => void;
  children: React.ReactNode;
}

export default function CollectorSidebarLayout({
  activeSection = 'requests',
  onNavigate,
  children,
}: CollectorSidebarLayoutProps) {
  const { user, logout } = useAuthStore();
  const { registeredCollectors, assistanceTickets } = useClusterStore();

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeCollector =
    (registeredCollectors && registeredCollectors[0]) ||
    user || {
      id: 'COL-1001',
      companyName: 'Osogbo Central Cleaners Ltd',
      phone: '08012345678',
      Area: 'Oke-Fia',
      cluster: 'Oke-Fia Zone',
      assignedCluster: 'Oke-Fia Zone',
    };

  const assignedClusterName =
    activeCollector.assignedCluster ||
    activeCollector.cluster ||
    `${activeCollector.Area || 'Oke-Fia'} Zone`;

  // Enterprise Sidebar Modules
  const navItems = [
    {
      key: 'requests',
      path: '/collector/dashboard',
      label: 'Live Dispatch',
      icon: Truck,
      badge: '3 Live',
    },
    {
      key: 'ledger',
      path: '/collector/ledger',
      label: 'Customer Ledger',
      icon: Users,
      badge: 'Billing',
    },
    {
      key: 'zones',
      path: '/collector/zones',
      label: 'Cluster Zones',
      icon: MapPin,
      badge: null,
    },
    {
      key: 'assistances',
      path: '/collector/assistances',
      label: 'Support & Assist',
      icon: LifeBuoy,
      badge: (assistanceTickets || []).filter((t: any) => t.status !== 'Resolved').length || null,
    },
    {
      key: 'profiles',
      path: '/collector/profiles',
      label: 'Settings & Fleet',
      icon: Settings,
      badge: 'Verified',
    },
  ];

  const handleNavClick = (key: string, path: string) => {
    if (onNavigate) {
      onNavigate(key, path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
    setIsMobileMenuOpen(false);
  };

  const handleTriggerCSVExport = () => {
    let dataset = DEFAULT_HOUSEHOLD_CUSTOMERS;
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('kole-households-ledger');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) dataset = parsed;
        }
      }
    } catch {}

    exportLedgerToCSV(dataset, activeCollector.companyName || 'Osogbo_Cleaners');
    setExportNotice('Customer ledger CSV downloaded successfully!');
    setTimeout(() => setExportNotice(null), 3000);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/collector');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleSwitchToResident = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100 antialiased">
      {/* ======================================================== */}
      {/* DESKTOP PERSISTENT DRAWER (w-72 bg-slate-900 border-r)   */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen justify-between p-4 z-30 shadow-2xl">
        <div className="space-y-5">
          {/* Brand Header */}
          <div className="px-2 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shadow-inner">
                <Truck size={20} />
              </span>
              <div>
                <h1 className="font-black text-sm text-white tracking-wider flex items-center gap-1.5">
                  <span>KÓLẸ̀</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    PORTAL
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Fleet Operations
                </p>
              </div>
            </div>

            <span className="relative flex h-2.5 w-2.5" title="Live Dispatch Socket Active">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          {/* Operator Profile Card */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active Fleet Lead
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">
                {isOnDuty ? '🟢 On Duty' : '⚪ Standby'}
              </span>
            </div>
            <div>
              <p className="font-black text-white text-xs truncate">
                {activeCollector.companyName || 'Osogbo Central Cleaners'}
              </p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-emerald-400 shrink-0" />
                <span className="truncate">{assignedClusterName} Base</span>
              </p>
            </div>
          </div>

          {/* Primary Operations Modules */}
          <nav className="space-y-1 text-xs">
            <p className="px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">
              Management Modules
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavClick(item.key, item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Actions Header */}
            <p className="px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider pt-3 mb-2">
              Quick Operator Actions
            </p>

            {/* Assisted Onboarding Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UserPlus size={16} />
                <span>+ Onboard Client</span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-400 text-slate-950 rounded">
                NEW
              </span>
            </button>

            {/* CSV Export Action Button */}
            <button
              type="button"
              onClick={handleTriggerCSVExport}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer border border-slate-800"
            >
              <FileSpreadsheet size={16} className="text-emerald-400" />
              <span>Export Ledger CSV</span>
            </button>
          </nav>
        </div>

        {/* Bottom Options & Sign Out */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
          <button
            type="button"
            onClick={handleSwitchToResident}
            className="w-full py-2 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
          >
            <ExternalLink size={13} />
            <span>Resident App View</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-2 px-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
          >
            <LogOut size={13} />
            <span>Operator Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE STICKY TOP BAR (Phone Viewports < md)             */}
      {/* ======================================================== */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-3.5 px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div>
            <h1 className="font-black text-xs text-white flex items-center gap-1">
              <span>KÓLẸ̀</span>
              <span className="text-[9px] text-emerald-400 font-mono">OPERATOR</span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
              {activeCollector.companyName || 'Osogbo Central'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Onboard Mobile Button */}
          <button
            type="button"
            onClick={() => setIsOnboardModalOpen(true)}
            className="p-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Onboard Client"
          >
            <UserPlus size={15} />
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-xl"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE SLIDE-OUT DRAWER OVERLAY                          */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85%] bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Truck size={18} />
                  </span>
                  <div>
                    <h2 className="font-black text-xs text-white">KÓLẸ̀ Portal</h2>
                    <p className="text-[10px] text-slate-400">{assignedClusterName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Items in Drawer */}
              <nav className="space-y-1.5 text-xs">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleNavClick(item.key, item.path)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsOnboardModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <UserPlus size={16} />
                    <span>+ Onboard Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerCSVExport}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-slate-300 bg-slate-950 border border-slate-800"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-400" />
                    <span>Export Ledger CSV</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Mobile Drawer Bottom */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <button
                type="button"
                onClick={handleSwitchToResident}
                className="w-full py-2 px-3 rounded-xl text-slate-400 hover:text-white font-bold flex items-center gap-2"
              >
                <ExternalLink size={14} />
                <span>Resident & Household App</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2 px-3 rounded-xl text-rose-400 font-bold flex items-center gap-2 bg-rose-950/20 border border-rose-900/30"
              >
                <LogOut size={14} />
                <span>Operator Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN CONTENT WORKSPACE                                   */}
      {/* ======================================================== */}
      <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 min-h-screen overflow-y-auto">
        {/* Top Header inside Workspace */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              <span>KÓLẸ̀ Municipal Systems</span>
              <span>•</span>
              <span className="text-emerald-400">{assignedClusterName} Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white capitalize">
              {navItems.find((n) => n.key === activeSection)?.label || 'Operations Bay'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* On Duty Status Toggle */}
            <button
              type="button"
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                isOnDuty
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Radio size={12} className={isOnDuty ? 'animate-pulse text-emerald-400' : ''} />
              <span>{isOnDuty ? 'Dispatch Stream: LIVE' : 'Dispatch: PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Global CSV Export Download Notification */}
        {exportNotice && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-2 text-xs animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-bold">{exportNotice}</span>
          </div>
        )}

        {/* Main Workspace Child Content */}
        <div className="animate-in fade-in duration-150">{children}</div>
      </main>

      {/* ======================================================== */}
      {/* SHARED CLIENT ONBOARDING MODAL                           */}
      {/* ======================================================== */}
      <AddCustomerModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        defaultCluster={assignedClusterName}
      />
    </div>
  );
}

