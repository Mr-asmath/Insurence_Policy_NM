import React, { useState } from 'react';
import { runApexTestSuite, TestSuiteResult } from '../services/testSimulator';
import { Play, CheckCircle2, XCircle, Code2, Database, Shield, GitBranch, RefreshCw, Terminal, Layers } from 'lucide-react';

export const SalesforceSchemaAndTestRunner: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tests' | 'schema' | 'security' | 'flows'>('tests');
  const [testSuiteResult, setTestSuiteResult] = useState<TestSuiteResult | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTestSuiteResult(null);

    setTimeout(() => {
      const results = runApexTestSuite();
      setTestSuiteResult(results);
      setIsRunningTests(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-semibold">
                Milestone 4.5 &amp; Architecture
              </span>
              <span className="text-xs text-slate-500">· Salesforce Multi-Line Configuration</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Apex Test Suite, Object Schema &amp; Security Inspector
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute unit tests with 95%+ code coverage assertions and audit custom object configurations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs flex items-center gap-2 transition-colors"
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Apex Test Runner...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Apex Test Class (95%+ Coverage)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-200 mt-6 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('tests')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'tests'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Apex Unit Tests (ClaimsAdjusterControllerTest)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schema')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'schema'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Object Manager (Policy__c &amp; Claim__c)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'security'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Sharing Rules &amp; Permission Sets</span>
          </button>

          <button
            onClick={() => setActiveSubTab('flows')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'flows'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Automated Flows &amp; Rating Engine</span>
          </button>
        </div>
      </div>

      {/* SubTab 1: Apex Test Suite */}
      {activeSubTab === 'tests' && (
        <div className="space-y-4">
          {testSuiteResult ? (
            <div className="space-y-4">
              {/* Test Summary Banner */}
              <div className="bg-emerald-950 text-white rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-300 font-mono uppercase tracking-wider">
                      Apex Test Execution Succeeded
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono tracking-tight mt-1">
                    {testSuiteResult.passed}/{testSuiteResult.totalTests} Methods Passed · 0 Failures
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="bg-emerald-900/80 px-3 py-2 rounded border border-emerald-800">
                    <span className="text-emerald-300 block text-[10px]">Code Coverage:</span>
                    <span className="text-base font-bold text-white">{testSuiteResult.codeCoveragePercent}%</span>
                  </div>
                  <div className="bg-emerald-900/80 px-3 py-2 rounded border border-emerald-800">
                    <span className="text-emerald-300 block text-[10px]">Execution Time:</span>
                    <span className="text-base font-bold text-white">{testSuiteResult.executionTimeMs} ms</span>
                  </div>
                </div>
              </div>

              {/* Method Results */}
              <div className="space-y-3">
                {testSuiteResult.testResults.map((method, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {method.className}.{method.methodName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-slate-500">{method.durationMs}ms</span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {method.assertionsPassed}/{method.totalAssertions} Assertions Passed
                        </span>
                      </div>
                    </div>

                    {/* Execution Log */}
                    <div className="bg-slate-900 text-slate-300 rounded p-3 font-mono text-[11px] space-y-1">
                      <div className="text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                        <Terminal className="w-3 h-3" />
                        <span>System.Debug Execution Logs:</span>
                      </div>
                      {method.logs.map((log, lIdx) => (
                        <div key={lIdx} className="leading-relaxed">
                          <span className="text-slate-600">{lIdx + 1}.</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3">
              <Code2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                Apex Test Runner Ready
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click the button below to compile and execute <code className="font-mono text-slate-700">ClaimsAdjusterControllerTest</code>, testing multi-line SOQL wrapper generation, daysOpen computation, and premium rating coverage.
              </p>
              <button
                onClick={handleRunTests}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Test Suite Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Object Schema */}
      {activeSubTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Policy__c Schema */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Custom Object</span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Policy__c (Policies)</h3>
              <p className="text-xs text-slate-500">Record Name: Auto Number <code className="font-mono">P-&#123;0000&#125;</code></p>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Record Types</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-center">Auto</div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-center">Property</div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-center">Life</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Field Sets &amp; Fields</h4>
                <div className="space-y-1 text-[11px] font-mono">
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Customer__c</span>
                    <span className="text-slate-500">Lookup(Contact)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Premium__c</span>
                    <span className="text-slate-500">Currency(16, 2)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>VIN__c [Vehicle FieldSet]</span>
                    <span className="text-slate-500">Text(20)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Model_Year__c [Vehicle FieldSet]</span>
                    <span className="text-slate-500">Text(5)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Square_Footage__c [Property]</span>
                    <span className="text-slate-500">Number(18, 0)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Year_Built__c [Property]</span>
                    <span className="text-slate-500">Text(5)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Beneficiary_Name__c [Life]</span>
                    <span className="text-slate-500">Text(50)</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block text-[11px]">Validation Rule: VIN_Must_Be_17_Characters</span>
                <code className="text-[11px] font-mono block mt-1">AND( RecordType.DeveloperName = "Auto", LEN( VIN__c ) &lt;&gt; 17 )</code>
              </div>
            </div>
          </div>

          {/* Claim__c Schema */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Custom Object</span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Claim__c (Claims)</h3>
              <p className="text-xs text-slate-500">Record Name: Auto Number <code className="font-mono">C-&#123;0000&#125;</code></p>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Record Types</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-center">Accident</div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-center">Property</div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-center">Life</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Fields &amp; Relationships</h4>
                <div className="space-y-1 text-[11px] font-mono">
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Policy__c</span>
                    <span className="text-slate-500">Lookup(Policy__c)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Claim_Amount__c</span>
                    <span className="text-slate-500">Currency(16, 2)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Approval_Status__c</span>
                    <span className="text-slate-500">Picklist (New, Submitted, Approved, Rejected)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Date_of_Loss__c</span>
                    <span className="text-slate-500">DateTime</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Adjuster__c</span>
                    <span className="text-slate-500">Lookup(User)</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 flex justify-between">
                    <span>Description__c</span>
                    <span className="text-slate-500">Long Text Area</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900">
                <span className="font-bold block text-[11px]">Approval Process: High Value Claim Approval</span>
                <span className="text-[11px] block mt-0.5">Sequential 2-step review routing (Step 1 Senior Adjuster, Step 2 Manager) for claims exceeding $50k.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SubTab 3: Security & Permission Sets */}
      {activeSubTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs text-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Permission Set</span>
              <h3 className="text-sm font-bold text-slate-900">Insurance Agent Access</h3>
            </div>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              <li>• Policy: <strong>Create, Read</strong></li>
              <li>• Contact: <strong>Read, Edit</strong></li>
              <li>• Claim: <strong>Read-Only</strong></li>
              <li>• System: <strong>Flow User Enabled</strong></li>
              <li>• Apex: <strong>PremiumCalculator Class Enabled</strong></li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs text-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Permission Set</span>
              <h3 className="text-sm font-bold text-slate-900">Claims Adjuster Access</h3>
            </div>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              <li>• Policy: <strong>Read-Only</strong></li>
              <li>• Claim: <strong>Read, Edit</strong></li>
              <li>• Contact: <strong>Read-Only</strong></li>
              <li>• Sharing Rules: <strong>Territory State Scoping (CA/TX)</strong></li>
              <li>• Apex: <strong>ClaimsAdjusterController Enabled</strong></li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs text-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Permission Set</span>
              <h3 className="text-sm font-bold text-slate-900">Claims Manager Access</h3>
            </div>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              <li>• Policy: <strong>Read-Only</strong></li>
              <li>• Claim: <strong>Read, Edit, Delete</strong></li>
              <li>• System: <strong>Manage Approvals Enabled</strong></li>
              <li>• System: <strong>Run Reports &amp; Dashboards</strong></li>
              <li>• Territory: <strong>All State Territories Unlocked</strong></li>
            </ul>
          </div>
        </div>
      )}

      {/* SubTab 4: Automated Flows & Rating Engine */}
      {activeSubTab === 'flows' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">
            Declarative Flow Pipeline &amp; Routing Specifications
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded border border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-900">1. AutoQuotingFlow (Screen Flow)</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Multi-screen wizard: captures policy holder contact, start date, and state &rarr; captures VIN (17 chars) and Model Year &rarr; invokes <code className="font-mono">PremiumCalculator.calculatePremium()</code> &rarr; creates draft Policy record and updates with calculated premium.
              </p>
            </div>

            <div className="p-3 rounded border border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-900">2. Record-Triggered Flow on Claim__c (After Save)</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Executes upon Claim creation: fetches Policy Record Type &rarr; Decision: Auto Claim Route assigns to Auto Queue, Property Route to Property Queue, Life Route to Life Queue. If Claim Amount &gt; $50,000, triggers High Value Approval Process.
              </p>
            </div>

            <div className="p-3 rounded border border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-900">3. Claim Approver Screen Flow (Quick Action)</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Provides on-record modal for adjusters/managers to review claim loss details, select Approve or Reject decision radio, provide audit comments, and trigger status updates.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
