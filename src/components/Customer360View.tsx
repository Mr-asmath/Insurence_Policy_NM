import React, { useState, useEffect } from 'react';
import { Contact, Policy, Claim, InsuranceLine } from '../types/insurance';
import { insuranceStore } from '../services/insuranceStore';
import { User, Phone, Mail, MapPin, Truck, Home, Shield, AlertTriangle, Plus, FileText, CheckCircle2, ChevronRight, ArrowUpRight } from 'lucide-react';

interface Customer360ViewProps {
  onQuoteForCustomer: (customerId: string, line: InsuranceLine) => void;
  onSelectClaim: (claimId: string) => void;
  onOpenQuickAction: (claimId: string) => void;
  onFileClaimForPolicy: (policyId: string) => void;
}

export const Customer360View: React.FC<Customer360ViewProps> = ({
  onQuoteForCustomer,
  onSelectClaim,
  onOpenQuickAction,
  onFileClaimForPolicy
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  const refreshData = () => {
    const allContacts = insuranceStore.getContacts();
    setContacts(allContacts);
    if (!selectedContactId && allContacts.length > 0) {
      setSelectedContactId(allContacts[0].id);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = insuranceStore.subscribe(refreshData);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      setPolicies(insuranceStore.getPoliciesForCustomer(selectedContactId));
      setClaims(insuranceStore.getClaimsForCustomer(selectedContactId));
    }
  }, [selectedContactId, contacts]);

  const activeContact = contacts.find(c => c.id === selectedContactId);

  // Check product coverage for cross-selling recommendations
  const hasAuto = policies.some(p => p.recordType === 'Auto');
  const hasProperty = policies.some(p => p.recordType === 'Property');
  const hasLife = policies.some(p => p.recordType === 'Life');

  const totalPremium = policies.reduce((acc, p) => acc + p.premium, 0);
  const totalClaimsAmount = claims.reduce((acc, c) => acc + c.claimAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Selector: Customer Account Directory */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Customer 360° Portfolio &amp; Cross-Sell Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Unified single-pane view across Vehicle, Property, and Life policies and claim histories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Select Customer:</span>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-3 py-1.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.state} — {c.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeContact && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Customer Profile Card & Cross-Sell Engine */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {activeContact.firstName[0]}{activeContact.lastName[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeContact.firstName} {activeContact.lastName}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                      ID: {activeContact.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-700 font-semibold">{activeContact.state} Territory</span>
                  </div>
                </div>
              </div>

              <div className="py-3 space-y-2 text-xs border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeContact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeContact.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{activeContact.streetAddress}, {activeContact.city}, {activeContact.state} {activeContact.zipCode}</span>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="pt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Total Premium:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ${totalPremium.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Active Policies:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {policies.length} {policies.length === 1 ? 'Line' : 'Lines'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cross-Sell Recommendations Box */}
            <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-200/80 rounded-lg p-5">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                Multi-Line Cross-Sell Insights
              </h4>
              <p className="text-xs text-blue-800 mb-3">
                Unifying vehicle, property, and life unlocks bundle discounts and lowers carrier retention churn.
              </p>

              <div className="space-y-2">
                {!hasAuto && (
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-blue-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-800">Auto Policy Missing</span>
                    </div>
                    <button
                      onClick={() => onQuoteForCustomer(activeContact.id, 'Auto')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Quote Auto</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {!hasProperty && (
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-800">Property Missing</span>
                    </div>
                    <button
                      onClick={() => onQuoteForCustomer(activeContact.id, 'Property')}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Quote Home</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {!hasLife && (
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-purple-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-slate-800">Term Life Missing</span>
                    </div>
                    <button
                      onClick={() => onQuoteForCustomer(activeContact.id, 'Life')}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <span>Quote Life</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {hasAuto && hasProperty && hasLife && (
                  <div className="p-3 rounded bg-emerald-100/60 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      <strong>Full Portfolio Gold Status:</strong> Customer holds policies across all 3 insurance lines!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Active Policies & Claim History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Policies Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Insurance Policies ({policies.length})
                  </h3>
                </div>
                <button
                  onClick={() => onQuoteForCustomer(activeContact.id, 'Auto')}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line of Coverage</span>
                </button>
              </div>

              {policies.length > 0 ? (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/40 text-xs flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                          policy.recordType === 'Auto' ? 'bg-blue-100 text-blue-700' :
                          policy.recordType === 'Property' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {policy.recordType === 'Auto' && <Truck className="w-4 h-4" />}
                          {policy.recordType === 'Property' && <Home className="w-4 h-4" />}
                          {policy.recordType === 'Life' && <Shield className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs">{policy.id}</span>
                            <span className="font-semibold text-slate-800">{policy.recordType} Line</span>
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {policy.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {policy.recordType === 'Auto' && (
                              <span>VIN: <code className="font-mono">{policy.vin}</code> · Year: {policy.modelYear}</span>
                            )}
                            {policy.recordType === 'Property' && (
                              <span>Sq Ft: {policy.squareFootage} · Built: {policy.yearBuilt} · {policy.propertyAddress}</span>
                            )}
                            {policy.recordType === 'Life' && (
                              <span>Beneficiary: {policy.beneficiaryName} · Term: {policy.policyTermMonths} mo</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Annual Premium</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            ${policy.premium.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <button
                          onClick={() => onFileClaimForPolicy(policy.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
                        >
                          + File Claim
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active policies for this customer yet.
                </div>
              )}
            </div>

            {/* Historical Claims Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Claims History ({claims.length})
                  </h3>
                </div>
                {claims.length > 0 && (
                  <span className="text-xs text-slate-500 font-mono">
                    Total Incurred: ${totalClaimsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {claims.length > 0 ? (
                <div className="space-y-3">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{claim.claimNumber}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-700">{claim.recordType} Loss</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-mono">{claim.policyId}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            ${claim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            claim.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            claim.approvalStatus === 'Submitted for Approval' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            claim.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            {claim.approvalStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-600 italic text-[11px]">
                        "{claim.description}"
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Assigned to: <strong className="text-slate-700">{claim.ownerName}</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectClaim(claim.id)}
                            className="text-slate-700 hover:text-slate-900 font-medium"
                          >
                            Details
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => onOpenQuickAction(claim.id)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Review / Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No claims recorded for this customer.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
