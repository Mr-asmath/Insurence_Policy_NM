import { Contact, Policy, Claim, AppUser } from '../types/insurance';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user_agent_01',
    name: 'Alex Mercer',
    role: 'Agent',
    territoryState: 'All',
    email: 'alex.mercer@insurecloud.internal',
    title: 'Licensed Insurance Agent'
  },
  {
    id: 'user_adj_ca',
    name: 'Marcus Vance',
    role: 'Adjuster',
    territoryState: 'CA',
    email: 'marcus.vance@insurecloud.internal',
    title: 'Field Claims Adjuster (CA Territory)'
  },
  {
    id: 'user_adj_tx',
    name: 'Elena Perez',
    role: 'Adjuster',
    territoryState: 'TX',
    email: 'elena.perez@insurecloud.internal',
    title: 'Field Claims Adjuster (TX Territory)'
  },
  {
    id: 'user_sr_adj',
    name: 'David Kim',
    role: 'SeniorAdjuster',
    territoryState: 'All',
    email: 'david.kim@insurecloud.internal',
    title: 'Senior Claims Adjuster (Level 1 Reviewer)'
  },
  {
    id: 'user_mgr_01',
    name: 'Victoria Sterling',
    role: 'Manager',
    territoryState: 'All',
    email: 'victoria.sterling@insurecloud.internal',
    title: 'Department Claims Manager (Level 2 Final Reviewer)'
  },
  {
    id: 'user_admin',
    name: 'Salesforce Admin',
    role: 'Admin',
    territoryState: 'All',
    email: 'admin@insurecloud.internal',
    title: 'System Administrator'
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'con_001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(415) 555-0142',
    state: 'CA',
    streetAddress: '742 Evergreen Terrace',
    city: 'San Francisco',
    zipCode: '94102',
    ownerId: 'user_agent_01'
  },
  {
    id: 'con_002',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(512) 555-0198',
    state: 'TX',
    streetAddress: '1204 Congress Ave',
    city: 'Austin',
    zipCode: '78701',
    ownerId: 'user_agent_01'
  },
  {
    id: 'con_003',
    firstName: 'Marcus',
    lastName: 'Rivera',
    email: 'marcus.rivera@example.com',
    phone: '(310) 555-0187',
    state: 'CA',
    streetAddress: '883 Ocean Blvd',
    city: 'Santa Monica',
    zipCode: '90401',
    ownerId: 'user_agent_01'
  },
  {
    id: 'con_004',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@example.com',
    phone: '(214) 555-0112',
    state: 'TX',
    streetAddress: '450 Elm Street',
    city: 'Dallas',
    zipCode: '75201',
    ownerId: 'user_agent_01'
  }
];

export const INITIAL_POLICIES: Policy[] = [
  {
    id: 'P-0001',
    recordType: 'Auto',
    customerId: 'con_001',
    policyStartDate: '2024-01-15',
    policyState: 'CA',
    premium: 1250.00,
    status: 'Active',
    ownerId: 'user_agent_01',
    vin: '1HGCR2F83HA029410',
    modelYear: '2016',
    vehicleMakeModel: '2016 Honda Accord EX-L',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'P-0002',
    recordType: 'Property',
    customerId: 'con_001',
    policyStartDate: '2024-03-01',
    policyState: 'CA',
    premium: 1352.50,
    status: 'Active',
    ownerId: 'user_agent_01',
    squareFootage: 2450,
    yearBuilt: '1998',
    propertyAddress: '742 Evergreen Terrace, San Francisco, CA',
    createdAt: '2024-02-28T14:30:00Z'
  },
  {
    id: 'P-0003',
    recordType: 'Life',
    customerId: 'con_001',
    policyStartDate: '2023-11-01',
    policyState: 'CA',
    premium: 830.00,
    status: 'Active',
    ownerId: 'user_agent_01',
    beneficiaryName: 'Eleanor Doe',
    policyTermMonths: 240,
    coverageAmount: 500000,
    createdAt: '2023-10-25T09:15:00Z'
  },
  {
    id: 'P-0004',
    recordType: 'Auto',
    customerId: 'con_002',
    policyStartDate: '2024-04-10',
    policyState: 'TX',
    premium: 1050.00,
    status: 'Active',
    ownerId: 'user_agent_01',
    vin: '4T1B11HK5JU849201',
    modelYear: '2020',
    vehicleMakeModel: '2020 Toyota Camry LE',
    createdAt: '2024-04-05T11:20:00Z'
  },
  {
    id: 'P-0005',
    recordType: 'Property',
    customerId: 'con_002',
    policyStartDate: '2024-05-01',
    policyState: 'TX',
    premium: 1115.00,
    status: 'Active',
    ownerId: 'user_agent_01',
    squareFootage: 2100,
    yearBuilt: '2005',
    propertyAddress: '1204 Congress Ave, Austin, TX',
    createdAt: '2024-04-20T16:00:00Z'
  },
  {
    id: 'P-0006',
    recordType: 'Auto',
    customerId: 'con_003',
    policyStartDate: '2024-06-01',
    policyState: 'CA',
    premium: 1150.00,
    status: 'Active',
    ownerId: 'user_agent_01',
    vin: '5YJ3E1EB8LF819203',
    modelYear: '2021',
    vehicleMakeModel: '2021 Tesla Model 3',
    createdAt: '2024-05-28T13:45:00Z'
  }
];

// Helper to compute ISO date relative to current time
const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'C-0001',
    claimNumber: 'C-0001',
    recordType: 'Accident',
    policyId: 'P-0001',
    claimAmount: 4850.00,
    dateOfLoss: daysAgo(10),
    approvalStatus: 'New',
    description: 'Rear-ended at low speed during commute on Highway 101. Rear bumper and sensor replacement required.',
    adjusterId: 'user_adj_ca',
    ownerId: 'user_adj_ca',
    ownerName: 'Marcus Vance',
    ownerType: 'User',
    policyAccountHolderState: 'CA',
    approvalStep: null,
    approvalHistory: [
      {
        step: 'Claim Creation',
        approverName: 'System / Record-Triggered Flow',
        approverRole: 'System Automation',
        action: 'Submitted',
        comments: 'Auto claim routed to CA Regional Adjuster Marcus Vance.',
        timestamp: daysAgo(10)
      }
    ],
    createdAt: daysAgo(10)
  },
  {
    id: 'C-0002',
    claimNumber: 'C-0002',
    recordType: 'Accident',
    policyId: 'P-0006',
    claimAmount: 64200.00, // HIGH VALUE (> $50,000)
    dateOfLoss: daysAgo(4),
    approvalStatus: 'Submitted for Approval',
    description: 'Multi-vehicle collision on I-405 during heavy rain. Structural frame deformation and high-voltage battery housing damage. Exceeds $50,000 threshold.',
    adjusterId: 'user_sr_adj',
    ownerId: 'user_sr_adj',
    ownerName: 'David Kim (Senior Adjuster)',
    ownerType: 'User',
    policyAccountHolderState: 'CA',
    approvalStep: 1, // Step 1: Senior Adjuster
    approvalHistory: [
      {
        step: 'High Value Routing Rule',
        approverName: 'System Automation',
        approverRole: 'Record-Triggered Flow',
        action: 'Submitted',
        comments: 'Claim amount of $64,200.00 exceeds $50,000.00 threshold. Triggered 2-Step Approval Process (Step 1 Senior Adjuster).',
        timestamp: daysAgo(4)
      }
    ],
    createdAt: daysAgo(4)
  },
  {
    id: 'C-0003',
    claimNumber: 'C-0003',
    recordType: 'Property',
    policyId: 'P-0005',
    claimAmount: 14800.00,
    dateOfLoss: daysAgo(8),
    approvalStatus: 'New',
    description: 'Severe hailstorm damaged asphalt shingles and broken rear skylights in Austin residence.',
    adjusterId: 'user_adj_tx',
    ownerId: 'queue_property_tx',
    ownerName: 'Property Claims Queue',
    ownerType: 'Queue',
    policyAccountHolderState: 'TX',
    approvalStep: null,
    approvalHistory: [
      {
        step: 'Claim Creation',
        approverName: 'System Automation',
        approverRole: 'Record-Triggered Flow',
        action: 'Submitted',
        comments: 'Property claim routed to Property Queue based on Policy Record Type.',
        timestamp: daysAgo(8)
      }
    ],
    createdAt: daysAgo(8)
  },
  {
    id: 'C-0004',
    claimNumber: 'C-0004',
    recordType: 'Property',
    policyId: 'P-0002',
    claimAmount: 78000.00, // HIGH VALUE (> $50,000)
    dateOfLoss: daysAgo(14),
    approvalStatus: 'Submitted for Approval',
    description: 'First floor localized fire originating from adjacent electrical panel. Significant water damage and structural restoration needed.',
    adjusterId: 'user_mgr_01',
    ownerId: 'user_mgr_01',
    ownerName: 'Victoria Sterling (Manager)',
    ownerType: 'User',
    policyAccountHolderState: 'CA',
    approvalStep: 2, // Step 2: Department Manager review!
    approvalHistory: [
      {
        step: 'Initial Submission',
        approverName: 'System Automation',
        approverRole: 'Record-Triggered Flow',
        action: 'Submitted',
        comments: 'Claim amount ($78,000.00) > $50,000.00. Automatic High Value Process triggered.',
        timestamp: daysAgo(14)
      },
      {
        step: 'Step 1 Senior Adjuster',
        approverName: 'David Kim',
        approverRole: 'Senior Adjuster',
        action: 'Approved',
        comments: 'On-site structural contractor estimate verified. Scope of loss accurately reflects contractor bid. Escalating to Department Manager for final sign-off.',
        timestamp: daysAgo(6)
      }
    ],
    createdAt: daysAgo(14)
  },
  {
    id: 'C-0005',
    claimNumber: 'C-0005',
    recordType: 'Life',
    policyId: 'P-0003',
    claimAmount: 25000.00,
    dateOfLoss: daysAgo(22),
    approvalStatus: 'Approved',
    description: 'Accelerated living benefit claim for designated medical condition filed with certified attending physician documentation.',
    adjusterId: 'user_sr_adj',
    ownerId: 'user_sr_adj',
    ownerName: 'David Kim',
    ownerType: 'User',
    policyAccountHolderState: 'CA',
    approvalStep: null,
    approvalHistory: [
      {
        step: 'Claim Review',
        approverName: 'David Kim',
        approverRole: 'Senior Adjuster',
        action: 'Approved',
        comments: 'Medical records and certified physician statement validated. Benefit disbursed.',
        timestamp: daysAgo(18)
      }
    ],
    createdAt: daysAgo(22)
  }
];
