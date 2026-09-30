# Multi-Line Insurance Policy and Claims Management System

## Overview
A comprehensive Salesforce-based solution for managing multi-line insurance operations across Vehicle, Property, and Life insurance. The platform replaces legacy systems with a unified, automated environment that streamlines policy quoting, issuance, and claims handling while delivering a 360-degree customer view.

## Key Objectives

| Objective | Solution Component |
| --- | --- |
| Flexible Data Model | Custom Objects with Record Types and Field Sets |
| Guided Quoting Process | Multi-screen Flow for each policy type |
| Claims Management Dashboard | Lightning Web Components (LWC) + Apex Controller |
| Automated Claims Routing | Record-triggered Flows based on policy type |
| Claims Approval Workflow | Multi-step approval process with automation |
| Data Validation | Validation Rules and field-level enforcement |

## Solution Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    SALESFORCE PLATFORM                       │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │    Policy   │  │    Claim    │  │      Contact         │ │
│  │    Object   │──│    Object   │──│     (Customer)       │ │
│  └─────────────┘  └─────────────┘  └──────────────────────┘ │
│         │               │                    │               │
│         ▼               ▼                    ▼               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Record Types                          │ │
│  │   Auto | Property | Life  │  Accident | Property      │ │
│  └─────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                     Automation Layer                         │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ Screen Flows │  │ Record-Trigger│  │ Approval Process │ │
│  │ (Quoting)     │  │ Flows         │  │ (High Value)     │ │
│  └───────────────┘  └───────────────┘  └──────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                    Programmatic Layer                        │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │ PremiumCalculator    │  │ ClaimsAdjusterController     │ │
│  │ (Apex - Rating)      │  │ (Apex - Dashboard)          │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                        UI Layer (LWC)                         │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │ claimsDashboardLwc   │──│ claimTileLwc                 │ │
│  │ (Main Dashboard)     │  │ (Reusable Tile)              │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                      Security Layer                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │ Agent PS   │  │ Adjuster PS│  │ Manager PS           │ │
│  │ (Quoting)  │  │ (Claims)   │  │ (Reporting/Approvals)│ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Milestone Overview

| Milestone | Focus Area | Key Deliverables |
| --- | --- | --- |
| M1 | Core Data Model & Policy Configuration | Policy/Claim Objects, Record Types, Field Sets, Validation Rules, AutoQuoting Screen Flow |
| M2 | Complex Policy Issuance & Claim Routing | PremiumCalculator Apex, Claims Routing Record-Triggered Flow, Queue Assignment |
| M3 | Claims Adjuster LWC Dashboard | ClaimsAdjusterController Apex, claimsDashboardLwc, claimTileLwc |
| M4 | Advanced Processing, Security & Testing | Approval Process, Submission Flows, Test Class (95%+), Sharing Rules, Permission Sets |

## Technology Stack

| Category | Technologies |
| --- | --- |
| Declarative | Screen Flows, Record-Triggered Flows, Approval Processes, Validation Rules, Record Types, Field Sets |
| Programmatic | Apex Classes, Apex Test Classes, SOQL |
| UI | Lightning Web Components (LWC), SLDS |
| Security | Permission Sets, Sharing Rules, Field-Level Security |
| Integration | Apex Callouts (simulated), Invocable Methods |

## Key Features

- Multi-line support for Auto, Property, and Life insurance
- Guided quoting using step-by-step policy-specific flows
- Dynamic premium calculation using Apex-based rating logic
- Intelligent claims routing with automatic queue assignment
- Adjustable dashboard with client-side filtering for claims teams
- Multi-level approvals for high-value claims over $50,000
- Territory-based sharing rules by state and region
- Role-based access for agents, adjusters, and managers

## Data Model

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Contact      │       │     Policy      │       │      Claim      │
│   (Customer)    │◄──────│                 │◄──────│                 │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ First Name      │       │ Policy Number   │       │ Claim Number    │
│ Last Name       │       │ Customer (Lookup)│       │ Policy (Lookup) │
│                 │       │ Premium         │       │ Claim Amount    │
│                 │       │ Policy Start    │       │ Date of Loss    │
│                 │       │ Policy State    │       │ Approval Status │
│                 │       │ VIN (Auto)      │       │ Adjuster (User) │
│                 │       │ Square Ft (Prop)│       │ Description     │
│                 │       │ Beneficiary(Life)│       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

## Deployment Order

1. Create objects and fields: Policy, Claim, custom fields
2. Configure record types: Auto, Property, Life for both objects
3. Define field sets: Vehicle, Property, Life
4. Add validation rules for data integrity and VIN checks
5. Build Apex classes: PremiumCalculator, ClaimsAdjusterController
6. Implement flows: AutoQuotingFlow, Claims Routing, Submission, Approver Screen
7. Develop LWC components: claimsDashboardLwc, claimTileLwc
8. Configure approval process: High Value Claim Approval
9. Set up security: permission sets, sharing rules
10. Complete testing: ClaimsAdjusterControllerTest

## Success Metrics

- ✅ 95%+ Apex test coverage
- ✅ Reduced quoting time through guided flows
- ✅ Automated claim routing without manual assignment
- ✅ Real-time adjuster dashboard visibility
- ✅ Multi-level approval automation for high-value claims

## User Roles

| Role | Access Level | Key Permissions |
| --- | --- | --- |
| Insurance Agent | Quoting Only | Create and read policy, read claim, flow access |
| Claims Adjuster | Claim Handling | Read policy, edit claim, dashboard access |
| Claims Manager | Reporting & Approvals | Full claim access, manage approvals, run reports |

## Project Structure

```text
force-app/main/default/
├── objects/
│   ├── Policy__c/
│   │   ├── fields/
│   │   ├── recordTypes/
│   │   ├── fieldSets/
│   │   └── validationRules/
│   └── Claim__c/
│       ├── fields/
│       └── recordTypes/
├── classes/
│   ├── PremiumCalculator.cls
│   ├── ClaimsAdjusterController.cls
│   └── ClaimsAdjusterControllerTest.cls
├── flows/
│   ├── AutoQuotingFlow.flow-meta.xml
│   ├── Claims_Routing_Flow.flow-meta.xml
│   ├── Submission_Automation_Flow.flow-meta.xml
│   └── Claim_Approver_Screen_Flow.flow-meta.xml
├── lwc/
│   ├── claimsDashboardLwc/
│   └── claimTileLwc/
├── approvalProcesses/
│   └── High_Value_Claim_Approval.approvalProcess-meta.xml
├── permissionsets/
│   ├── Insurance_Agent_Access.permissionset-meta.xml
│   ├── Claims_Adjuster_Access.permissionset-meta.xml
│   └── Claims_Manager_Access.permissionset-meta.xml
├── sharingRules/
│   └── Claim__c.sharingRules-meta.xml
└── README.md
```

## Metadata

- Version: 1.0
- API Version: 63.0
- Platform: Salesforce
- Last Updated: 2024
