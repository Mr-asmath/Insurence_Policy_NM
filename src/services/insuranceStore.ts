import {
  Contact,
  Policy,
  Claim,
  ClaimWrapper,
  AppUser,
  InsuranceLine,
  ApprovalStatus,
  ClaimRecordType
} from '../types/insurance';
import {
  INITIAL_CONTACTS,
  INITIAL_POLICIES,
  INITIAL_CLAIMS,
  INITIAL_USERS
} from '../data/initialData';
import { calculatePremium, validateVIN, RatingInput } from './ratingEngine';

class InsuranceStore {
  private contacts: Contact[] = [...INITIAL_CONTACTS];
  private policies: Policy[] = [...INITIAL_POLICIES];
  private claims: Claim[] = [...INITIAL_CLAIMS];
  private users: AppUser[] = [...INITIAL_USERS];
  private currentUser: AppUser = INITIAL_USERS[1]; // Default to Adjuster CA (Marcus Vance)
  private listeners: Array<() => void> = [];

  constructor() {
    // Load from localStorage if present
    try {
      const savedContacts = localStorage.getItem('insure_contacts');
      const savedPolicies = localStorage.getItem('insure_policies');
      const savedClaims = localStorage.getItem('insure_claims');
      const savedUserId = localStorage.getItem('insure_user_id');

      if (savedContacts) this.contacts = JSON.parse(savedContacts);
      if (savedPolicies) this.policies = JSON.parse(savedPolicies);
      if (savedClaims) this.claims = JSON.parse(savedClaims);
      if (savedUserId) {
        const found = this.users.find(u => u.id === savedUserId);
        if (found) this.currentUser = found;
      }
    } catch {
      // fallback to initial
    }
  }

  private persist() {
    try {
      localStorage.setItem('insure_contacts', JSON.stringify(this.contacts));
      localStorage.setItem('insure_policies', JSON.stringify(this.policies));
      localStorage.setItem('insure_claims', JSON.stringify(this.claims));
      localStorage.setItem('insure_user_id', this.currentUser.id);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- User & Role Management ---
  public getCurrentUser(): AppUser {
    return this.currentUser;
  }

  public getUsers(): AppUser[] {
    return this.users;
  }

  public setCurrentUser(userOrId: AppUser | string) {
    if (typeof userOrId === 'string') {
      const u = this.users.find(x => x.id === userOrId);
      if (u) this.currentUser = u;
    } else {
      this.currentUser = userOrId;
    }
    this.persist();
  }

  // --- Contacts ---
  public getContacts(): Contact[] {
    return [...this.contacts];
  }

  public getContactById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  // --- Policies ---
  public getPolicies(): Policy[] {
    return [...this.policies];
  }

  public getPolicyById(id: string): Policy | undefined {
    return this.policies.find(p => p.id === id);
  }

  public getPoliciesForCustomer(customerId: string): Policy[] {
    return this.policies.filter(p => p.customerId === customerId);
  }

  /**
   * Screen Flow Quoting Implementation (AutoQuotingFlow / Property / Life):
   * Validates FieldSets, executes Apex PremiumCalculator, creates new Policy record with P-{0000} auto-number
   */
  public createPolicyFromQuote(data: {
    recordType: InsuranceLine;
    customerId: string;
    policyStartDate: string;
    policyState: string;
    // Auto fields
    vin?: string;
    modelYear?: string;
    vehicleMakeModel?: string;
    // Property fields
    squareFootage?: number;
    yearBuilt?: string;
    propertyAddress?: string;
    // Life fields
    beneficiaryName?: string;
    policyTermMonths?: number;
    coverageAmount?: number;
  }): { success: boolean; policy?: Policy; errorMessage?: string } {
    // 1. Validation Rule: VIN_Must_Be_17_Characters
    if (data.recordType === 'Auto') {
      const vinCheck = validateVIN(data.recordType, data.vin);
      if (!vinCheck.isValid) {
        return { success: false, errorMessage: vinCheck.errorMessage };
      }
    }

    // 2. Apex Invocable Action: PremiumCalculator.calculatePremium()
    const ratingInput: RatingInput = {
      recordType: data.recordType,
      policyState: data.policyState,
      vin: data.vin,
      modelYear: data.modelYear,
      squareFootage: data.squareFootage,
      yearBuilt: data.yearBuilt,
      policyTermMonths: data.policyTermMonths,
      coverageAmount: data.coverageAmount
    };
    const calculation = calculatePremium(ratingInput);

    // 3. Generate Auto-Number P-{0000}
    const maxNum = this.policies.reduce((max, p) => {
      const num = parseInt(p.id.replace('P-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `P-${String(maxNum + 1).padStart(4, '0')}`;

    const newPolicy: Policy = {
      id: nextId,
      recordType: data.recordType,
      customerId: data.customerId,
      policyStartDate: data.policyStartDate,
      policyState: data.policyState,
      premium: calculation.totalCalculatedPremium,
      status: 'Active',
      ownerId: this.currentUser.id,
      createdAt: new Date().toISOString(),
      vin: data.vin,
      modelYear: data.modelYear,
      vehicleMakeModel: data.vehicleMakeModel || (data.modelYear ? `${data.modelYear} Vehicle` : undefined),
      squareFootage: data.squareFootage,
      yearBuilt: data.yearBuilt,
      propertyAddress: data.propertyAddress,
      beneficiaryName: data.beneficiaryName,
      policyTermMonths: data.policyTermMonths,
      coverageAmount: data.coverageAmount
    };

    this.policies.unshift(newPolicy);
    this.persist();
    return { success: true, policy: newPolicy };
  }

  // --- Claims & Automation ---
  public getClaims(): Claim[] {
    return [...this.claims];
  }

  public getClaimById(id: string): Claim | undefined {
    return this.claims.find(c => c.id === id);
  }

  public getClaimsForCustomer(customerId: string): Claim[] {
    const customerPolicies = this.getPoliciesForCustomer(customerId).map(p => p.id);
    return this.claims.filter(c => customerPolicies.includes(c.policyId));
  }

  public getClaimsForPolicy(policyId: string): Claim[] {
    return this.claims.filter(c => c.policyId === policyId);
  }

  /**
   * Record-Triggered Flow on Claim Object:
   * 1. Fetches Policy RecordType
   * 2. Routes by Policy Type: Auto -> Auto Queue, Property -> Property Queue, Life -> Life Queue
   * 3. Syncs Policy State -> policyAccountHolderState (for Sharing Rules)
   * 4. Milestone 4 High-Value Automation: If claimAmount > 50,000, trigger High Value Approval Process (Step 1 Senior Adjuster)
   */
  public createClaimWithRecordTriggeredFlow(input: {
    policyId: string;
    claimAmount: number;
    dateOfLoss: string;
    description: string;
    recordType?: ClaimRecordType;
  }): { success: boolean; claim?: Claim; message: string } {
    const policy = this.getPolicyById(input.policyId);
    if (!policy) {
      return { success: false, message: 'Policy not found.' };
    }

    // Determine Claim Record Type from Policy Line if not specified
    let claimRT: ClaimRecordType = 'Accident';
    if (policy.recordType === 'Property') claimRT = 'Property';
    if (policy.recordType === 'Life') claimRT = 'Life';
    if (input.recordType) claimRT = input.recordType;

    // Generate Auto Number C-{0000}
    const maxNum = this.claims.reduce((max, c) => {
      const num = parseInt(c.id.replace('C-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextClaimId = `C-${String(maxNum + 1).padStart(4, '0')}`;

    // Record-Triggered Decision: Route by Policy Type
    let assignedOwnerId = '';
    let assignedOwnerName = '';
    let assignedOwnerType: 'User' | 'Queue' = 'Queue';

    if (policy.recordType === 'Auto') {
      assignedOwnerId = 'queue_auto';
      assignedOwnerName = 'Auto Claims Queue';
    } else if (policy.recordType === 'Property') {
      assignedOwnerId = 'queue_property';
      assignedOwnerName = 'Property Claims Queue';
    } else {
      assignedOwnerId = 'queue_life';
      assignedOwnerName = 'Life Claims Queue';
    }

    let initialStatus: ApprovalStatus = 'New';
    let approvalStep: 1 | 2 | null = null;
    const history: Claim['approvalHistory'] = [
      {
        step: 'Record-Triggered Routing Flow',
        approverName: 'System Automation',
        approverRole: 'Record-Triggered Flow',
        action: 'Submitted',
        comments: `Routed to ${assignedOwnerName} based on Policy Record Type (${policy.recordType}). Policy State synced: ${policy.policyState}.`,
        timestamp: new Date().toISOString()
      }
    ];

    // High Value Claim Check (> $50,000) - Milestone 4
    if (input.claimAmount > 50000) {
      initialStatus = 'Submitted for Approval';
      approvalStep = 1; // Step 1: Senior Adjuster
      assignedOwnerId = 'user_sr_adj';
      assignedOwnerName = 'David Kim (Senior Adjuster)';
      assignedOwnerType = 'User';

      history.push({
        step: 'High Value Threshold Check',
        approverName: 'Record-Triggered Automation',
        approverRole: 'Approval Process Engine',
        action: 'Submitted',
        comments: `Claim amount ($${input.claimAmount.toLocaleString()}) exceeds $50,000.00. Automatic entry into High Value Claim Approval: routed to Senior Adjuster David Kim for Step 1 review.`,
        timestamp: new Date().toISOString()
      });
    }

    const newClaim: Claim = {
      id: nextClaimId,
      claimNumber: nextClaimId,
      recordType: claimRT,
      policyId: policy.id,
      claimAmount: input.claimAmount,
      dateOfLoss: input.dateOfLoss || new Date().toISOString(),
      approvalStatus: initialStatus,
      description: input.description,
      adjusterId: assignedOwnerId,
      ownerId: assignedOwnerId,
      ownerName: assignedOwnerName,
      ownerType: assignedOwnerType,
      policyAccountHolderState: policy.policyState,
      approvalStep,
      approvalHistory: history,
      createdAt: new Date().toISOString()
    };

    this.claims.unshift(newClaim);
    this.persist();

    return {
      success: true,
      claim: newClaim,
      message: input.claimAmount > 50000
        ? `Claim ${nextClaimId} created! High Value automation triggered: assigned to Senior Adjuster for approval.`
        : `Claim ${nextClaimId} created! Record-Triggered Flow routed claim to ${assignedOwnerName}.`
    };
  }

  /**
   * Replicates Milestone 3 Apex ClaimsAdjusterController:
   * public class ClaimsAdjusterController {
   *   @AuraEnabled(cacheable=true)
   *   public static List<ClaimWrapper> getAssignedClaims()
   * }
   */
  public getAssignedClaims(options?: {
    filterPolicyType?: string;
    filterTerritory?: string;
    filterOwner?: 'all' | 'mine' | 'queue' | 'high_value';
  }): ClaimWrapper[] {
    const today = new Date();

    return this.claims
      .map(claim => {
        const policy = this.getPolicyById(claim.policyId);
        const customer = policy ? this.getContactById(policy.customerId) : undefined;

        // Calculate daysOpen: Date.today().daysBetween(Date_of_Loss)
        const lossDate = new Date(claim.dateOfLoss);
        const diffTime = Math.max(0, today.getTime() - lossDate.getTime());
        const daysOpen = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const holderName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Policyholder';
        const pType = policy ? policy.recordType : 'Unknown';

        const wrapper: ClaimWrapper = {
          claimId: claim.id,
          claimNumber: claim.claimNumber,
          claimAmount: claim.claimAmount,
          status: claim.approvalStatus,
          policyType: pType,
          policyHolderName: holderName,
          daysOpen,
          policyState: claim.policyAccountHolderState || (policy ? policy.policyState : 'CA'),
          ownerName: claim.ownerName,
          description: claim.description,
          dateOfLoss: claim.dateOfLoss,
          isHighValue: claim.claimAmount > 50000
        };

        return wrapper;
      })
      .filter(wrapper => {
        // Territory Sharing Rule enforcement:
        // Adjusters only see claims in their assigned territory unless user is Manager/Admin/Senior
        if (
          this.currentUser.role === 'Adjuster' &&
          this.currentUser.territoryState &&
          this.currentUser.territoryState !== 'All'
        ) {
          if (wrapper.policyState !== this.currentUser.territoryState) {
            return false;
          }
        }

        // Territory filter
        if (options?.filterTerritory && options.filterTerritory !== 'All') {
          if (wrapper.policyState !== options.filterTerritory) return false;
        }

        // Policy Type filter (LWC combobox)
        if (options?.filterPolicyType && options.filterPolicyType !== 'All') {
          if (wrapper.policyType !== options.filterPolicyType) return false;
        }

        // Owner / Scope filter
        if (options?.filterOwner === 'mine') {
          const rawClaim = this.getClaimById(wrapper.claimId);
          if (rawClaim && rawClaim.ownerId !== this.currentUser.id) return false;
        } else if (options?.filterOwner === 'queue') {
          const rawClaim = this.getClaimById(wrapper.claimId);
          if (rawClaim && rawClaim.ownerType !== 'Queue') return false;
        } else if (options?.filterOwner === 'high_value') {
          if (!wrapper.isHighValue) return false;
        }

        return true;
      });
  }

  /**
   * Milestone 4: Screen Flow "Approve/Reject Claim" Action & 2-Step Approval Process
   * Step 1: Senior Adjuster -> If approved, routes to Step 2 Manager Review
   * Step 2: Department Manager -> If approved, final status is Approved
   */
  public processApprovalDecision(claimId: string, decision: 'Approve' | 'Reject', comments: string): {
    success: boolean;
    claim?: Claim;
    message: string;
  } {
    const claim = this.getClaimById(claimId);
    if (!claim) {
      return { success: false, message: 'Claim not found.' };
    }

    const timestamp = new Date().toISOString();

    if (decision === 'Reject') {
      claim.approvalStatus = 'Rejected';
      claim.approvalStep = null;
      claim.approvalHistory.push({
        step: claim.approvalStep === 2 ? 'Step 2 Department Manager' : 'Step 1 Senior Adjuster',
        approverName: this.currentUser.name,
        approverRole: this.currentUser.title,
        action: 'Rejected',
        comments: comments || 'Claim rejected during review.',
        timestamp
      });
      this.persist();
      return {
        success: true,
        claim,
        message: `Claim ${claim.claimNumber} has been rejected.`
      };
    }

    // Decision === 'Approve'
    if (claim.claimAmount > 50000) {
      if (claim.approvalStep === 1) {
        // Step 1 passed -> escalate to Step 2 Department Manager
        claim.approvalStep = 2;
        claim.approvalStatus = 'Submitted for Approval';
        claim.ownerId = 'user_mgr_01';
        claim.ownerName = 'Victoria Sterling (Manager)';
        claim.ownerType = 'User';
        claim.approvalHistory.push({
          step: 'Step 1 Senior Adjuster',
          approverName: this.currentUser.name,
          approverRole: this.currentUser.title,
          action: 'Approved',
          comments: comments || 'Senior Adjuster verified damage scope. Escalated to Department Manager for Step 2 authorization.',
          timestamp
        });
        this.persist();
        return {
          success: true,
          claim,
          message: `Step 1 Approved! Claim ${claim.claimNumber} routed to Department Manager for final Step 2 review.`
        };
      } else {
        // Step 2 approved -> Final Approval
        claim.approvalStep = null;
        claim.approvalStatus = 'Approved';
        claim.approvalHistory.push({
          step: 'Step 2 Manager Review',
          approverName: this.currentUser.name,
          approverRole: this.currentUser.title,
          action: 'Approved',
          comments: comments || 'Final executive approval granted. Disbursal authorized.',
          timestamp
        });
        this.persist();
        return {
          success: true,
          claim,
          message: `Claim ${claim.claimNumber} has received final Executive Manager Approval!`
        };
      }
    } else {
      // Standard claim (< $50k) single-step approval
      claim.approvalStatus = 'Approved';
      claim.approvalStep = null;
      claim.approvalHistory.push({
        step: 'Claim Review',
        approverName: this.currentUser.name,
        approverRole: this.currentUser.title,
        action: 'Approved',
        comments: comments || 'Claim approved by adjuster.',
        timestamp
      });
      this.persist();
      return {
        success: true,
        claim,
        message: `Claim ${claim.claimNumber} approved successfully.`
      };
    }
  }

  /**
   * Reset store to initial seed data
   */
  public resetToDefaults() {
    this.contacts = [...INITIAL_CONTACTS];
    this.policies = [...INITIAL_POLICIES];
    this.claims = [...INITIAL_CLAIMS];
    this.currentUser = INITIAL_USERS[1];
    localStorage.clear();
    this.persist();
  }
}

export const insuranceStore = new InsuranceStore();
