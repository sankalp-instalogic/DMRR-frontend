Update the existing DMRR Project Pipeline Monitoring System (PPMS) portal.

DO NOT create a new portal.

Modify and enhance the existing portal screens, workflows, navigation, dashboard, forms, buttons, stage transitions, document management and procurement modules based on the latest approved DMRR workflow.

Preserve:

Existing theme
Existing layout
Existing navigation
Existing branding
Existing dashboard
Existing modules

Only update screens and workflows where changes are required.

GLOBAL CHANGES

Convert the proposal lifecycle workflow throughout the system to match the following official DMRR process:

PROPOSAL FLOW
Identification of Disaster Mitigation Requirement
Elected Representative submits requirement
Minister / PS / Director / US assigns officer
US / ASO / DO forwards to DDMA
DDMA sends to Line Department
Line Department prepares:
PPR
DPR
Technical Sanction
Submission to Disaster Management Department
Preliminary Scrutiny by Department Desk & PMU
Proposal presented before PAC
PAC validates cumulative district allocation

If Rejected:

General List Published
Proposal closed

If Accepted:

Final DPR submission from Collector
Proposal forwarded to TAC
TAC recommendation
Proposal moved to SDMA
SDMA issues minutes and proposal sent to Finance Department
Tendering & Procurement initiated
Technical & Financial Evaluation
L1 Bid Finalization
L1 sent to DMU for concurrence
Work Order issued
Project Implementation
Quality Monitoring & Evaluation + Audit Compliance
Stage-wise Fund Release
Billing Proposal submitted to DMU
Billing documents with MB Verification
Project Completion Review by DO
Completion Certificate Issued
Asset Transfer / Handover

This workflow must be visible in:

Dashboard
Proposal Detail Screen
Proposal Timeline
Workflow Tracker
Mobile Flow View
DASHBOARD UPDATE

Replace generic KPI cards with connected workflow KPIs.

Display proposal counts as process nodes.

Total Proposals

Branches into:

Approved
Pending
Rejected
Proposals Under Review

Branches into:

PMU Scrutiny
PAC
TAC
SDMA
Line Department Proposals

Department wise:

PWD
Water Resources
Health & Family Welfare
Forest
Urban Development
Rural Development
MJP
PSU
Tendering Pipeline
Tender Initiated
Under Evaluation
L1 Identified
DMU Concurrence
Work Order Issued
Project Monitoring Pipeline
Implementation
Quality Monitoring
Audit Compliance
Billing
Completion
Asset Handover
Budget Snapshot

Show:

Allocated Budget
Received Budget
Utilized Budget
Remaining Budget

Maintain all existing charts and maps.

PROPOSAL INITIATION SCREEN UPDATE

Add fields:

Date of Local Demand
Receiving Authority
Officer in Charge
NDMA Guideline Reference

Mandatory validation:

Cost >= 0
Demand Date <= Today
Demand Date not older than 3 years

Document Uploads:

Mandatory:

PPR
DPR
Technical Sanction

Optional:

Supporting Attachments

Supported formats:

PDF
DOCX
DOC
JPG
PNG

Maximum size:

25 MB

Add:

Upload
View
Download
Replace Version
Delete Draft

Buttons must work.

DOCUMENT MANAGEMENT UPDATE

Every uploaded document must show:

Status
Uploaded
OCR Processing
OCR Complete
OCR Failed
Metadata Panel

Display:

Document Type
Upload Date
Uploaded By
SHA-256 Hash
OCR Status
Version Number

Buttons:

Upload
View
Download
New Version
Compare Versions

Do not overwrite documents.

Each update creates a new version.

PROPOSAL DETAIL SCREEN UPDATE

Add tabs:

Overview
Documents
Timeline
Audit Trail
Workflow Progress

Timeline must show all 28 stages.

Each stage displays:

Date
User
Uploaded document
Remarks
Status
STAGE TRANSITION UPDATE

Add Stage Update modal.

Mandatory:

Remarks
Supporting Document Upload

Buttons:

Save
Forward
Return for Revision
Reject
Close Stage

System must only show valid next stages.

PMU SCRUTINY UPDATE

Add:

Compliance Flag
Domain Expert Comments
Deficiency Notes

Buttons:

Forward to PAC
Hold
Reject
Return for Correction
PAC MODULE UPDATE

Add PAC Decision Logic.

Decision:

Allocation Exceeded

Route to:
General List Published

Allocation Available

Forward to:
Collector Final DPR Submission

Add:

PAC MoM Upload

Buttons:

Approve
Reject
Rework

TAC MODULE UPDATE

Add:

TAC Recommendation
TAC Remarks
TAC MoM Upload

Buttons:

Approve
Revise
Forward to SDMA

SDMA MODULE UPDATE

Add:

SDMA Minutes Upload
Finance Department Forwarding

Buttons:

Approve
Revise
Forward to Finance

PROCUREMENT MODULE UPDATE

Convert Procurement module to 10-stage workflow.

Display:

PS-01 Administrative Approval

PS-02 Procurement Planning

PS-03 GeM Bid Publication

PS-04 Vendor Participation

PS-05 Technical Evaluation

PS-06 Financial Evaluation

PS-07 Contract Award

PS-08 Supply & Delivery

PS-09 Inspection & Acceptance

PS-10 Deployment & Utilization

Create stage board view.

Each stage displays:

Status
Timestamp
Document Count
Open Stage Button
PROCUREMENT STAGE RULES

PS-07:

Auto calculate:

Saving Against AA

If Award Cost > AA Value:

Require:

Cost Overrun Justification Upload

Before closure.

Vendor approval workflow required.

EXECUTION MODULE UPDATE

Add:

Work Order
Implementation Tracking
MPR Upload
Delay Reason Capture
TPQA Upload
Geo-tagged Images
Audit Compliance Tracker

Buttons:

Upload
Edit
View
Download

BILLING MODULE UPDATE

Add:

Stage-wise Fund Release:

25%
50%
75%
100%

Documents:

Invoice Upload
MB Upload
Certification Upload

Buttons:

Upload
View
Download
Approve Release

PROJECT COMPLETION MODULE UPDATE

Add:

Completion Certificate
Final Inspection
Social Audit
Asset Transfer
Handover Records

Buttons:

Upload
View
Download
Generate Closure

AUDIT TRAIL UPDATE

Add export functionality.

Buttons:

Export PDF
Export Excel

Audit trail must display:

Timestamp
User
Role
Action
Before Value
After Value
AI DOCUMENT INTELLIGENCE UPDATE

Add AI Q&A screen.

Features:

Ask Proposal Questions
Ask DPR Questions
Ask PAC Questions
Ask Budget Questions

Display:

Confidence Score
Source Citations
Related Documents

Read-only interface.

ADMIN MODULE UPDATE

Add:

User Management

Role Management

OCR Queue Monitor

System Configuration

NDMA Guideline Registry

Budget Allocation Master

Officer Master

District Master

Taluka Master

Department Master

Vendor Master

Equipment Catalogue

BUTTON BEHAVIOUR (MANDATORY)

Every screen must have working:

Create
Save
Submit
Edit
Upload
Download
View
Delete Draft
Approve
Reject
Revise
Forward
Export PDF
Export Excel

Buttons must navigate to appropriate screens and update workflow state.

No dead buttons.

No placeholder actions.

FINAL INSTRUCTION

Do not redesign the portal.

Do not change theme.

Do not change branding.

Only update existing portal screens, forms, dashboards, workflow trackers, procurement stages, document management, audit trail and navigation to fully align with the latest DMRR workflow and wireframe specification.

Generate high-fidelity production-ready enterprise screens with connected navigation and complete workflow continuity across all modules.