import React, { useState, useEffect } from 'react';
import { AppUser, InsuranceLine } from './types/insurance';
import { insuranceStore } from './services/insuranceStore';
import { TopNav } from './components/TopNav';
import { ClaimsDashboardLwc } from './components/ClaimsDashboardLwc';
import { AutoQuotingFlow } from './components/AutoQuotingFlow';
import { Customer360View } from './components/Customer360View';
import { ApprovalProcessesView } from './components/ApprovalProcessesView';
import { SalesforceSchemaAndTestRunner } from './components/SalesforceSchemaAndTestRunner';
import { ClaimReviewModal } from './components/ClaimReviewModal';
import { ClaimDetailModal } from './components/ClaimDetailModal';
import { FileClaimModal } from './components/FileClaimModal';
import { ShieldCheck, RotateCcw, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'claims' | 'quoting' | 'customer360' | 'approvals' | 'architecture'>('claims');
  const [currentUser, setCurrentUser] = useState<AppUser>(insuranceStore.getCurrentUser());
  const [users, setUsers] = useState<AppUser[]>(insuranceStore.getUsers());

  // Modal states
  const [reviewClaimId, setReviewClaimId] = useState<string | null>(null);
  const [detailClaimId, setDetailClaimId] = useState<string | null>(null);
  const [fileClaimPolicyId, setFileClaimPolicyId] = useState<string | null>(null);

  // Quoting flow pre-selections
  const [quotingLine, setQuotingLine] = useState<InsuranceLine>('Auto');
  const [quotingCustomerId, setQuotingCustomerId] = useState<string | undefined>(undefined);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    const unsub = insuranceStore.subscribe(() => {
      setCurrentUser(insuranceStore.getCurrentUser());
    });
    return () => unsub();
  }, []);

  const handleUserChange = (newUser: AppUser) => {
    insuranceStore.setCurrentUser(newUser);
    setCurrentUser(newUser);
    showToast(`Switched active profile to ${newUser.name} (${newUser.title})`);
  };

  const handleOpenQuotingForCustomer = (customerId: string, line: InsuranceLine) => {
    setQuotingCustomerId(customerId);
    setQuotingLine(line);
    setActiveTab('quoting');
  };

  const handleStartNewQuote = () => {
    setQuotingCustomerId(undefined);
    setQuotingLine('Auto');
    setActiveTab('quoting');
  };

  // High-value pending approvals counter
  const claims = insuranceStore.getClaims();
  const pendingApprovalsCount = claims.filter(
    c => c.claimAmount > 50000 && c.approvalStatus === 'Submitted for Approval'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 3-Zone Top Navigation Bar */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        users={users}
        onOpenNewQuote={handleStartNewQuote}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Claims Adjuster Dashboard (LWC) */}
        {activeTab === 'claims' && (
          <ClaimsDashboardLwc
            currentUser={currentUser}
            onSelectClaim={(id) => setDetailClaimId(id)}
            onOpenQuickAction={(id) => setReviewClaimId(id)}
            onNewClaim={() => {
              const policies = insuranceStore.getPolicies();
              if (policies.length > 0) {
                setFileClaimPolicyId(policies[0].id);
              }
            }}
          />
        )}

        {/* Tab 2: Quoting Flow (Screen Flow) */}
        {activeTab === 'quoting' && (
          <AutoQuotingFlow
            initialLine={quotingLine}
            preselectedCustomerId={quotingCustomerId}
            onPolicyCreated={(policy) => {
              showToast(`Policy ${policy.id} successfully created and activated!`);
            }}
            onCancel={() => setActiveTab('claims')}
          />
        )}

        {/* Tab 3: Customer 360° */}
        {activeTab === 'customer360' && (
          <Customer360View
            onQuoteForCustomer={handleOpenQuotingForCustomer}
            onSelectClaim={(id) => setDetailClaimId(id)}
            onOpenQuickAction={(id) => setReviewClaimId(id)}
            onFileClaimForPolicy={(policyId) => setFileClaimPolicyId(policyId)}
          />
        )}

        {/* Tab 4: High-Value Approvals Console */}
        {activeTab === 'approvals' && (
          <ApprovalProcessesView
            currentUser={currentUser}
            onOpenQuickAction={(id) => setReviewClaimId(id)}
            onSelectClaim={(id) => setDetailClaimId(id)}
          />
        )}

        {/* Tab 5: Apex Tests, Architecture & Schema */}
        {activeTab === 'architecture' && (
          <SalesforceSchemaAndTestRunner />
        )}

      </main>

      {/* Quick Action Screen Flow Modal */}
      {reviewClaimId && (
        <ClaimReviewModal
          claimId={reviewClaimId}
          currentUser={currentUser}
          onClose={() => setReviewClaimId(null)}
          onSuccess={() => {
            showToast('Screen Flow quick action successfully committed!');
          }}
        />
      )}

      {/* Claim Detail Inspector Modal */}
      {detailClaimId && (
        <ClaimDetailModal
          claimId={detailClaimId}
          onClose={() => setDetailClaimId(null)}
          onOpenQuickAction={(id) => setReviewClaimId(id)}
        />
      )}

      {/* File Claim on Policy Modal (Record-Triggered Flow) */}
      {fileClaimPolicyId && (
        <FileClaimModal
          policyId={fileClaimPolicyId}
          onClose={() => setFileClaimPolicyId(null)}
          onSuccess={(claimId) => {
            showToast(`New claim created and routed by Record-Triggered Flow!`);
            setDetailClaimId(claimId);
          }}
        />
      )}

      {/* Clean Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Multi-Line Insurance Management System</span>
            <span className="text-slate-300">·</span>
            <span>Vehicle, Property &amp; Life Single-Platform Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Reset store back to default seed records?')) {
                  insuranceStore.resetToDefaults();
                  showToast('Database reset to clean factory seed state.');
                }
              }}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed Data</span>
            </button>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">Salesforce LWC &amp; Apex Specification Implemented</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
