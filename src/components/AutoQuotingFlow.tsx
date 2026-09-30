import React, { useState, useEffect } from 'react';
import { InsuranceLine, Contact, Policy } from '../types/insurance';
import { insuranceStore } from '../services/insuranceStore';
import { calculatePremium, validateVIN } from '../services/ratingEngine';
import { Truck, Home, Shield, Check, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, Layers } from 'lucide-react';

interface AutoQuotingFlowProps {
  onPolicyCreated: (policy: Policy) => void;
  onCancel: () => void;
  initialLine?: InsuranceLine;
  preselectedCustomerId?: string;
}

export const AutoQuotingFlow: React.FC<AutoQuotingFlowProps> = ({
  onPolicyCreated,
  onCancel,
  initialLine = 'Auto',
  preselectedCustomerId
}) => {
  // Current screen step (1: Basics, 2: Product Specifics, 3: Apex Rating, 4: Confirmed)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [recordType, setRecordType] = useState<InsuranceLine>(initialLine);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || '');
  const [policyStartDate, setPolicyStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [policyState, setPolicyState] = useState<string>('CA');

  // Auto FieldSet
  const [vin, setVin] = useState<string>('1HGCR2F83HA029410');
  const [modelYear, setModelYear] = useState<string>('2016');
  const [vehicleMakeModel, setVehicleMakeModel] = useState<string>('2016 Honda Accord');

  // Property FieldSet
  const [squareFootage, setSquareFootage] = useState<number>(2200);
  const [yearBuilt, setYearBuilt] = useState<string>('2002');
  const [propertyAddress, setPropertyAddress] = useState<string>('');

  // Life FieldSet
  const [beneficiaryName, setBeneficiaryName] = useState<string>('Family Trust / Estate');
  const [policyTermMonths, setPolicyTermMonths] = useState<number>(240);
  const [coverageAmount, setCoverageAmount] = useState<number>(500000);

  // Errors & Validations
  const [vinError, setVinError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Rated output from Apex PremiumCalculator
  const [ratedOutput, setRatedOutput] = useState<ReturnType<typeof calculatePremium> | null>(null);
  const [isRating, setIsRating] = useState<boolean>(false);
  const [createdPolicy, setCreatedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    const list = insuranceStore.getContacts();
    setContacts(list);
    if (!selectedCustomerId && list.length > 0) {
      setSelectedCustomerId(list[0].id);
    }
  }, []);

  // When customer changes, autofill their address/state
  useEffect(() => {
    if (selectedCustomerId) {
      const c = contacts.find(x => x.id === selectedCustomerId);
      if (c) {
        setPolicyState(c.state || 'CA');
        setPropertyAddress(`${c.streetAddress}, ${c.city}, ${c.state}`);
      }
    }
  }, [selectedCustomerId, contacts]);

  // Live validation for Auto VIN (Validation Rule: VIN_Must_Be_17_Characters)
  const handleVinChange = (val: string) => {
    const upper = val.toUpperCase().trim();
    setVin(upper);
    if (recordType === 'Auto') {
      const check = validateVIN('Auto', upper);
      setVinError(check.isValid ? null : check.errorMessage || 'VIN must be 17 characters');
    }
  };

  const goToStep2 = () => {
    if (!selectedCustomerId) {
      setFormError('Please select a Policy Holder (Contact Lookup).');
      return;
    }
    setFormError(null);
    setCurrentStep(2);
  };

  const goToStep3Rating = () => {
    if (recordType === 'Auto') {
      const check = validateVIN('Auto', vin);
      if (!check.isValid) {
        setVinError(check.errorMessage || 'VIN must be exactly 17 characters');
        return;
      }
    }

    setVinError(null);
    setFormError(null);
    setIsRating(true);

    // Replicate Apex Action: Calculate Premium Action via PremiumCalculator
    setTimeout(() => {
      const result = calculatePremium({
        recordType,
        policyState,
        vin,
        modelYear,
        squareFootage,
        yearBuilt,
        policyTermMonths,
        coverageAmount
      });
      setRatedOutput(result);
      setIsRating(false);
      setCurrentStep(3);
    }, 400);
  };

  const handleIssuePolicy = () => {
    const res = insuranceStore.createPolicyFromQuote({
      recordType,
      customerId: selectedCustomerId,
      policyStartDate,
      policyState,
      vin,
      modelYear,
      vehicleMakeModel,
      squareFootage,
      yearBuilt,
      propertyAddress,
      beneficiaryName,
      policyTermMonths,
      coverageAmount
    });

    if (res.success && res.policy) {
      setCreatedPolicy(res.policy);
      setCurrentStep(4);
      onPolicyCreated(res.policy);
    } else {
      setFormError(res.errorMessage || 'Failed to issue policy.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden max-w-4xl mx-auto">
      
      {/* Flow Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
              Screen Flow: AutoQuotingFlow
            </span>
            <span className="text-xs text-slate-500">· Declarative Quoting Engine</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Interactive Multi-Line Quoting Wizard
          </h2>
        </div>

        {/* Screen Step Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
          <span className="h-0.5 w-4 bg-slate-200" />
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
          <span className="h-0.5 w-4 bg-slate-200" />
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
          <span className="h-0.5 w-4 bg-slate-200" />
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>✓</span>
        </div>
      </div>

      {/* Screen 1: Policy Basics */}
      {currentStep === 1 && (
        <div className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Screen 1: Policy Basics (Get Vehicle RT &amp; Account Information)
            </h3>
            <p className="text-xs text-slate-500">
              Select product line, customer lookup record, effective start date, and jurisdiction state.
            </p>
          </div>

          {/* Product Line Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Select Policy Record Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRecordType('Auto')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  recordType === 'Auto'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Auto (Vehicle)</div>
                  <div className="text-[11px] text-slate-500">RecordType: Auto</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecordType('Property')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  recordType === 'Property'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 text-emerald-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Property</div>
                  <div className="text-[11px] text-slate-500">RecordType: Property</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecordType('Life')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  recordType === 'Life'
                    ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600 text-purple-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Life</div>
                  <div className="text-[11px] text-slate-500">RecordType: Life</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Lookup Component */}
            <div>
              <label htmlFor="customerLookup" className="block text-xs font-semibold text-slate-800 mb-1">
                Policy Holder (Customer Lookup to Contact) *
              </label>
              <select
                id="customerLookup"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.state} — {c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Policy State Picklist */}
            <div>
              <label htmlFor="policyState" className="block text-xs font-semibold text-slate-800 mb-1">
                Policy State (Picklist Choice Set) *
              </label>
              <select
                id="policyState"
                value={policyState}
                onChange={(e) => setPolicyState(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="CA">California (CA) — 1.15 rating factor</option>
                <option value="TX">Texas (TX) — 1.05 rating factor</option>
                <option value="NY">New York (NY) — Standard factor</option>
                <option value="FL">Florida (FL) — Standard factor</option>
                <option value="IL">Illinois (IL) — Standard factor</option>
              </select>
            </div>

            {/* Policy Start Date */}
            <div>
              <label htmlFor="policyStartDate" className="block text-xs font-semibold text-slate-800 mb-1">
                Policy Start Date (Date Component) *
              </label>
              <input
                id="policyStartDate"
                type="date"
                value={policyStartDate}
                onChange={(e) => setPolicyStartDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded text-xs bg-rose-50 text-rose-800 border border-rose-200">
              {formError}
            </div>
          )}

          {/* Action element */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={goToStep2}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5"
            >
              <span>Next: Product-Specific Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Screen 2: Policy-Specific FieldSets */}
      {currentStep === 2 && (
        <div className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Screen 2: {recordType}-Specific FieldSet Data
            </h3>
            <p className="text-xs text-slate-500">
              {recordType === 'Auto' && 'Enter VIN and Model Year for Vehicle rating. Validation Rule enforces 17-character VIN.'}
              {recordType === 'Property' && 'Enter Square Footage and Year Built for structural property rating.'}
              {recordType === 'Life' && 'Enter Beneficiary and Term Duration in months for life underwriting.'}
            </p>
          </div>

          {/* Vehicle / Auto FieldSet */}
          {recordType === 'Auto' && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-200 rounded p-3 text-xs text-blue-900">
                <span className="font-semibold">Validation Rule Notice:</span> Rule <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">VIN_Must_Be_17_Characters</code> enforces formula: <code className="font-mono">AND( RecordType.DeveloperName = "Auto", LEN( VIN__c ) &lt;&gt; 17 )</code>.
              </div>

              <div>
                <label htmlFor="vinInput" className="block text-xs font-semibold text-slate-800 mb-1">
                  Vehicle Identification Number (VIN) — 17 Characters *
                </label>
                <div className="relative">
                  <input
                    id="vinInput"
                    type="text"
                    maxLength={20}
                    value={vin}
                    onChange={(e) => handleVinChange(e.target.value)}
                    placeholder="e.g. 1HGCR2F83HA029410"
                    className={`w-full text-xs font-mono tracking-wider bg-slate-50 border rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none transition-colors ${
                      vinError ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-400">
                    {vin.length}/17 chars
                  </span>
                </div>
                {vinError && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {vinError}
                  </p>
                )}
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => handleVinChange('1HGCR2F83HA029410')}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Sample Valid 17-char VIN
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => handleVinChange('SHORT_VIN_FAIL')}
                    className="text-[11px] text-slate-500 hover:underline"
                  >
                    Test Invalid Short VIN
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modelYearInput" className="block text-xs font-semibold text-slate-800 mb-1">
                    Model Year (Text 5) *
                  </label>
                  <select
                    id="modelYearInput"
                    value={modelYear}
                    onChange={(e) => setModelYear(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="2024">2024 (Standard Tier)</option>
                    <option value="2022">2022 (Standard Tier)</option>
                    <option value="2020">2020 (Standard Tier)</option>
                    <option value="2018">2018 (Standard Tier)</option>
                    <option value="2016">2016 (&lt; 2018: +$100 surcharge)</option>
                    <option value="2014">2014 (&lt; 2018: +$100 surcharge)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="makeModelInput" className="block text-xs font-semibold text-slate-800 mb-1">
                    Vehicle Make &amp; Model
                  </label>
                  <input
                    id="makeModelInput"
                    type="text"
                    value={vehicleMakeModel}
                    onChange={(e) => setVehicleMakeModel(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Property FieldSet */}
          {recordType === 'Property' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sqftInput" className="block text-xs font-semibold text-slate-800 mb-1">
                    Square Footage (Number 18, 0) *
                  </label>
                  <input
                    id="sqftInput"
                    type="number"
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(parseInt(e.target.value, 10) || 1000)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="yearBuiltInput" className="block text-xs font-semibold text-slate-800 mb-1">
                    Year Built (Text 5) *
                  </label>
                  <input
                    id="yearBuiltInput"
                    type="text"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="propAddressInput" className="block text-xs font-semibold text-slate-800 mb-1">
                  Property Address
                </label>
                <input
                  id="propAddressInput"
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Life FieldSet */}
          {recordType === 'Life' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="beneInput" className="block text-xs font-semibold text-slate-800 mb-1">
                  Beneficiary Name (Text 50) *
                </label>
                <input
                  id="beneInput"
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="termInput" className="block text-xs font-semibold text-slate-800 mb-1">
                    Policy Term Months (Number 18, 0) *
                  </label>
                  <select
                    id="termInput"
                    value={policyTermMonths}
                    onChange={(e) => setPolicyTermMonths(parseInt(e.target.value, 10))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value={120}>120 Months (10-Year Term)</option>
                    <option value={240}>240 Months (20-Year Term)</option>
                    <option value={360}>360 Months (30-Year Term)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="coverageInput" className="block text-xs font-semibold text-slate-800 mb-1">
                    Coverage Amount ($ USD)
                  </label>
                  <input
                    id="coverageInput"
                    type="number"
                    step={50000}
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(parseInt(e.target.value, 10) || 100000)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={Boolean(recordType === 'Auto' && vinError)}
              onClick={goToStep3Rating}
              className={`px-4 py-2 text-xs font-semibold text-white rounded flex items-center gap-1.5 ${
                recordType === 'Auto' && vinError
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              <span>Invoke Apex Rating (PremiumCalculator)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Screen 3: Apex Invocable Action Result & Draft Review */}
      {currentStep === 3 && ratedOutput && (
        <div className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                Apex Action: PremiumCalculator.calculatePremium()
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Screen 3: Premium Calculation &amp; Underwriting Audit
            </h3>
            <p className="text-xs text-slate-500">
              The invocable Apex action has rated the risk based on state territory, vehicle model year, and product attributes.
            </p>
          </div>

          {/* Highlighted Premium Box */}
          <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                Calculated Annual Premium (varCalculatedPremium)
              </span>
              <div className="text-3xl font-bold font-mono tracking-tight text-white mt-1">
                ${ratedOutput.totalCalculatedPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-800 px-3 py-2 rounded border border-slate-700">
              <div>Record Type: <strong className="text-white">{recordType}</strong></div>
              <div>State Code: <strong className="text-white">{policyState}</strong></div>
            </div>
          </div>

          {/* Rating Breakdown / Calculation Trace */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Apex Invocable Method Execution Trace:
            </h4>
            <ul className="space-y-1 font-mono text-[11px] text-slate-700 pl-2 border-l-2 border-blue-500">
              {ratedOutput.formulaExplanation.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>

          {/* Action element: Create Records Element & Update with Premium */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Details</span>
            </button>

            <button
              type="button"
              onClick={handleIssuePolicy}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Execute Create Records: Issue Policy</span>
            </button>
          </div>
        </div>
      )}

      {/* Screen 4: Confirmation & Activation */}
      {currentStep === 4 && createdPolicy && (
        <div className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Policy Successfully Issued!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Screen Flow completed. Draft policy record committed to database and activated.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded p-4 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Policy Number:</span>
              <span className="font-mono font-bold text-slate-900">{createdPolicy.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Record Type:</span>
              <span className="font-semibold text-slate-800">{createdPolicy.recordType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Effective Date:</span>
              <span className="text-slate-800">{createdPolicy.policyStartDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Annual Premium:</span>
              <span className="font-mono font-bold text-emerald-700">
                ${createdPolicy.premium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCurrentStep(1);
                setCreatedPolicy(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded"
            >
              Quote Another Policy
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
