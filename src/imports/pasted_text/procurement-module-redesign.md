PROCUREMENT MODULE – COMPLETE REDESIGN INSTRUCTIONS

Objective:
Redesign the entire Procurement Module and remove all existing procurement workflow pages. The new procurement module should be simplified and data-driven with only four functional sections.

---

## REMOVE EXISTING MODULES

Delete the following sections completely:

• Administrative Approval
• Procurement Planning
• GeM Publication
• Technical Evaluation
• Financial Evaluation
• Contract Award / PO
• Supply & Delivery
• Inspection & Acceptance
• Deployment & Utilization

Only retain Procurement Dashboard and redesign it as specified below.

---

## NEW PROCUREMENT NAVIGATION

Under Procurement, show only:

1. Procurement Dashboard
2. Procurement Register
3. Create Procurement
4. Edit Procurement

Navigation should follow the same UI design language used in Tendering, Billing, Project Execution and Project Closure modules.

---

1. PROCUREMENT DASHBOARD

---

Purpose:
Provide a summary view of all procurement records.

TOP FILTER SECTION

Add filters:

• Financial Year (Dropdown)
• District (Dropdown)
• Line Department (Dropdown)

Add:
• Apply Filter button
• Reset Filter button

---

## KPI SECTION

Remove all existing KPIs and remove the entire "10-Stage Procurement Board View".

Replace with the following KPI Cards:

1. Total Procured Items
   Example: 1,250

2. Budget Approved
   Example: ₹250 Crore

3. Budget Spent
   Example: ₹198 Crore

4. Highest Beneficiary Department
   Example: Rural Development Department

Display KPI cards in a responsive 4-column layout.

---

## PROCUREMENT TABLE

Below KPIs display a procurement table.

Columns:

• Procurement ID
• Financial Year
• Item Name
• Beneficiary Department
• Vendor Name
• Award Cost
• Delivery Completion %
• Status
• View Button
• Update Button

Status examples:

• Draft
• In Progress
• Completed
• Delayed

Actions:

VIEW BUTTON
Opens Procurement Open Screen with all details in read-only mode.

UPDATE BUTTON
Opens Edit Procurement Screen with editable fields.

Use modern table styling similar to Tendering Register.

---

2. PROCUREMENT REGISTER

---

Purpose:
Search and browse all procurement records.

Top Controls:

Search Procurement (Text Search)

Filters:

• Financial Year Dropdown
• Beneficiary Department Dropdown
• District Dropdown
• Procurement Status Dropdown

Buttons:

• Search
• Reset
• New Procurement

---

## REGISTER TABLE

Columns:

• Procurement ID
• Financial Year
• Item Name
• Beneficiary Department
• Vendor
• Award Cost
• Delivery Completion %
• Current Status
• View
• Edit

Use colored status badges.

Pagination at bottom.

---

3. CREATE PROCUREMENT

---

Purpose:
Capture procurement details.

Page Title:
Create Procurement

Section 1:
Basic Information

Fields:

Financial Year
Dropdown

Name of Item
Text Input

Beneficiary Department
Dropdown

Populate from Line Department Master

Vendor Name
Text Input

---

SECTION 2
APPROVALS
---------

A. SEC Approval?

Radio Buttons:

• Yes
• No

If Yes:

Date of Approval
Date Picker

File Upload

If No:

Hide fields

---

B. AA Approval?

Radio Buttons:

• Yes
• No

If Yes:

Date of Approval
Date Picker

File Upload

If No:

Hide fields

---

C. Contract Awarded?

Radio Buttons:

• Yes
• No

If Yes:

Date of Award
Date Picker

File Upload

If No:

Hide fields

---

SECTION 3
PROCUREMENT DETAILS
-------------------

Qty (No)
Numeric Input

Award Cost Including GST
Currency Input

Saving Against AA (Rs.)
Currency Input

Saving Against AA (%)
Percentage Input

Delivery Deadline as per Contract
Date Picker

Number of Items Delivered
Numeric Input

Delivery Completion (%)
Numeric Input

Delivery Location
Text Input

Remarks
Multiline Text Area

---

## BUTTONS

Save

Reset to Default

Save should create a procurement record and store it in database.

After successful save:

Show Success Message:
"Procurement Record Saved Successfully"

---

4. PROCUREMENT OPEN

---

Purpose:
View procurement details.

Page Title:
Procurement Details

Open from:

• Dashboard View Button
• Procurement Register View Button

Behavior:

All fields from Create Procurement screen should be displayed.

All fields must be read-only.

Document Handling:

Instead of upload controls show:

Download SEC Approval Document

Download AA Approval Document

Download Contract Award Document

If document unavailable show:

"No Document Uploaded"

Buttons:

Back

Print

Download Summary

---

5. EDIT PROCUREMENT

---

Purpose:
Modify procurement information.

Open from:

• Dashboard Update Button
• Procurement Register Edit Button

Behavior:

All fields pre-filled with saved procurement data.

All fields editable.

Document Handling:

If file already exists:

Show:

Current Document

Download Button

Replace File Upload Button

If file missing:

Show Upload Button

---

## BUTTONS

Update Procurement

Reset Changes

After Update:

Show Success Message:

"Procurement Record Updated Successfully"

Save changes to database.

---

## DATABASE STRUCTURE

Procurement Table should store:

Procurement ID
Financial Year
Item Name
Beneficiary Department
Vendor Name

SEC Approval Status
SEC Approval Date
SEC Approval File

AA Approval Status
AA Approval Date
AA Approval File

Contract Award Status
Contract Award Date
Contract Award File

Quantity

Award Cost Including GST

Saving Against AA (Rs)

Saving Against AA (%)

Delivery Deadline

Items Delivered

Delivery Completion %

Delivery Location

Remarks

Created Date

Updated Date

Status

---

## USER FLOW

Procurement Dashboard
↓
Procurement Table
↓
View Button → Procurement Open

OR

Update Button → Edit Procurement

OR

New Procurement → Create Procurement

Save → Database

Update → Database

Dashboard and Register automatically reflect latest saved records.
