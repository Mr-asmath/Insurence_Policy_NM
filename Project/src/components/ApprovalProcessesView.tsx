import React, { useState, useEffect } from 'react';
import { Claim, AppUser } from '../types/insurance';
import { insuranceStore } from '../services/insuranceStore';
import { ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, XCircle, Clock, UserCheck, Check, Layers } from 'lucide-react';

interface ApprovalProcessesViewProps {
  currentUser: AppUser;
  onOpenQuickAction: (claimId: string) => void;
  onSelectClaim: (claimId: string) => void;
}

export const ApprovalProcessesView: React.FC<ApprovalProcessesViewProps> = ({
  currentUser,
  onOpenQuickAction,
  onSelectClaim
}) => {
  const [claims, setClaims] = useState<Claim[]>([]);

  const refresh = () => {
    setClaims(insuranceStore.getClaims());
  };

  useEffect(() => {
    refresh();
    const unsub = insuranceStore.subscribe(refresh);
    return () => unsub();
  }, []);

  // Filter high value claims (> $50,000)
  const highValueClaims = claims.filter(c => c.claimAmount > 50000);
  const pendingStep1 = highValueClaims.filter(c => c.approvalStatus === 'Submitted for Approval' && c.approvalStep === 1);
  const pendingStep2 = highValueClaims.filter(c => c.approvalStatus === 'Submitted for Approval' && c.approvalStep === 2);
  const finalizedHighValue = highValueClaims.filter(c => c.approvalStatus === 'Approved' || c.approvalStatus === 'Rejected');

  return (
    <div className="space-y-6">
      
      {/* Top Banner explaining the 2-step process */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                Milestone 4: Approval Process
              </span>
              <span className="text-xs text-slate-500">· Process Name: High Value Claim Approval</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              High-Value Claims Sequential 2-Step Approval Console
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Entry Criteria: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">Claim_Amount__c &gt; 50000</code>. Enforces Step 1 Senior Adjuster verification followed by Step 2 Department Manager sign-off.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Logged-in approver role:</span>
            <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded">
              {currentUser.title}
            </span>
          </div>
        </div>

        {/* Visual Process Architecture Diagram */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
              <span>Trigger Event</span>
              <span className="font-mono">&gt; $50k</span>
            </div>
            <div className="font-bold text-slate-900">Record-Triggered Flow</div>
            <div className="text-[11px] text-slate-600 mt-1">
              Sets Approval Status to 'Submitted for Approval' and assigns Step 1.
            </div>
          </div>

          <div className="p-3 rounded border border-amber-300 bg-amber-50/60">
            <div className="flex items-center justify-between text-amber-800 text-[11px] mb-1">
              <span>Step 1 Gate</span>
              <span className="font-bold">Pending: {pendingStep1.length}</span>
            </div>
            <div className="font-bold text-slate-900">Senior Adjuster Review</div>
            <div className="text-[11px] text-slate-600 mt-1">
              Validates contractor estimate, coverage, and physical loss severity.
            </div>
          </div>

          <div className="p-3 rounded border border-blue-300 bg-blue-50/60">
            <div className="flex items-center justify-between text-blue-800 text-[11px] mb-1">
              <span>Step 2 Gate</span>
              <span className="font-bold">Pending: {pendingStep2.length}</span>
            </div>
            <div className="font-bold text-slate-900">Department Manager</div>
            <div className="text-[11px] text-slate-600 mt-1">
              Executive authorization and financial disbursal sign-off.
            </div>
          </div>

          <div className="p-3 rounded border border-emerald-300 bg-emerald-50/60">
            <div className="flex items-center justify-between text-emerald-800 text-[11px] mb-1">
              <span>Final Action</span>
              <span className="font-bold">Finalized: {finalizedHighValue.length}</span>
            </div>
            <div className="font-bold text-slate-900">Final Status Update</div>
            <div className="text-[11px] text-slate-600 mt-1">
              Auto field update to 'Approved' or 'Rejected' with audit log.
            </div>
          </div>
        </div>
      </div>

      {/* Step 1 Pending Queue */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            <h3 className="text-sm font-bold text-slate-900">
              Step 1: Senior Adjuster Queue (Pending Scope Verification)
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {pendingStep1.length} Awaiting Step 1 Review
          </span>
        </div>

        {pendingStep1.length > 0 ? (
          <div className="space-y-3">
            {pendingStep1.map(claim => {
              const policy = insuranceStore.getPolicyById(claim.policyId);
              const customer = policy ? insuranceStore.getContactById(policy.customerId) : undefined;
              return (
                <div key={claim.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
                      <span>{claim.claimNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-blue-700">{claim.recordType} Line</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-amber-800 font-sans font-semibold">${claim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Policyholder: <strong>{customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'}</strong> · Policy: <span className="font-mono">{claim.policyId}</span> · State: {claim.policyAccountHolderState}
                    </div>
                    <div className="text-slate-500 italic text-[11px] mt-1">
                      "{claim.description}"
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectClaim(claim.id)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onOpenQuickAction(claim.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Review Step 1 (Senior Adjuster)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No claims currently pending Step 1 Senior Adjuster review.
          </div>
        )}
      </div>

      {/* Step 2 Pending Queue */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            <h3 className="text-sm font-bold text-slate-900">
              Step 2: Department Manager Queue (Pending Executive Sign-Off)
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {pendingStep2.length} Awaiting Executive Review
          </span>
        </div>

        {pendingStep2.length > 0 ? (
          <div className="space-y-3">
            {pendingStep2.map(claim => {
              const policy = insuranceStore.getPolicyById(claim.policyId);
              const customer = policy ? insuranceStore.getContactById(policy.customerId) : undefined;
              return (
                <div key={claim.id} className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/20 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
                      <span>{claim.claimNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-blue-700">{claim.recordType} Line</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-700 font-sans font-semibold">${claim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans font-semibold">
                        Step 1 Passed
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Policyholder: <strong>{customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'}</strong> · Policy: <span className="font-mono">{claim.policyId}</span> · State: {claim.policyAccountHolderState}
                    </div>
                    <div className="text-slate-500 italic text-[11px] mt-1">
                      "{claim.description}"
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectClaim(claim.id)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onOpenQuickAction(claim.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Execute Manager Sign-Off (Step 2)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No claims currently pending Step 2 Department Manager review.
          </div>
        )}
      </div>

      {/* Historical Audit Trail of High Value Claims */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
          High-Value Claim History &amp; Settlement Log
        </h3>
        <div className="space-y-3">
          {highValueClaims.map(claim => (
            <div key={claim.id} className="p-3 rounded border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">{claim.claimNumber} (${claim.claimAmount.toLocaleString()})</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  claim.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  claim.approvalStatus === 'Submitted for Approval' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  claim.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                  'bg-slate-100 text-slate-800 border-slate-200'
                }`}>
                  {claim.approvalStatus} {claim.approvalStep ? `(Step ${claim.approvalStep})` : ''}
                </span>
              </div>

              {claim.approvalHistory && claim.approvalHistory.length > 0 && (
                <div className="space-y-1 pl-2 border-l-2 border-slate-200 font-mono text-[11px]">
                  {claim.approvalHistory.map((h, i) => (
                    <div key={i} className="text-slate-600">
                      <span className="font-semibold text-slate-800">{h.step}:</span> {h.action} by {h.approverName} — <span className="italic font-sans text-slate-500">"{h.comments}"</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
