import React, { useState, useEffect } from 'react';
import { ClaimWrapper, AppUser } from '../types/insurance';
import { insuranceStore } from '../services/insuranceStore';
import { ClaimTileLwc } from './ClaimTileLwc';
import { ShieldCheck, Filter, AlertTriangle, Layers, UserCheck } from 'lucide-react';

interface ClaimsDashboardLwcProps {
  currentUser: AppUser;
  onSelectClaim: (claimId: string) => void;
  onOpenQuickAction: (claimId: string) => void;
  onNewClaim: () => void;
}

export const ClaimsDashboardLwc: React.FC<ClaimsDashboardLwcProps> = ({
  currentUser,
  onSelectClaim,
  onOpenQuickAction,
  onNewClaim
}) => {
  const [selectedPolicyType, setSelectedPolicyType] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'queue' | 'high_value'>('all');
  const [territoryFilter, setTerritoryFilter] = useState<string>('All');
  const [claimsList, setClaimsList] = useState<ClaimWrapper[]>([]);

  // Wire service simulation: refreshes when store updates or filters change
  const refreshClaims = () => {
    const claims = insuranceStore.getAssignedClaims({
      filterPolicyType: selectedPolicyType,
      filterTerritory: territoryFilter,
      filterOwner: ownerFilter
    });
    setClaimsList(claims);
  };

  useEffect(() => {
    refreshClaims();
    const unsubscribe = insuranceStore.subscribe(refreshClaims);
    return () => unsubscribe();
  }, [selectedPolicyType, ownerFilter, territoryFilter, currentUser]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPolicyType(e.target.value);
  };

  // Policy type options as specified in Milestone 3.2 LWC
  const policyTypeOptions = [
    { label: 'All Policy Types', value: 'All' },
    { label: 'Auto', value: 'Auto' },
    { label: 'Property', value: 'Property' },
    { label: 'Life', value: 'Life' }
  ];

  const isTerritoryRestricted = currentUser.role === 'Adjuster' && currentUser.territoryState && currentUser.territoryState !== 'All';

  return (
    <div className="space-y-6">
      {/* Territory Sharing Rule Notice if restricted */}
      {isTerritoryRestricted && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Sharing Rule Active:</strong> As a Field Adjuster for <strong>{currentUser.territoryState}</strong>, you only have visibility into claims within your state territory.
            </span>
          </div>
          <span className="text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded font-mono">
            State = {currentUser.territoryState}
          </span>
        </div>
      )}

      {/* Main Lightning Card: "My Assigned Claims Dashboard" */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        
        {/* SLDS Card Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  My Assigned Claims Dashboard
                </h1>
                <span className="text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded">
                  LWC: claimsDashboardLwc
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Apex controller query wired with client-side reactive filtering and queue routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewClaim}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              + File New Claim
            </button>
          </div>
        </div>

        {/* Controls & Filter Bar */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* 1. Policy Type Combobox (lightning-combobox) */}
            <div>
              <label htmlFor="policyFilter" className="block text-xs font-semibold text-slate-700 mb-1">
                Filter by Policy Type
              </label>
              <select
                id="policyFilter"
                value={selectedPolicyType}
                onChange={handleFilterChange}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {policyTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Scope / Owner Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignment Scope
              </label>
              <div className="flex rounded border border-slate-300 overflow-hidden bg-slate-50 text-xs">
                <button
                  type="button"
                  onClick={() => setOwnerFilter('all')}
                  className={`flex-1 py-2 px-2 text-center font-medium transition-colors ${
                    ownerFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerFilter('mine')}
                  className={`flex-1 py-2 px-2 text-center font-medium transition-colors ${
                    ownerFilter === 'mine' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Assigned
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerFilter('queue')}
                  className={`flex-1 py-2 px-2 text-center font-medium transition-colors ${
                    ownerFilter === 'queue' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Queues
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerFilter('high_value')}
                  className={`flex-1 py-2 px-2 text-center font-medium transition-colors ${
                    ownerFilter === 'high_value' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  &gt;$50k
                </button>
              </div>
            </div>

            {/* 3. Territory Filter (if unrestricted) */}
            {!isTerritoryRestricted ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Territory / State
                </label>
                <select
                  value={territoryFilter}
                  onChange={(e) => setTerritoryFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="All">All Territories</option>
                  <option value="CA">California (CA)</option>
                  <option value="TX">Texas (TX)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Territory Assignment
                </label>
                <div className="text-xs bg-slate-100 border border-slate-200 rounded px-3 py-2 text-slate-700 font-medium">
                  {currentUser.territoryState} State Queue (Fixed by Sharing Rule)
                </div>
              </div>
            )}

            {/* 4. Reset Filters button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPolicyType('All');
                  setOwnerFilter('all');
                  setTerritoryFilter('All');
                }}
                className="w-full text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded px-3 py-2 transition-colors flex items-center justify-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Reset Filters
              </button>
            </div>

          </div>
        </div>

        {/* Content Area: Grid of ClaimTileLwc */}
        <div className="p-6">
          {claimsList.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {claimsList.map((claim) => (
                  <ClaimTileLwc
                    key={claim.claimId}
                    claimData={claim}
                    onSelectClaim={onSelectClaim}
                    onOpenQuickAction={onOpenQuickAction}
                  />
                ))}
              </div>

              {/* Total Claims Assigned count (Milestone 3.2 requirement) */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <p className="font-semibold text-slate-700">
                  Total Claims Assigned: <span className="font-mono font-bold text-slate-900">{claimsList.length}</span>
                </p>
                <p className="text-slate-400">
                  Showing real-time records joined from Policy__c and Contact objects.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                No claims currently assigned to you matching this filter.
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Try selecting "All Policy Types" or changing your territory and assignment filter criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedPolicyType('All');
                  setOwnerFilter('all');
                  setTerritoryFilter('All');
                }}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
