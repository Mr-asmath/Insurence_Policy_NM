export type InsuranceLine = 'Auto' | 'Property' | 'Life';

export type ClaimRecordType = 'Accident' | 'Property' | 'Life';

export type ApprovalStatus = 'New' | 'Submitted for Approval' | 'Approved' | 'Rejected';

export type PolicyStatus = 'Draft' | 'Active' | 'Cancelled';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string; // CA, TX, NY, etc.
  streetAddress: string;
  city: string;
  zipCode: string;
  ownerId: string;
}

export interface Policy {
  id: string; // e.g. P-0001
  recordType: InsuranceLine;
  customerId: string;
  policyStartDate: string; // YYYY-MM-DD
  policyState: string; // CA, TX, etc.
  premium: number;
  status: PolicyStatus;
  ownerId: string;
  createdAt: string;

  // Vehicle / Auto FieldSet
  vin?: string;
  modelYear?: string;
  vehicleMakeModel?: string;

  // Property FieldSet
  squareFootage?: number;
  yearBuilt?: string;
  propertyAddress?: string;

  // Life FieldSet
  beneficiaryName?: string;
  policyTermMonths?: number;
  coverageAmount?: number;
}

export interface ApprovalHistoryEntry {
  step: string;
  approverName: string;
  approverRole: string;
  action: 'Submitted' | 'Approved' | 'Rejected';
  comments: string;
  timestamp: string;
}

export interface Claim {
  id: string; // e.g. C-0001
  claimNumber: string; // C-0001
  recordType: ClaimRecordType;
  policyId: string;
  claimAmount: number;
  dateOfLoss: string; // ISO string
  approvalStatus: ApprovalStatus;
  description: string;
  adjusterId: string;
  ownerId: string; // User ID or Queue ID
  ownerName: string;
  ownerType: 'User' | 'Queue';
  policyAccountHolderState: string; // Populated by Record-Triggered Flow for Territory Sharing
  approvalStep?: 1 | 2 | null; // 1: Senior Adjuster, 2: Department Manager
  approvalHistory: ApprovalHistoryEntry[];
  createdAt: string;
}

export interface ClaimWrapper {
  claimId: string;
  claimNumber: string;
  claimAmount: number;
  status: ApprovalStatus;
  policyType: string;
  policyHolderName: string;
  daysOpen: number;
  policyState: string;
  ownerName: string;
  description: string;
  dateOfLoss: string;
  isHighValue: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  role: 'Agent' | 'Adjuster' | 'SeniorAdjuster' | 'Manager' | 'Admin';
  territoryState?: 'CA' | 'TX' | 'All';
  email: string;
  title: string;
}

export interface PremiumCalculationBreakdown {
  basePremium: number;
  stateMultiplier: number;
  stateAdjustment: number;
  modelYearAdjustment: number;
  propertySqftAdjustment: number;
  propertyAgeAdjustment: number;
  lifeTermAdjustment: number;
  totalCalculatedPremium: number;
  formulaExplanation: string[];
}
