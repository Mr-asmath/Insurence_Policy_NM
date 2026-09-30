import React, { useState } from 'react';
import { Claim, AppUser } from '../types/insurance';
import { insuranceStore } from '../services/insuranceStore';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Clock, FileText, ChevronRight } from 'lucide-react';

interface ClaimReviewModalProps {
  claimId: string | null;
  onClose: () => void;
  currentUser: AppUser;
  onSuccess?: () => void;
}

export const ClaimReviewModal: React.FC<ClaimReviewModalProps> = ({
  claimId,
  onClose,
  currentUser,
  onSuccess
}) => {
  if (!claimId) return null;

  const claim = insuranceStore.getClaimById(claimId);
  const policy = claim ? insuranceStore.getPolicyById(claim.policyId) : undefined;
  const customer = policy ? insuranceStore.getContactById(policy.customerId) : undefined;

  const [decision, setDecision] = useState<'Approve' | 'Reject'>('Approve');
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!claim || !policy) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
          <p className="text-sm text-slate-700">Claim not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  const isHighValue = claim.claimAmount > 50000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = insuranceStore.processApprovalDecision(claim.id, decision, comments);
      if (res.success) {
        setFeedback({ message: res.message, type: 'success' });
        setTimeout(() => {
          setIsSubmitting(false);
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setFeedback({ message: res.message, type: 'error' });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Error executing action', type: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden my-8">
        
        {/* Header - Flow Title */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Screen Flow: Claim Review & Approval Action
              </h2>
              <p className="text-xs text-slate-500">
                Quick Action: Approve / Reject Claim Record ({claim.claimNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High Value Process Stepper (if > $50k) */}
        {isHighValue && (
          <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                High-Value Approval Process Active (Amount &gt; $50,000.00)
              </span>
              <span className="text-[11px] font-mono font-medium text-amber-800">
                Sequential 2-Step Gate
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`p-2 rounded border ${
                  claim.approvalStep === 1
                    ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-semibold'
                    : claim.approvalStep === 2 || claim.approvalStatus === 'Approved'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Step 1: Senior Adjuster Review</span>
                </div>
                <p className="text-[11px] font-normal text-slate-600 mt-1">
                  Damage scope verification by Senior Adjuster
                </p>
              </div>

              <div
                className={`p-2 rounded border ${
                  claim.approvalStep === 2
                    ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-semibold'
                    : claim.approvalStatus === 'Approved'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Step 2: Department Manager Sign-Off</span>
                </div>
                <p className="text-[11px] font-normal text-slate-600 mt-1">
                  Final fiscal disbursement authorization
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Body matching Screen Flow Canvas */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Milestone 4.4 Display Text Component */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2 text-xs">
            <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
              Claim Review Details (Screen Element: Claim Review Screen)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Claim ID:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{claim.claimNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Amount:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  ${claim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Policy Type:</span>
                <span className="font-semibold text-slate-800">{policy.recordType}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Policy Holder:</span>
                <span className="font-semibold text-slate-800">
                  {customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Policy Number:</span>
                <span className="font-mono text-slate-800 font-semibold">{policy.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Date of Loss:</span>
                <span className="text-slate-700">{new Date(claim.dateOfLoss).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-slate-500 block text-[11px] mb-0.5">Incident Description:</span>
              <p className="text-slate-700 italic bg-white p-2 rounded border border-slate-200">
                "{claim.description}"
              </p>
            </div>
          </div>

          {/* Radio Buttons Component: Approval Decision */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Approval Decision (Radio Component)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                  decision === 'Approve'
                    ? 'bg-emerald-50/60 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="approvalDecision"
                  value="Approve"
                  checked={decision === 'Approve'}
                  onChange={() => setDecision('Approve')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Approve</span>
                    <span className="text-[11px] text-slate-500">
                      {isHighValue && claim.approvalStep === 1
                        ? 'Advance to Step 2 (Manager)'
                        : 'Authorize claim payment'}
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                  decision === 'Reject'
                    ? 'bg-rose-50/60 border-rose-500 ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="approvalDecision"
                  value="Reject"
                  checked={decision === 'Reject'}
                  onChange={() => setDecision('Reject')}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Reject</span>
                    <span className="text-[11px] text-slate-500">Decline claim settlement</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Long Text Area: Approver Comments */}
          <div>
            <label htmlFor="approverComments" className="block text-xs font-semibold text-slate-800 mb-1">
              Approver Comments (Long Text Area)
            </label>
            <textarea
              id="approverComments"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter audit remarks, contractor estimate citations, or denial rationale..."
              className="w-full text-xs p-2.5 rounded border border-slate-300 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Approval History Audit Trail */}
          {claim.approvalHistory && claim.approvalHistory.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Approval History &amp; Decision Audit Trail
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {claim.approvalHistory.map((entry, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded text-xs border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{entry.step}</span>
                      <span className="text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      <span className="font-medium text-slate-700">{entry.approverName} ({entry.approverRole}):</span> {entry.comments}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback && (
            <div
              className={`p-3 rounded text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Action Element Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-semibold text-white rounded transition-colors flex items-center gap-1.5 ${
                decision === 'Approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
              }`}
            >
              {isSubmitting ? (
                <span>Executing Flow Action...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit {decision} Decision</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
