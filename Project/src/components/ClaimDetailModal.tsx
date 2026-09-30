import React from 'react';
import { insuranceStore } from '../services/insuranceStore';
import { X, CheckCircle2, Clock, MapPin, User, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

interface ClaimDetailModalProps {
  claimId: string | null;
  onClose: () => void;
  onOpenQuickAction: (claimId: string) => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claimId,
  onClose,
  onOpenQuickAction
}) => {
  if (!claimId) return null;

  const claim = insuranceStore.getClaimById(claimId);
  const policy = claim ? insuranceStore.getPolicyById(claim.policyId) : undefined;
  const customer = policy ? insuranceStore.getContactById(policy.customerId) : undefined;

  if (!claim || !policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden my-8 text-xs">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 text-sm">{claim.claimNumber}</span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-slate-700">{claim.recordType} Claim</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
              claim.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              claim.approvalStatus === 'Submitted for Approval' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              claim.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              {claim.approvalStatus}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Claim Amount</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ${claim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Date of Loss</span>
              <span className="font-semibold text-slate-800">
                {new Date(claim.dateOfLoss).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Assigned Owner</span>
              <span className="font-semibold text-slate-800 truncate block">
                {claim.ownerName}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Territory State</span>
              <span className="font-mono font-semibold text-slate-800">
                {claim.policyAccountHolderState}
              </span>
            </div>
          </div>

          {/* Incident Description */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">Loss Description &amp; Summary</h4>
            <p className="p-3 rounded bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed italic">
              "{claim.description}"
            </p>
          </div>

          {/* Related Policy Information */}
          <div className="border border-slate-200 rounded p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Related Policy: {policy.id} ({policy.recordType} Line)
              </h4>
              <span className="font-mono text-emerald-700 font-bold">
                Premium: ${policy.premium.toLocaleString('en-US', { minimumFractionDigits: 2 })}/yr
              </span>
            </div>

            <div className="text-slate-600 text-[11px] grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>Policyholder: <strong className="text-slate-800">{customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'}</strong></div>
              <div>Effective: <strong className="text-slate-800">{policy.policyStartDate}</strong></div>
              {policy.vin && <div>VIN: <code className="font-mono font-bold">{policy.vin}</code></div>}
              {policy.modelYear && <div>Model Year: <strong className="text-slate-800">{policy.modelYear}</strong></div>}
              {policy.squareFootage && <div>Square Footage: <strong className="text-slate-800">{policy.squareFootage} sqft</strong></div>}
              {policy.beneficiaryName && <div>Beneficiary: <strong className="text-slate-800">{policy.beneficiaryName}</strong></div>}
            </div>
          </div>

          {/* Approval History Audit */}
          {claim.approvalHistory && claim.approvalHistory.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Approval Trail &amp; Automated Queue Audit
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {claim.approvalHistory.map((h, i) => (
                  <div key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{h.step} — {h.action}</span>
                      <span className="text-slate-400 font-normal">{new Date(h.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      <span className="text-slate-700 font-medium">{h.approverName} ({h.approverRole}):</span> {h.comments}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenQuickAction(claim.id);
            }}
            className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Open Approve / Reject Quick Action</span>
          </button>
        </div>

      </div>
    </div>
  );
};
