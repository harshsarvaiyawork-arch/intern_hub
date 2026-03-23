# 🗄️ InternHub — Database Schema Reference

## Overview

This project uses **PostgreSQL** as the primary database, accessed via **Hasura GraphQL Engine**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE: intern_management               │
│                        USER: chatbot / chatbot123                │
│                        PORT: 5432                                │
└─────────────────────────────────────────────────────────────────┘
```

## Table Relationships

```
departments
    │
    ├──< users (department_id)
    │
    └──< interns (department_id)
              │
              ├──< emergency_contacts (intern_id)
              ├──< intern_documents   (intern_id)
              ├──< performance_reviews (intern_id)
              └──< attendance          (intern_id)

users ──< interns.mentor_id
users ──< interns.created_by
users ──< interns.user_id
```

---

## Table 1 — `departments`

Stores the 8 fixed departments in the company.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | TEXT | NOT NULL, UNIQUE | Full department name |
| `code` | TEXT | NOT NULL, UNIQUE | Short code e.g. `AI`, `PHP` |
| `description` | TEXT | | What this department does |
| `head_name` | TEXT | | Department head's name |
| `head_email` | TEXT | | Department head's email |
| `location` | TEXT | | Office floor/room |
| `max_interns` | INT | DEFAULT 20 | Max intern capacity |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether dept is active |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last updated time |

### Seeded Data

| code | name |
|------|------|
| `.NET` | .NET Development |
| `SAP` | SAP Consulting |
| `AI` | Artificial Intelligence |
| `MOBILE` | Mobile Development |
| `ODOO` | Odoo/ERP |
| `RPA` | Robotic Process Automation |
| `PHP` | PHP Development |
| `QC` | Quality Control |

---

## Table 2 — `users`

Stores all login accounts (admin, department persons, interns).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | TEXT | NOT NULL | Full name |
| `email` | CITEXT | NOT NULL, UNIQUE | Email (case-insensitive) |
| `password_hash` | TEXT | NOT NULL | bcrypt hashed password |
| `role` | TEXT | NOT NULL, CHECK | `admin` / `department_person` / `intern` |
| `phone` | TEXT | | Phone number |
| `profile_photo` | TEXT | | URL to profile photo |
| `designation` | TEXT | | Job title / position |
| `department_id` | UUID | FK → departments.id | Department assignment |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `last_login` | TIMESTAMPTZ | | Last login timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last updated time |

### Default Admin User

| Field | Value |
|-------|-------|
| Email | `admin@company.com` |
| Password | `admin123` |
| Role | `admin` |

---

## Table 3 — `interns` ⭐ (Main Table)

Full intern profile — personal, academic, and internship details.

### 🧍 Personal Details

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `name` | TEXT NOT NULL | Full name |
| `email` | CITEXT UNIQUE | Personal email |
| `phone` | TEXT NOT NULL | Primary phone |
| `alternate_phone` | TEXT | Secondary phone |
| `date_of_birth` | DATE | Date of birth |
| `gender` | TEXT | `male` / `female` / `other` / `prefer_not_to_say` |
| `blood_group` | TEXT | A+, A-, B+, B-, AB+, AB-, O+, O- |
| `nationality` | TEXT | Default: `Indian` |
| `profile_photo` | TEXT | URL/path to photo |

### 🏠 Address

| Column | Type | Description |
|--------|------|-------------|
| `address_line1` | TEXT | Street address |
| `address_line2` | TEXT | Apt/Suite/Area |
| `city` | TEXT | City |
| `state` | TEXT | State |
| `pincode` | TEXT | Postal code |
| `country` | TEXT | Default: `India` |

### 🎓 Academic / College Details

| Column | Type | Description |
|--------|------|-------------|
| `college` | TEXT NOT NULL | College name |
| `university` | TEXT | Affiliated university |
| `degree` | TEXT NOT NULL | B.Tech / MCA / BCA / MBA etc. |
| `branch` | TEXT NOT NULL | CSE / IT / ECE / Mech etc. |
| `specialization` | TEXT | AI/ML, Data Science etc. |
| `graduation_year` | INT | Expected graduation year |
| `current_year` | INT | 1st / 2nd / 3rd / 4th year |
| `cgpa` | NUMERIC(4,2) | e.g. `8.75` |
| `percentage` | NUMERIC(5,2) | e.g. `87.50` % |
| `student_id` | TEXT | College roll number |
| `college_email` | TEXT | Official college email |
| `college_city` | TEXT | College city |
| `college_state` | TEXT | College state |

### 💼 Internship Details

| Column | Type | Description |
|--------|------|-------------|
| `department_id` | UUID NOT NULL FK | Assigned department |
| `start_date` | DATE NOT NULL | Internship start |
| `end_date` | DATE | Internship end |
| `duration_months` | INT | Duration in months |
| `status` | TEXT | `applied` / `selected` / `active` / `completed` / `terminated` / `on_leave` |
| `work_mode` | TEXT | `onsite` / `remote` / `hybrid` |
| `stipend` | NUMERIC(10,2) | Monthly stipend (₹) |
| `offer_letter_date` | DATE | Offer letter issue date |
| `joining_letter_date` | DATE | Joining letter date |
| `mentor_id` | UUID FK → users.id | Assigned mentor |

### 💡 Skills & Tech

| Column | Type | Description |
|--------|------|-------------|
| `skills` | TEXT[] | e.g. `['Python','React','SQL']` |
| `languages_known` | TEXT[] | e.g. `['English','Hindi']` |
| `tools` | TEXT[] | e.g. `['Git','Docker','Figma']` |

### 🔗 Social Links

| Column | Type | Description |
|--------|------|-------------|
| `linkedin_url` | TEXT | LinkedIn profile |
| `github_url` | TEXT | GitHub profile |
| `portfolio_url` | TEXT | Personal portfolio |

### 🪪 Identity & Reference

| Column | Type | Description |
|--------|------|-------------|
| `aadhar_number` | TEXT | Masked Aadhar (XXXX-XXXX-1234) |
| `pan_number` | TEXT | PAN card number |
| `reference_name` | TEXT | Reference person name |
| `reference_contact` | TEXT | Reference phone/email |

### ⚙️ System Fields

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID FK → users.id | Linked login account |
| `created_by` | UUID FK → users.id | Who added this intern |
| `notes` | TEXT | Admin notes |
| `created_at` | TIMESTAMPTZ | Creation time |
| `updated_at` | TIMESTAMPTZ | Last updated time |

---

## Table 4 — `emergency_contacts`

One or more emergency contacts per intern.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `intern_id` | UUID NOT NULL FK | Parent intern |
| `name` | TEXT NOT NULL | Contact's full name |
| `relationship` | TEXT NOT NULL | Father / Mother / Spouse / Sibling etc. |
| `phone` | TEXT NOT NULL | Primary phone |
| `alternate_phone` | TEXT | Secondary phone |
| `email` | TEXT | Contact's email |
| `address` | TEXT | Contact's address |
| `created_at` | TIMESTAMPTZ | Creation time |

> **ON DELETE CASCADE** — automatically deleted when the intern is deleted.

---

## Table 5 — `intern_documents`

Tracks all uploaded documents for each intern.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `intern_id` | UUID NOT NULL FK | Parent intern |
| `document_type` | TEXT NOT NULL | See allowed values below |
| `document_name` | TEXT NOT NULL | Original filename |
| `file_url` | TEXT NOT NULL | Storage URL/path |
| `file_size` | INT | Size in KB |
| `uploaded_by` | UUID FK → users.id | Who uploaded |
| `verified` | BOOLEAN | DEFAULT FALSE — admin verification |
| `created_at` | TIMESTAMPTZ | Upload time |

**Allowed `document_type` values:**
`offer_letter`, `joining_letter`, `nda`, `id_proof`, `address_proof`,
`college_id`, `noc_letter`, `completion_certificate`, `marksheet`, `resume`, `other`

---

## Table 6 — `performance_reviews`

Monthly performance reviews for each intern.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `intern_id` | UUID NOT NULL FK | Reviewed intern |
| `reviewer_id` | UUID NOT NULL FK | Reviewer (dept person or admin) |
| `review_month` | DATE NOT NULL | First day of the review month |
| `rating` | INT (1–5) | Overall rating |
| `punctuality` | INT (1–5) | Punctuality score |
| `technical_skill` | INT (1–5) | Technical skill score |
| `communication` | INT (1–5) | Communication score |
| `teamwork` | INT (1–5) | Teamwork score |
| `comments` | TEXT | Reviewer comments |
| `goals_next_month` | TEXT | Goals set for next month |
| `created_at` | TIMESTAMPTZ | Review creation time |

---

## Table 7 — `attendance`

Daily attendance tracking per intern.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unique identifier |
| `intern_id` | UUID NOT NULL FK | Intern |
| `date` | DATE NOT NULL | Attendance date |
| `status` | TEXT NOT NULL | See allowed values below |
| `check_in` | TIME | Check-in time |
| `check_out` | TIME | Check-out time |
| `remarks` | TEXT | Any notes |
| `marked_by` | UUID FK → users.id | Who marked attendance |
| `created_at` | TIMESTAMPTZ | Record creation time |

**Allowed `status` values:**
`present`, `absent`, `half_day`, `on_leave`, `holiday`, `work_from_home`

> **UNIQUE constraint** on `(intern_id, date)` — only one record per intern per day.

---

## Indexes

| Index | Table | Column(s) | Purpose |
|-------|-------|-----------|---------|
| `idx_interns_department` | interns | department_id | Fast dept filter |
| `idx_interns_status` | interns | status | Fast status filter |
| `idx_interns_mentor` | interns | mentor_id | Fast mentor lookup |
| `idx_interns_email` | interns | email | Fast email lookup |
| `idx_attendance_intern` | attendance | intern_id, date | Fast attendance query |
| `idx_reviews_intern` | performance_reviews | intern_id | Fast review query |

---

## Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";    -- For case-insensitive emails
```

---

## Full SQL Script Location

The complete `CREATE TABLE` SQL script is in the project root:
```
d:\AI-ML\internhub\recreate_schema.sql
```
