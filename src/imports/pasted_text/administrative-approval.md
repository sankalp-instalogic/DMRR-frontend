Add a new module in the left navigation menu under **Proposal for Mitigation**.

Current flow:

* DDMA & Line Department Workflow
* PMU Review
* PAC Review
* TAC Review
* SEC Review
* SDMA Review

Update the flow to:

* DDMA & Line Department Workflow
* PMU Review
* PAC Review
* TAC Review
* SEC Review
* Administrative Approval
* SDMA Review

---

# Administrative Approval Page

The page layout should follow the same design and styling as the existing SEC Review page (same cards, table styling, spacing, borders, fonts and buttons).

---

# Page Header

Title:

Administrative Approval

Subtitle:

Administrative Approval review and approval

---

# Section 1 : Proposal List

Display a table similar to SEC Review.

Columns:

1. Proposal ID
2. Project Name
3. District
4. Line Department
5. Estimated Cost
6. Status

Example status badge:

Pending

(light blue pill)

---

# Status Interaction

When the user clicks the Status badge or row, open the Administrative Approval Evaluation card below.

Initially the evaluation section should remain hidden.

---

# Section 2 : Administrative Approval Evaluation

Card title:

Administrative Approval Evaluation

Horizontal divider below heading.

---

## Field 1

Proposal ID

Read Only

Auto populated from selected row.

Example:

DMRR/2025/MUM/001

---

## Field 2

Meeting Date

Input type:

Date

---

## Field 3

Meeting Time

Input type:

Time

---

# Field 4 : Members Present

Show heading:

Members Present

Display a table.

Columns:

| Sr No | Name | Designation | Action |

Initially one row should exist.

Provide an "Add Member" button above the table.

Each new row should automatically increase Sr No.

Rows except first row should have delete icon.

Action column should contain trash icon.

---

# Field 5 : Attendance Sheet

Label:

Upload Attendance Sheet

Supported files:

* PDF
* DOC
* DOCX

After upload show green success text:

✓ File uploaded successfully

---

# Field 6 : AA Recommendation

Show three buttons exactly like PMU Review styling.

---

## Approve Button

When selected:

Background:

Green

Border:

Green

Text:

Green

Style:

bg-green-100 border-green-600 text-green-700

---

## Reject Button

When selected:

Background:

Red

Border:

Red

Text:

Red

Style:

bg-red-100 border-red-600 text-red-700

---

## Revise Button

When selected:

Background:

Orange

Border:

Orange

Text:

Orange

Style:

bg-orange-100 border-orange-600 text-orange-700

---

Unselected buttons:

border-border hover:bg-muted

---

# Approve Flow

If user selects Approve:

Show:

Upload Administrative Approval Minutes of Meeting

Allow:

PDF

DOC

DOCX

After upload show:

✓ File uploaded successfully

---

# Reject Flow

If user selects Reject

Display textarea.

Label:

Reason for Rejection

Rows:

4

Placeholder:

Enter reason for rejection

---

# Revision Flow

If user selects Revise

Display textarea.

Label:

Observation Notes

Rows:

4

Placeholder:

Provide observation notes

---

# Dynamic Bottom Buttons

The buttons should change according to the recommendation selected.

---

## Default State

Show only:

Cancel

Gray outlined button

No action button should appear initially.

---

# If Approve selected

Do not show action button immediately.

Only after Administrative Approval MoM file is uploaded, display:

Forward to SDMA

Color:

Blue

Style:

Primary button

Icon:

Send

Alignment:

Bottom right

---

# If Reject selected

Hide Forward button.

Display:

Reject Proposal

Red button

Style:

bg-red-600 text-white

Icon:

X

Position:

Bottom right

---

# If Revise selected

Hide Forward button.

Display:

Send For Revision

Orange button

Style:

bg-orange-500 text-white

Icon:

Refresh

Position:

Bottom right

---

# Validation Rules

Meeting Date is mandatory.

Meeting Time is mandatory.

Members Present table should contain at least one member.

Name and Designation should not be blank.

Attendance Sheet upload is mandatory.

---

If Recommendation = Approve

Administrative Approval MoM upload is mandatory.

Only after MoM upload should "Forward to SDMA" button become visible.

---

If Recommendation = Reject

Reason for Rejection is mandatory.

Reject Proposal button becomes visible.

---

If Recommendation = Revise

Observation Notes are mandatory.

Send For Revision button becomes visible.

---

# Maintain Existing UI

Keep exactly the same:

* SEC Review page design
* Card layout
* Table styling
* Rounded corners
* Input styles
* Spacing
* Typography
* Shadow effects
* Status badges
* Responsive behavior

The Administrative Approval page should visually look like a clone of the SEC Review page but with the Administrative Approval workflow and dynamic action buttons.
