Update the existing portal screens according to the latest approved DMRR SRS.
Do not redesign the portal.
Do not change branding, theme, colors, navigation structure or existing modules.
Update only the screens listed below.
WP-S01 — LOGIN
Module:
Authentication
Roles:
Operator (OP)
Administrator (ADM)
Purpose:
Authenticate portal users and route them to the appropriate dashboard.
Fields:
User ID (Text)
Password (Masked Password)
Actions:
Login
Validation:
After 5 failed login attempts display:
"Account Locked – Contact Administrator"
Navigation:
App URL
→ Login
On Success:
Operator
→ WP-S02 Operator Dashboard
Administrator
→ Admin Home
Additional Logic:
Password expiry handling
Login audit entry
Last login timestamp
WP-S02 — OPERATOR HOME DASHBOARD
Module:
Dashboard
Role:
Operator
Purpose:
Primary landing page showing Proposal Monitoring KPIs, Procurement KPIs and Budget Monitoring.
Filters:
Financial Year
District
Disaster Type
Department
Actions:
New Proposal
Open Proposal
KPI Drill Down
Reports
Procurement Module
Navigation:
WP-S01
→ WP-S02
WP-S02
→ WP-S03
→ WP-S04
→ WP-S18
→ WP-S30
DASHBOARD KPI SECTION
Replace generic KPI cards.
Use connected workflow visualization.
SECTION 1 — MITIGATION PROPOSALS
A. Total Proposals
Parent KPI
Display:
Total Proposals
Child KPIs:
Approved Proposals
Pending Proposals
Rejected Proposals
Each KPI is clickable.
On click:
Display Proposal List Screen filtered accordingly.
B. Proposals Under Review
Display:
PAC
TAC
SEC
SDMA
For each stage:
Show:
Proposal Count
Pending Days
Clicking a stage:
Opens filtered proposal register.
Examples:
PAC
→ Show all PAC proposals
TAC
→ Show all TAC proposals
SEC
→ Show all SEC proposals
SDMA
→ Show all SDMA proposals
C. Budget Section
Filter:
Financial Year
Display:
Budget Allocated
Budget Received
Budget Utilized
Use:
Donut Chart
Utilization Gauge
Trend Chart
SECTION 2 — PROCUREMENT
Filter:
Financial Year
Display:
Total Procured Items
Procurement Value
Visualizations:
Year-wise Procurement Trend
Budget Spent by Beneficiary Department
Use:
Pie Chart
Departments:
PWD
WRD
Health
Forest
Urban Development
Rural Development
PSU
All charts should support drill-down.
WP-S03 — PROPOSAL CREATE
Module:
Proposal Initiation
Role:
Operator
Purpose:
Multi-step proposal creation wizard.
Fields:
Step 1:
Disaster Type
State
District
Taluka
Step 2:
Department
Elected Representative
Receiving Authority
Officer In Charge
Step 3:
NDMA Guideline Reference
Step 4:
Document Upload
Proposal Demand File
Actions:
Next
Back
Save Draft
Run NDMA Validation
Submit
Navigation:
WP-S02
→ WP-S03
After Submit
WP-S03
→ WP-S04
State becomes:
S02
Read-only after submission.
NEW SCREEN
WP-S03A — PROPOSAL LIST
Role:
Operator
Administrator
Purpose:
Display all proposals.
Features:
Search Bar
Global Filters
Status Filter
Stage Filter
District Filter
Department Filter
Columns:
Proposal ID
Disaster Type
District
Department
Current Stage
Status
Created Date
Actions:
View
Navigation:
WP-S03A
→ WP-S04
This screen is also opened from Dashboard KPI drill-downs.
WP-S04 — PROPOSAL DETAIL
Module:
Proposal Management
Roles:
Operator
Administrator
Purpose:
Complete read-only proposal record.
Tabs:
Overview
Display:
Proposal Metadata
Current Stage
Department
Budget
Documents
Display:
All uploaded files
Actions:
View
Download
Timeline
Display graphical workflow timeline.
Use actual DMRR workflow stages.
Audit
Display:
Action
User
Timestamp
Remarks
Actions:
Update Stage
Upload Document
View Document
Export Audit Trail (PDF)
Navigation:
WP-S04
→ WP-S05
→ WP-S06
→ WP-S07
WP-S05 — STAGE UPDATE SCREEN
Module:
Workflow Management
Role:
Operator
Purpose:
Dynamic stage transition interface.
Render screen according to current proposal stage.
STAGE 1
DDMA & Line Department Workflow
Fields:
Desk Officer Approved DPR/PPR?
Options:
Yes
No
If Yes:
Mandatory:
Upload Approval Document
If No:
Mandatory:
Reason for Rejection
Additional Action:
Revision
Status:
Sent for Revision
STAGE 2
PMU Review
Fields:
PMU Observation
Compliance Flag
Revision Requirement
Actions:
Approve
Reject
Revision
STAGE 3
PAC Evaluation
Decision:
Approve
Reject
Revision
If Approve:
Mandatory:
PAC MoM Upload
If Reject:
Move Proposal to:
General List
If Revision:
Observation Notes
STAGE 4
TAC Evaluation
Decision:
Approve
Reject
Revision
If Approve:
Mandatory:
TAC MoM Upload
If Reject:
Mandatory:
Reason
If Revision:
Observation Notes
STAGE 5
SEC Evaluation
Decision:
Approve
Reject
Revision
If Approve:
Mandatory:
SEC MoM Upload
If Reject:
Mandatory:
Reason
If Revision:
Observation Notes
STAGE 6
SDMA Evaluation
Decision:
Approve
Reject
Revision
If Approve:
Mandatory:
SDMA MoM Upload
If Reject:
Mandatory:
Reason
If Revision:
Observation Notes
Actions:
Validate Transition
Upload Attachment
Confirm Transition
Cancel
Navigation:
WP-S05
→ WP-S04
Proposal should return to detail screen with updated stage.
WP-S06 — DOCUMENT UPLOAD
Module:
Document Management
Role:
Operator
Purpose:
Upload supporting documents and trigger OCR.
Fields:
File Upload
Document Type
Version Note
Allowed Formats:
PDF
DOCX
DOC
XLSX
JPG
PNG
Maximum:
25 MB
Actions:
Upload
Cancel
OCR Status:
Pending
Processing
Done
Failed
Navigation:
WP-S06
→ WP-S04
After OCR Complete
Document becomes available in:
WP-S07
WP-S07 — DOCUMENT VIEWER
Module:
Document Intelligence
Roles:
Operator
Administrator
Purpose:
View uploaded document and OCR output.
Layout:
Three-panel view.
Panel 1:
Original Document
Panel 2:
OCR Extracted Text
Panel 3:
Structured Metadata
Display:
SHA-256 Hash
OCR Status
Version Number
Upload Date
Actions:
Download Original
View Extracted Text
Verify Hash
Administrator Only:
Re-OCR
Navigation:
WP-S07
→ WP-S04
WP-S08 — STATE / DISTRICT / TALUKA MASTER
Module:
Master Data
Role:
Administrator
Purpose:
Maintain hierarchy.
Fields:
Level Code
Name
Parent
Active Flag
Actions:
Add
Edit
Deactivate
View Version History
Bulk Upload
Bulk Upload Formats:
CSV
Excel
Navigation:
WP-S08
→ WP-S08
Self-maintained hierarchy screen.