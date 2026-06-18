Update only the **Tendering Module** under the **Procurement Module**. Maintain the existing portal theme, layout, typography, spacing, navigation, colors, and workflow. Do not modify any other modules or screens. Ensure all existing flows remain unchanged.

---

# TENDERING MODULE CHANGES

The Tendering module will continue to have two submenus:

* **Tenders**
* **New Tender**

By default, **Tenders** should open.

---

# 1. TENDERS MODULE

## Tender List Screen

Display a table containing all saved tenders.

### Table Columns

1. Tender Title
2. Tender Ref No
3. Tender ID
4. Organizational Chain
5. View

Create approximately 10 sample tenders.

The View button should open a separate read-only Tender Details page.

---

# Tender Details Screen (Read Only)

Design this screen similar to the attached screenshot.

Use the same layout and styling as the existing portal.

Display the following information at the top:

### Basic Information Section

* Organization Chain
* Tender Title
* Tender Ref No
* Tender ID

All values are auto-generated from the saved tender.

Users should only be able to view information.

No editing should be allowed.

---

## Tender Process Tracking Table

Create a table with four columns:

| Stages | Status | View | Download |

---

### Process 1

#### Technical Bid Opening

Status should display green tick when document exists.

View button:

* Opens uploaded document.

Download button:

* Downloads uploaded document.

---

#### Technical Evaluation

Status should display green tick when document exists.

View button:

* Opens uploaded document.

Download button:

* Downloads uploaded document.

---

### Process 2

#### Financial Bid Opening

Status should display green tick when document exists.

View button:

* Opens uploaded document.

Download button:

* Downloads uploaded document.

---

#### Financial Evaluation

Status should display green tick when document exists.

View button:

* Opens uploaded document.

Download button:

* Downloads uploaded document.

---

#### AOC

Status should display green tick when document exists.

View button:

* Opens uploaded document.

Download button:

* Downloads uploaded document.

---

### Bottom Action

Provide a Back button on the bottom-right corner.

Clicking Back should navigate to the Tender List page.

---

# 2. NEW TENDER MODULE

When the user clicks "New Tender", open a screen visually similar to the attached screenshot.

This page should allow users to create a new tender.

Use the same UI style and spacing as the rest of the portal.

---

# Basic Information Section

User fills:

### Organization Chain

Text field

---

### Tender Title

Text field

---

### Tender Ref No

Text field

---

### Tender ID

Text field

---

# Tender Process Table

Create a table with five columns:

| Stages | Upload Document | Status | View | Download |

---

## Process 1

### Technical Bid Opening

Upload button for PDF/document.

Initially:

Status = Red Cross.

After upload:

Status automatically changes to Green Tick.

View button becomes active.

Download button becomes active.

---

### Technical Evaluation

Same behavior.

---

## Process 2

### Financial Bid Opening

Same behavior.

---

### Financial Evaluation

Same behavior.

---

### AOC

Same behavior.

---

# Stage Status Rules

Before upload:

* Red Cross icon
* View disabled
* Download disabled

After upload:

* Green Tick icon
* View enabled
* Download enabled

The status should update automatically immediately after uploading the file.

---

# Save Button Logic

There are five stages and five documents.

### Until all five documents are uploaded:

Hide Save button.

Only Cancel button should remain visible.

---

### After all five documents are uploaded:

Show:

* Save button
* Cancel button

---

# Cancel Button

Cancel button should always remain visible.

Clicking Cancel returns user to the Tender List page without saving.

---

# Save Functionality

After clicking Save:

1. Create the tender.
2. Store all details.
3. Add the newly created tender automatically into the Tenders list.
4. The View button from the Tender List should open the read-only Tender Details screen.
5. All uploaded documents should be available under View and Download columns.

---

# Read Only Restrictions

Inside the Tender Details page opened from Tenders:

Users must only have permission to:

* View documents.
* Download documents.

Users must NOT be able to:

* Edit any information.
* Upload new documents.
* Delete documents.
* Change statuses.
* Modify any stage.

---

# UI Requirements

Maintain complete consistency with the existing portal:

* Same colors.
* Same cards and borders.
* Same typography.
* Same table styling.
* Same spacing.
* Same button styles.
* Same navigation pattern.

Use green tick icons for completed stages and red cross icons for pending stages.

---

# Important

Do not modify:

* Procurement module structure.
* Existing navigation.
* Any other screen.
* Any other workflow.

Only update the Tendering module while preserving the entire application flow and UI consistency.
