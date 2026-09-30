import React from 'react';
import { AppUser } from '../types/insurance';
import { UserCheck, Plus, ShieldCheck } from 'lucide-react';

interface TopNavProps {
  activeTab: 'claims' | 'quoting' | 'customer360' | 'approvals' | 'architecture';
  setActiveTab: (tab: 'claims' | 'quoting' | 'customer360' | 'approvals' | 'architecture') => void;
  currentUser: AppUser;
  onUserChange: (user: AppUser) => void;
  users: AppUser[];
  onOpenNewQuote: () => void;
  pendingApprovalsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  users,
  onOpenNewQuote,
  pendingApprovalsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* 1-Row 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-wider">
            ML
          </div>
          <button
            onClick={() => setActiveTab('claims')}
            className="text-left font-bold text-base tracking-tight text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Multi-Line Insurance Cloud
          </button>
        </div>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'claims'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Claims Dashboard (LWC)
          </button>

          <button
            onClick={() => setActiveTab('quoting')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'quoting'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Quoting Flow
          </button>

          <button
            onClick={() => setActiveTab('customer360')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'customer360'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Customer 360°
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`relative px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'approvals'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            High-Value Approvals
            {pendingApprovalsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'architecture'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Apex & Schema
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Persona / User Selector */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold leading-none">
                Role: {currentUser.role} {currentUser.territoryState !== 'All' ? `(${currentUser.territoryState})` : ''}
              </span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = users.find(x => x.id === e.target.value);
                  if (u) onUserChange(u);
                }}
                className="text-xs font-medium text-slate-800 bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-pointer"
                title="Switch active user profile to test permission sets and sharing rules"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onOpenNewQuote}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote Flow</span>
          </button>
        </div>

      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-100 px-4 py-2 gap-1 scrollbar-none">
        {(['claims', 'quoting', 'customer360', 'approvals', 'architecture'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {tab === 'claims' && 'Claims'}
            {tab === 'quoting' && 'Quoting'}
            {tab === 'customer360' && 'Customer 360°'}
            {tab === 'approvals' && `Approvals (${pendingApprovalsCount})`}
            {tab === 'architecture' && 'Schema & Tests'}
          </button>
        ))}
      </div>
    </header>
  );
};
