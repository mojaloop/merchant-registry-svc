# Legal Entity Identifier (LEI) Implementation Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What is LEI?](#what-is-lei)
3. [Implementation Overview](#implementation-overview)
4. [Database Schema Changes](#database-schema-changes)
5. [GLEIF Verification Process](#gleif-verification-process)
6. [Backend Implementation Details](#backend-implementation-details)
7. [Frontend User Interface](#frontend-user-interface)
8. [API Endpoints](#api-endpoints)
9. [Data Flow & Business Logic](#data-flow--business-logic)
10. [Configuration & Setup](#configuration--setup)

---

## Executive Summary

The merchant registry system has been enhanced to support **Legal Entity Identifiers (LEI)** - a globally recognized standard for uniquely identifying legal entities participating in financial transactions. This implementation integrates with the Global Legal Entity Identifier Foundation (GLEIF) to provide real-time validation of merchant identity and location information.

**Key Benefits:**

- Global merchant identification using standardized 20-character LEI codes
- Automated verification against GLEIF's authoritative database
- Enhanced fraud prevention through entity name and address validation
- Improved interoperability across different financial service providers
- Backward compatibility with existing merchant records

---

## What is LEI?

A **Legal Entity Identifier (LEI)** is a 20-character, alpha-numeric code that uniquely identifies legally distinct entities that engage in financial transactions. It's maintained by the Global Legal Entity Identifier Foundation (GLEIF) and is used worldwide.

**Example LEI:** `529900AXZOJO15EBGR24` (Bamburi Cement Public Limited Company)

**More Information:** [GLEIF](https://www.gleif.org/)

---

## Implementation Overview

### System Architecture

The LEI implementation spans three main components:

1. **Acquirer Backend** - Handles merchant registration and GLEIF validation
2. **Registry Oracle** - Manages merchant aliases and lookup services
3. **Acquirer Frontend** - Provides user interface for LEI entry and display

### Core Features

#### LEI Validation

When a merchant provides an LEI during registration, the system:

- Validates the LEI format (20 alphanumeric characters)
- Queries the GLEIF API to verify the LEI exists
- Confirms the provided business name matches GLEIF records
- Returns clear error messages if validation fails

#### Location Verification

For merchants with LEIs, location data is validated against GLEIF records:

- Street name and building number
- City/town and postal code
- Country and subdivision (state/province/region)
- Intelligent matching handles format variations (e.g., "US" vs "United States")

#### Smart Alias Generation

The system automatically generates merchant identifiers:

- **If LEI exists:** Uses the LEI as the merchant alias
- **If no LEI:** Generates a numeric alias (10000000 + merchant_id)

#### Verification Tracking

Every successful GLEIF validation updates a timestamp (`gleif_verified_at`), allowing:

- Audit trails of verification history
- Visual indicators in the UI showing verification status
- Monitoring of validation coverage across merchants

---

## Database Schema Changes

### Merchants Table

Two new fields have been added to track LEI information:

| Field Name          | Type        | Description                                          | Example                |
| ------------------- | ----------- | ---------------------------------------------------- | ---------------------- |
| `lei`               | VARCHAR(20) | Stores the 20-character Legal Entity Identifier      | `529900AXZOJO15EBGR24` |
| `gleif_verified_at` | TIMESTAMP   | Records when the LEI was last verified against GLEIF | `2024-01-17 10:30:00`  |

**Key Characteristics:**

- Both fields are **nullable** - LEI is optional for merchants
- `lei` field has a maximum length constraint of 20 characters
- `gleif_verified_at` is automatically updated on successful validation
- Existing merchants without LEIs continue to function normally

### Registry Table (Oracle)

The registry table stores merchant registration data for lookups:

| Field Name    | Type         | Description                                    |
| ------------- | ------------ | ---------------------------------------------- |
| `lei`         | VARCHAR(255) | Stores the LEI for lookup purposes             |
| `alias_value` | VARCHAR(255) | Can be either an LEI or numeric alias          |
| `alias_type`  | VARCHAR(255) | Indicates type: 'LEI' or '8-digit merchant_id' |

## GLEIF Verification Process

### Service Configuration

The system connects to GLEIF's public API for validation:

**Base URL:** `https://api.gleif.org/api/v1`

### Validation Workflow

#### 1. LEI Format Validation

Before making any API calls, the system validates:

- Length is exactly 20 characters
- Contains only uppercase letters (A-Z) and digits (0-9)
- Matches pattern: `^[A-Z0-9]{20}$`

**Invalid Examples:**

- `123` (too short)
- `12345678901234567890a` (lowercase not allowed)
- `ABCDEFGHIJ1234567890!` (special characters not allowed)

#### 2. GLEIF API Lookup

The system queries GLEIF to retrieve:

- Legal entity name
- Legal address information

#### 3. Entity Name Verification

The system compares the merchant's provided business name with the legal name from GLEIF:

- Case-insensitive comparison
- Whitespace is trimmed
- Must be an exact match

**Why this matters:** Prevents fraudulent merchants from using someone else's LEI.

#### 4. Location Validation

When a merchant adds location information, the system validates each address field:

| Field               | Validation                                                |
| ------------------- | --------------------------------------------------------- |
| **Street Name**     | Exact match with GLEIF address                            |
| **Building Number** | Exact match with GLEIF address                            |
| **Postal Code**     | Exact match with GLEIF address                            |
| **Town/City**       | Exact match with GLEIF address                            |
| **Country**         | Intelligent matching (handles ISO codes and full names)   |
| **Subdivision**     | Intelligent matching (handles state codes and full names) |

**Intelligent Matching Examples:**

- `US` matches `United States of America`
- `CA` (California) matches `California` in US context
- `NSW` matches `New South Wales` in Australia context

### Country & Subdivision Handling

The system includes:

- **240+ country mappings** (ISO codes ↔ full names)
- **Integration with REST Countries API** for dynamic validation
- **Subdivision mapping service** for state/province matching
- **Confidence-based matching** (threshold: 50%) for variations

---

## Backend Implementation Details

### Merchant Registration Flow

**Step 1: User submits merchant data with LEI**

The registration form includes an optional LEI field. When provided, the LEI undergoes validation.

**Step 2: Schema validation**

The system validates all input data:

- Business name (required)
- LEI (optional, max 20 characters)
- Merchant category (required)
- Other business details

**Step 3: GLEIF validation**

If an LEI is provided:

1. Check LEI format
2. Call GLEIF API
3. Verify entity name matches
4. Extract country and status information

**Step 4: Save to database**

On successful validation:

- Merchant record is created with LEI
- `gleif_verified_at` timestamp is set
- Audit log entry is created

**Step 5: Error handling**

If validation fails, the user receives a clear error message:

- "Invalid LEI format. LEI must be exactly 20 alphanumeric characters."
- "LEI not found in GLEIF database"
- "Provided entity name 'ABC Corp' does not match registered legal name 'ABC Corporation' from GLEIF"
- "GLEIF API rate limit exceeded. Please try again later."

### Location Validation Flow

**When location data is added:**

1. **Check if merchant has an LEI**

   - If no LEI: Skip validation, save location directly
   - If LEI exists: Proceed with GLEIF validation

2. **Fetch LEI record from GLEIF**

   - Retrieve legal address information
   - Extract expected values for each field

3. **Compare provided data with GLEIF data**

   - Field-by-field comparison
   - Accumulate any mismatches

4. **Apply intelligent matching**

   - Country codes/names are normalized
   - Subdivisions are matched using mapping service
   - Minor variations are handled

5. **Return validation result**
   - If all fields match: Save location, update verification timestamp
   - If mismatches found: Return detailed error message with specific field mismatches

### Registry Oracle Integration

**Purpose:** Creates merchant aliases for payment routing

**Registration Logic:**

When a merchant is approved and registered in the oracle:

```
IF merchant has LEI:
    alias_value = LEI code (e.g., "549300IEX0E9QXUWVF29")
    alias_type = "LEI"
ELSE:
    alias_value = 10000000 + merchant_id (e.g., "10000123")
    alias_type = "8-digit merchant_id"
```

**Benefits:**

- LEI-enabled merchants can be discovered globally using their LEI
- Legacy merchants continue using numeric aliases
- Both methods coexist seamlessly

---

## Frontend User Interface

### Business Information Form

The merchant registration form includes an LEI input field:

**Location:** Business Information step (first step of registration)

**Field Details:**

- **Label:** "Legal Entity Identifier (LEI)"
- **Placeholder:** "LEI (up to 20 characters)"
- **Required:** No (optional field)
- **Validation:** Maximum 20 characters (client-side)

**User Experience:**

- Users can optionally enter their LEI during registration
- Real-time character count helps users stay within limit
- Server-side validation provides detailed feedback on submission
- If validation fails, user sees specific error message and can correct

### Merchant Records Tables

All merchant listing pages now display LEI information:

**New Columns Added:**

1. **LEI Column**

   - Shows the merchant's LEI code if registered
   - Displays "N/A" if no LEI is registered
   - Helps admins quickly identify LEI-enabled merchants

2. **Last Verification Column**
   - Shows verification status with color-coded indicators:
     - **Green "Verified"** - Has been validated against GLEIF (shows date/time)
     - **Orange "Pending"** - Not yet verified

**Visual Example:**

```
| ID | DBA Name     | LEI                      | Last Verification    |
|----|--------------|--------------------------|----------------------|
| 1  | ABC Corp     | 549300IEX0E9QXUWVF29     | ✓ Verified           |
|    |              |                          | 2024-01-17 10:30     |
| 2  | XYZ Ltd      | N/A                      | ⚠ Pending            |
| 3  | Old Merchant | 789000GID4SUQW9V6Q46     | ✓ Validated (Legacy) |
```

### Merchant Detail View

The merchant information modal displays:

- LEI code in the Business Information section
- Shows "N/A" if merchant doesn't have an LEI
- Full verification history visible to administrators

---

## API Endpoints

### 1. Participant Lookup (Supports LEI & Numeric Aliases)

**Purpose:** Find merchant routing information by alias

**Endpoint:** `GET /participants/MERCHANT_PAYINTOID/{id}`

**Parameters:**

- `id` - Can be either an LEI code or numeric merchant alias

**Use Cases:**

- Payment routing: "Which DFSP handles payments for LEI 549300IEX0E9QXUWVF29?"
- Merchant discovery: "Does this LEI exist in our system?"

**Example Request:**

```
GET /participants/MERCHANT_PAYINTOID/549300IEX0E9QXUWVF29
```

**Example Response:**

```json
{
  "partyList": [
    {
      "fspId": "dfsp001",
      "currency": "USD",
      "lei": "549300IEX0E9QXUWVF29",
      "alias_value": "549300IEX0E9QXUWVF29"
    }
  ]
}
```

**Error Response (Not Found):**

```json
{
  "partyList": []
}
```

### 2. Party Lookup (LEI-Specific)

**Purpose:** LEI-focused lookup for party information

**Endpoint:** `GET /parties/ALIAS/{lei}`

**Parameters:**

- `lei` - The Legal Entity Identifier

**Use Case:** Specifically for LEI-based party resolution in payment flows

**Example Request:**

```
GET /parties/ALIAS/549300IEX0E9QXUWVF29
```

**Response:** Same format as participant lookup

### 3. Create Merchant with LEI

**Purpose:** Register a new merchant with optional LEI

**Endpoint:** `POST /merchants`

**Request Body Fields:**

- `dba_trading_name` (required) - Business name
- `lei` (optional) - 20-character LEI code
- `employees_num` (required) - Employee count range
- `currency_code` (required) - Primary currency
- `category_code` (required) - Merchant category
- `merchant_type` (required) - Business type
- Other optional fields (registered name, turnover, etc.)

**Success Response (201):**

```json
{
  "message": "Drafting Merchant Successful",
  "data": {
    "id": 123,
    "dba_trading_name": "ABC Corporation",
    "lei": "549300IEX0E9QXUWVF29",
    "gleif_verified_at": "2024-01-17T10:30:00.000Z",
    "registration_status": "Draft"
  }
}
```

**Validation Error (422):**

```json
{
  "message": "LEI validation failed: Provided entity name 'ABC Corp' does not match registered legal name 'ABC Corporation' from GLEIF",
  "field": "lei"
}
```

---

## Data Flow & Business Logic

### Complete Merchant Registration Journey

#### Phase 1: Initial Registration

```
1. User fills out Business Information form
   ↓
2. User enters LEI (optional): 529900AXZOJO15EBGR24
   ↓
3. Form submitted to backend
   ↓
4. Backend validates LEI format (20 chars, alphanumeric)
   ↓
5. GLEIF API called to verify LEI exists
   ↓
6. Entity name checked: "Bamburi Cement Public Limited Company" matches ✓
   ↓
7. Merchant saved with LEI and gleif_verified_at timestamp
   ↓
8. User sees success message
```

#### Phase 2: Location Addition

```
1. User adds location information
   ↓
2. System checks: Does this merchant have an LEI? YES
   ↓
3. GLEIF API called to fetch registered address
   ↓
4. Each address field compared:
   - Street Name - 6th Floor Kenya-Re Towers, Upper Hill, Off Ragati Road P.O Box
   - Postal Code - 10921
   - Country- Kenya
   - Township - Nairobi
   ↓
5. All fields match → Location saved
   ↓
6. gleif_verified_at timestamp updated
```

#### Phase 3: Registry Oracle Registration

```
1. Admin approves merchant
   ↓
2. Merchant status changes to "Approved"
   ↓
3. Background job triggers registry registration
   ↓
4. System checks: Does merchant have LEI? YES
   ↓
5. Registry record created:
   - alias_value = "529900AXZOJO15EBGR24" (the LEI)
   - alias_type = "LEI"
   - lei = "529900AXZOJO15EBGR24" (stored separately)
   - fspId = assigned DFSP
   - currency = merchant's currency
   ↓
6. Merchant now discoverable by LEI globally
```

### Payment Routing with LEI

```
1. Payer initiates payment to LEI: 529900AXZOJO15EBGR24
   ↓
2. Payment system queries: GET /parries/ALIAS/529900AXZOJO15EBGR24
   ↓
3. Database query uses optimized index (idx_registry_lei_lookup)
   ↓
4. Registry returns:
   - fspId: "dfsp001" (which DFSP to route to)
   - currency: "KES" (supported currency)
   - lei: "529900AXZOJO15EBGR24" (confirmation)
   ↓
5. Payment routed to correct DFSP
   ↓
6. DFSP processes payment to merchant
```

---

## Configuration & Setup

### Environment Variables

**Backend Service (acquirer-backend):**

```bash
# GLEIF API Configuration
GLEIF_API_URL=https://api.gleif.org/api/v1
```

**Start the docker container and interact through the frontend ui at http://localhost:5173:**

```bash
docker compose up --build
```
