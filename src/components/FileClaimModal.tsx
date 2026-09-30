import React, { useState } from 'react';
import { Policy, ClaimRecordType } from '../types/insurance';
import { insuranceStore } from '../services/insuranceStore';
import { X, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface FileClaimModalProps {
  policyId: string | null;
  onClose: () => void;
  onSuccess: (claimId: string) => void;
}

export const FileClaimModal: React.FC<FileClaimModalProps> = ({
  policyId,
  onClose,
  onSuccess
}) => {
  if (!policyId) return null;

  const policy = insuranceStore.getPolicyById(policyId);
  const customer = policy ? insuranceStore.getContactById(policy.customerId) : undefined;

  const [claimAmount, setClaimAmount] = useState<number>(policy?.recordType === 'Auto' ? 6200 : 18500);
  const [dateOfLoss, setDateOfLoss] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>(
    policy?.recordType === 'Auto'
      ? 'Collision with stationary highway median barrier. Front bumper, hood, and radiator puncture.'
      : policy?.recordType === 'Property'
      ? 'Severe plumbing rupture behind upstairs master bathroom drywall resulting in extensive ceiling flooding.'
      : 'Beneficiary critical illness benefit claim accompanied by certified medical physician report.'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!policy) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = insuranceStore.createClaimWithRecordTriggeredFlow({
      policyId: policy.id,
      claimAmount,
      dateOfLoss: new Date(dateOfLoss).toISOString(),
      description
    });

    if (res.success && res.claim) {
      setResultMessage(res.message);
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(res.claim!.id);
        onClose();
      }, 1400);
    } else {
      setIsSubmitting(false);
    }
  };

  const isHighValue = claimAmount > 50000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                File New Claim &amp; Record-Triggered Routing
              </h2>
              <p className="text-xs text-slate-500">
                Triggers After-Save Record-Triggered Flow on Claim__c
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Target Policy Info */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
            <div className="flex justify-between font-mono font-bold text-slate-900">
              <span>Target Policy: {policy.id}</span>
              <span className="text-blue-700">{policy.recordType} Line</span>
            </div>
            <div className="text-slate-600">
              Policyholder: <strong className="text-slate-800">{customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'}</strong> (Territory: {policy.policyState})
            </div>
          </div>

          {/* Claim Amount with High Value Threshold callout */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="claimAmountInput" className="font-semibold text-slate-800">
                Estimated Claim Amount ($ USD) *
              </label>
              {isHighValue && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  &gt; $50,000 High-Value Threshold!
                </span>
              )}
            </div>
            <input
              id="claimAmountInput"
              type="number"
              step={100}
              value={claimAmount}
              onChange={(e) => setClaimAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2 mt-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setClaimAmount(4850)}
                className="text-slate-600 hover:underline"
              >
                Set Standard ($4,850)
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setClaimAmount(68000)}
                className="text-amber-700 hover:underline font-semibold"
              >
                Test High-Value Escalation ($68,000)
              </button>
            </div>
          </div>

          {/* Date of Loss */}
          <div>
            <label htmlFor="dateOfLossInput" className="font-semibold text-slate-800 block mb-1">
              Date of Loss *
            </label>
            <input
              id="dateOfLossInput"
              type="date"
              value={dateOfLoss}
              onChange={(e) => setDateOfLoss(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Incident Description */}
          <div>
            <label htmlFor="lossDescriptionInput" className="font-semibold text-slate-800 block mb-1">
              Incident Details &amp; Loss Description *
            </label>
            <textarea
              id="lossDescriptionInput"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Simulated Automation Path */}
          <div className="p-3 rounded bg-blue-50/60 border border-blue-200 text-slate-700 space-y-1">
            <span className="font-bold text-blue-900 block">
              Automated Flow Pipeline (Milestone 2.3 &amp; 4.3):
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
              <li>
                <strong>Queue Routing:</strong> Will assign to{' '}
                <span className="font-semibold text-slate-900">
                  {policy.recordType === 'Auto' ? 'Auto Queue' : policy.recordType === 'Property' ? 'Property Queue' : 'Life Queue'}
                </span>{' '}
                based on Record Type.
              </li>
              <li>
                <strong>Territory Sharing:</strong> Copies Policy State (<code className="font-mono">{policy.policyState}</code>) into claim for adjuster state scoping.
              </li>
              {isHighValue ? (
                <li className="text-amber-800 font-semibold">
                  <strong>High Value Trigger:</strong> Because amount &gt; $50,000, sets Status to 'Submitted for Approval' and assigns Step 1 to Senior Adjuster.
                </li>
              ) : (
                <li>
                  <strong>Standard Trigger:</strong> Sets Status to 'New' for triage.
                </li>
              )}
            </ul>
          </div>

          {resultMessage && (
            <div className="p-3 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              {resultMessage}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Executing Flow Routing...</span>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Execute Claim Flow</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
