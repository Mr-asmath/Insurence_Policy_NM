import React from 'react';
import { ClaimWrapper } from '../types/insurance';
import { Truck, Home, Shield, AlertCircle, ArrowUpRight, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface ClaimTileLwcProps {
  claimData: ClaimWrapper;
  onSelectClaim: (claimId: string) => void;
  onOpenQuickAction: (claimId: string) => void;
}

export const ClaimTileLwc: React.FC<ClaimTileLwcProps> = ({
  claimData,
  onSelectClaim,
  onOpenQuickAction
}) => {
  // Helper property to determine icon based on policy type (as specified in Milestone 3.3 LWC)
  const renderPolicyIcon = () => {
    const type = claimData.policyType.toLowerCase();
    if (type === 'auto') {
      return (
        <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'property') {
      return (
        <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Home className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'life') {
      return (
        <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
        <AlertCircle className="w-4 h-4" />
      </div>
    );
  };

  // Status badge styling without garish candy pills (subtle text with status indicator)
  const getStatusColor = () => {
    switch (claimData.status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Submitted for Approval':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'New':
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header: Icon + Claim Number + Policy Type */}
        <header className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {renderPolicyIcon()}
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Claim: {claimData.claimNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Policy Type: <span className="font-semibold text-slate-700">{claimData.policyType}</span>
                <span className="mx-1 text-slate-300">·</span>
                <span className="inline-flex items-center text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 mr-0.5" />
                  {claimData.policyState}
                </span>
              </p>
            </div>
          </div>

          {claimData.isHighValue && (
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              High Value (&gt;$50k)
            </span>
          )}
        </header>

        {/* Claim Details */}
        <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Policy Holder:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[160px]">
              {claimData.policyHolderName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Claim Amount:</span>
            <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
              ${claimData.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status:</span>
            <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${getStatusColor()}`}>
              {claimData.status}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Days Open:
            </span>
            <span className={`font-mono font-semibold tabular-nums ${claimData.daysOpen > 7 ? 'text-rose-600' : 'text-slate-700'}`}>
              {claimData.daysOpen} {claimData.daysOpen === 1 ? 'day' : 'days'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
            <span>Assigned:</span>
            <span className="truncate max-w-[170px] text-slate-600 font-medium">
              {claimData.ownerName}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectClaim(claimData.claimId)}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => onOpenQuickAction(claimData.claimId)}
          className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Quick Action</span>
        </button>
      </div>
    </div>
  );
};
