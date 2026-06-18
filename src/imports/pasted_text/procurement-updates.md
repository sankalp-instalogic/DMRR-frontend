Modify the portal navigation panel and Procurement module as described below. Preserve the current theme, colors, spacing, typography, cards, tables, icons, and overall UI style. Do not disturb any existing screens or flows that are not explicitly mentioned.
 
# GLOBAL INSTRUCTION
 
Maintain the current portal UI and design language. All new screens must match existing tables, cards, tabs, buttons, colors, borders, rounded corners, and spacing.
 
Keep Document Management, AI Document Intelligence, and all remaining modules unchanged.
 
---
 
# NAVIGATION PANEL CHANGES
 
Replace the current navigation structure with the following:
 
## 1. Dashboard
 
(No changes)
 
---
 
## 2. Proposals for Mitigation
 
### A. Structural (85%)
 
a. Proposal Initiation
 
b. Proposal List
 
c. DDMA & Line Department
 
d. PAC Evaluation
 
e. TAC Technical Appraisal
 
f. SEC Review
 
g. Administrative Approval
 
h. SDMA Approval
 
i. Tendering
 
j. Project Execution
 
k. Billing & Fund Release
 
l. Project Closure
 
Do not change existing flows of these modules.
 
---
 
### B. Non-Structural (10%)
 
#### a. Red Line Blue Line Survey
 
Open a blank page with centered text:
 
"Module Under Development"
 
#### b. Nature Based Solutions
 
Open a blank page with centered text:
 
"Module Under Development"
 
#### c. Data Management & Tenders
 
Reuse the same Tendering module currently available under Structural.
 
---
 
### C. Research & Grants
 
Open a blank page with centered text:
 
"Module Under Development"
 
---
 
## 3. Rename Procurement Module
 
Rename:
 
Procurement
 
to
 
Proposals for Preparedness & Capacity Building
 
---
 
# PROPOSALS FOR PREPAREDNESS & CAPACITY BUILDING
 
Create four sections.
 
---
 
## A. Procurements
 
Create the following submenu items:
 
### a. Procurement Dashboard
 
Keep exactly as it is.
 
Do not modify.
 
---
 
### b. Procurement List
 
Maintain existing table styling.
 
Show columns:
 
* Procurement ID

* Financial Year

* Item Name

* Demand From (Districts / Army / NDRF / SDRF)

* Vendor

* Award Cost

* Current Status

* Actions
 
Actions section should continue using the existing flow and existing buttons such as:
 
* View

* Print

* Download Summary

* Approval Documents
 
Only add the new columns while preserving the current UI.
 
---
 
### c. New Procurement
 
Follow existing form styling.
 
# Section 1 : Basic Information
 
Capture:
 
### Financial Year
 
Dropdown.
 
### Name of Item
 
Text field.
 
### Demand From
 
Two buttons:
 
* Districts

* Other Departments
 
---
 
If Districts is selected:
 
Show dropdown containing all Maharashtra districts.
 
User selects one district.
 
---
 
If Other Departments is selected:
 
Show dropdown containing:
 
* Army

* NDRF

* SDRF
 
---
 
# Section 2 : Procurement Details
 
Create table with columns:
 
* Sr No

* Item Quantity

* Location
 
Allow multiple rows.
 
Below the table capture:
 
### Award Cost Including GST (₹)
 
Numeric field.
 
### Saving Against AA (₹)
 
Numeric field.
 
### Delivery Deadline as per Contract
 
Date field.
 
Buttons at bottom:
 
* Save

* Cancel
 
---
 
Navigation Logic:
 
If Demand From = District
 
After Save automatically redirect to:
 
Proposal Scrutiny Committee
 
If Demand From = Army / NDRF / SDRF
 
After Save automatically redirect to:
 
Technical Appraisal Committee
 
---
 
### d. Proposal Scrutiny Committee
 
Navigation should open list of procurements currently pending under Proposal Scrutiny Committee.
 
Maintain current table style.
 
Show procurement details.
 
Last column:
 
Status
 
When clicked, open detailed screen.
 
Detailed screen should show:
 
* Procurement ID (Auto Generated)

* Item Quantity and Location table (Auto Generated)
 
Then show:
 
Proposal Scrutiny Committee Decision
 
Two buttons:
 
* Approve

* Reject
 
---
 
If Approve selected:
 
Show:
 
### Date of Approval
 
Date field.
 
### Upload Approval Document
 
Upload button.
 
All fields mandatory.
 
After successful completion show:
 
Forward to TAC button.
 
Cancel button should always remain visible and return user to list page.
 
---
 
If Reject selected:
 
Show:
 
Reason for Rejection
 
Multiline comment box.
 
---
 
### e. Technical Appraisal Committee
 
Same flow as Proposal Scrutiny Committee.
 
Pending procurement list.
 
Detailed screen shows:
 
* Procurement ID

* Item Quantity and Location table
 
Decision:
 
Approve or Reject.
 
---
 
If Approve:
 
Mandatory fields:
 
* Date of Approval

* Upload Approval Document
 
Show:
 
Forward to SEC button.
 
Cancel button visible at all times.
 
---
 
If Reject:
 
Show rejection reason comment box.
 
---
 
### f. SEC Approval
 
Pending procurement list.
 
Status column opens detailed screen.
 
Show:
 
* Procurement ID

* Item Quantity and Location table
 
Decision:
 
Approve or Reject.
 
---
 
If Approve:
 
Mandatory:
 
* Date of Approval

* Upload SEC Approval Document
 
Show:
 
Forward to Administrative Approval button.
 
Cancel button visible throughout.
 
---
 
If Reject:
 
Show rejection reason comment box.
 
---
 
### g. Administrative Approval
 
Pending procurement list.
 
Status opens detailed screen.
 
Show:
 
* Procurement ID

* Item Quantity and Location table
 
Decision:
 
Approve or Reject.
 
---
 
If Approve:
 
Mandatory:
 
* Date of Approval

* Upload Approval Document
 
Show:
 
Forward to Tendering button.
 
Cancel button visible throughout.
 
---
 
If Reject:
 
Show rejection reason comment box.
 
---
 
### h. Tendering / Procurement Docs
 
Reuse the existing Tendering module without any changes.
 
Preserve its complete functionality.
 
---
 
## B. Training
 
Open blank page with centered text:
 
"Module Under Development"
 
---
 
## C. Procurement + Training
 
Open blank page with centered text:
 
"Module Under Development"
 
---
 
## D. Media Budget
 
Open blank page with centered text:
 
"Module Under Development"
 
---
 
# DOCUMENT MANAGEMENT
 
Keep unchanged.
 
---
 
# AI DOCUMENT INTELLIGENCE
 
Keep unchanged.
 
---
 
# IMPORTANT CONSTRAINTS
 
1. Do not disturb existing portal screens.
 
2. Preserve all existing flows.
 
3. Maintain current theme and styling.
 
4. Reuse existing table and card layouts wherever possible.
 
5. Use consistent buttons, tabs, cards, rounded corners, borders, typography and spacing.
 
6. Maintain responsive behavior.
 
7. Preserve dashboard and all unrelated modules.
 
8. Do not delete any current functionality.
 
9. All newly created pages should visually match the rest of the portal.

 