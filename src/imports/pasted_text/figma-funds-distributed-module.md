# Figma AI Prompt – Preparedness & Capacity Building Module Enhancement

Design and update the existing ERP portal navigation and screens while preserving the same UI, typography, spacing, colors, cards, table styles, buttons, forms, and interaction patterns already used throughout the portal.

Maintain the same dark blue sidebar, rounded cards, light backgrounds, border styles, and modern government dashboard appearance.

---

# Sidebar Changes

Under:

**Proposals for Preparedness & Capacity Building**

Remove:

* B. Training
* C. Procurement + Training
* D. Media Budget

Do NOT modify the existing Procurement module and its internal submodules.

The new structure should be:

A. Procurements
a. Procurement Dashboard
b. Procurement List
c. Procurement Register
d. Proposal Scrutiny Committee
e. Technical Appraisal Committee
f. SEC Approval
g. Administrative Approval
h. Tendering
i. Project Execution
j. Billing
k. Project Closure

B. Funds Distributed
a. To Districts
b. To Other Utilizations

The Funds Distributed section should be expandable/collapsible just like Procurement.

---

# Module 1 : Funds Distributed → To Districts

When the user clicks "To Districts", open a page titled:

# Funds Distributed to Districts

Below the title place two tab buttons:

* Overview
* New Allocation

By default, Overview is active.

Follow the same card style and button style used throughout the portal.

---

# OVERVIEW SCREEN

Display a card containing a table with five dummy records.

Columns:

1. Sr No
2. Issued From Department
3. Amount
4. Date of Issuing
5. District
6. Action

Action column should contain a blue "View" button.

Use alternating row colors and bordered table style consistent with the existing portal.

Dummy districts may include:

* Mumbai
* Pune
* Nashik
* Nagpur
* Thane

---

# VIEW SCREEN

When View is clicked, open a read-only details page.

At the top:

Left side:

← Back button

Right side:

Print button

Print button should allow downloading the page as PDF.

Below display a card with auto-populated fields.

Fields:

### Amount Issued From Department

₹250 Cr

### Budget Allocated

₹225 Cr

### Date of Issuing

15-06-2026

### District

Pune

### GR Document

Provide two buttons:

* View
* Download

No editing allowed.

Everything is read-only.

Maintain same card layout and spacing used in other modules.

---

# NEW ALLOCATION SCREEN

When the user clicks "New Allocation", show a form card.

Fields:

### Amount Issued From Department

Numeric input

### To District

Dropdown containing all Maharashtra districts.

Single select only.

Include:

Mumbai
Pune
Nagpur
Nashik
Thane
Kolhapur
Satara
Sangli
Raigad
Sindhudurg
Ratnagiri
Palghar
Ahmednagar
Solapur
Aurangabad
Jalna
Beed
Latur
Osmanabad
Nanded
Parbhani
Hingoli
Akola
Amravati
Washim
Buldhana
Yavatmal
Wardha
Chandrapur
Gadchiroli
Bhandara
Gondia
Dhule
Nandurbar
Jalgaon

### Issuing Date

Date picker

### Budget Allocated

Numeric field

### GR Upload

File upload field

Accept:

PDF
DOC
DOCX

Bottom buttons:

Save button

Blue filled button.

Cancel button

Border button.

---

# Save Behavior

After Save:

New record should automatically appear in Overview table.

After Cancel:

Navigate back to Overview page.

---

# Module 2 : Funds Distributed → Other Utilizations

When the user clicks "Other Utilizations", open:

# Funds Distributed to Other Utilizations

Below the title provide two tab buttons:

* Overview
* New Utilization

Overview is active by default.

Use same UI pattern as District Allocation module.

---

# OVERVIEW TABLE

Create a card with five dummy rows.

Columns:

1. Sr No
2. Utilization Department
3. Utilization Head
4. Allocated Amount
5. Utilized Amount
6. Date of Issuing
7. Action

Action column contains View button.

Example departments:

PWD

WRD

Health

Forest

Urban Development

Example heads:

Equipment Purchase

Emergency Materials

Flood Protection

Relief Activities

Monitoring Systems

---

# VIEW SCREEN

Top section:

Left:

← Back button

Right:

Print button

Below show read-only details card.

Fields:

### Utilization Department

PWD

### Utilization Head

Flood Protection

### Allocated Amount

₹500 Cr

### Utilized Amount

₹350 Cr

### Date of Issuing

20-05-2026

### Utilization Certificate

Two buttons:

View

Download

No edit capability.

Entire screen should be read-only.

---

# NEW UTILIZATION SCREEN

Form fields:

### Utilization Department

Dropdown

Example values:

PWD
WRD
Health
Forest
Urban Development
Rural Development

### Utilization Head

Text input

### Issuing Date

Date picker

### Budget Allocated

Numeric field

### Budget Utilized

Numeric field

### Utilization Certificate Upload

Document upload

Accept PDF, DOC and DOCX.

Bottom buttons:

Save

Cancel

---

# Save Behavior

Save:

Insert new entry into Overview table.

Cancel:

Return to Overview screen.

---

# Interaction Requirements

Every button must work.

Back buttons navigate properly.

Save updates tables dynamically.

Cancel redirects to Overview page.

View buttons open detail pages.

Print button exports PDF.

View and Download document buttons should be available wherever documents are shown.

Maintain the same visual identity of the portal:

* Dark blue sidebar
* White cards
* Rounded corners
* Border styling
* Consistent spacing
* Government dashboard appearance
* Same fonts
* Same button colors
* Same table styling
* Same form styling
* Responsive layout for desktop and tablet

Ensure the entire workflow feels like a natural extension of the existing ERP portal and matches all current modules visually and functionally.
