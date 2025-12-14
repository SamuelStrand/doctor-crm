# Doctor CRM — Backend API documentation (for Frontend)

Base URL (local):
- `http://127.0.0.1:8000/api`

Swagger / OpenAPI:
- `http://127.0.0.1:8000/api/docs/` (если подключено)
- `http://127.0.0.1:8000/api/schema/` (если подключено)

## Roles
We keep only 2 roles:
- **ADMIN**
- **DOCTOR**

Authorization rule:
- `/api/admin/**` → only **ADMIN**
- `/api/doctor/**` → only **DOCTOR**
- Object-level protection:
  - Doctor sees only **his** appointments, visit notes, attachments, patients (linked via his appointments).

---

## Authentication (JWT)

### 1) Login
`POST /auth/login/`

Body:
```json
{ "email": "admin@clinic.local", "password": "Admin123!" }
```

Response:
```json
{ "access": "JWT_ACCESS", "refresh": "JWT_REFRESH" }
```

### 2) Refresh access token
`POST /auth/refresh/`

Body:
```json
{ "refresh": "JWT_REFRESH" }
```

Response:
```json
{ "access": "NEW_JWT_ACCESS" }
```

### 3) Logout (blacklist refresh)
`POST /auth/logout/`

Headers:
- `Authorization: Bearer <access>`

Body:
```json
{ "refresh": "JWT_REFRESH" }
```

Response:
- `204 No Content`

---

## Common rules

### Authorization header
All protected endpoints:
- `Authorization: Bearer <access_token>`

### DateTime format
ISO 8601 with timezone (recommended):
- `"2025-12-15T10:00:00Z"`

### Pagination
Most list endpoints use DRF pagination and return:
```json
{
  "count": 123,
  "next": "...",
  "previous": null,
  "results": [ ... ]
}
```
If pagination is disabled for some endpoint, response may be a plain list `[...]`.

### Filtering / ordering / search
- `?ordering=-start_at`
- `?search=john`
- Appointments filter (admin/doctor):
  - `?date_from=...`
  - `?date_to=...`
  - `?status=SCHEDULED`
  - `?patient=<id>`
  - `?doctor=<id>` (admin only; doctor scope is fixed by current user)

### Typical error response
```json
{ "detail": "You do not have permission to perform this action." }
```
or field errors:
```json
{ "start_at": ["This field is required."] }
```

---

# Public / Common endpoints

## Get current user profile
`GET /me/`

Headers:
- `Authorization: Bearer <access>`

Response (пример):
```json
{
  "id": 1,
  "email": "doctor1@clinic.local",
  "role": "DOCTOR",
  "first_name": "John",
  "last_name": "Doctor"
}
```

---

# Admin API (`/api/admin/*`) — ADMIN only

## Doctors
Base: `/admin/doctors/`

- `GET /admin/doctors/` — list
- `POST /admin/doctors/` — create
- `GET /admin/doctors/{id}/` — retrieve
- `PATCH /admin/doctors/{id}/` — update
- `DELETE /admin/doctors/{id}/` — delete

Create doctor (пример):
```json
{
  "email": "newdoctor@clinic.local",
  "password": "Doctor123!",
  "first_name": "New",
  "last_name": "Doctor",
  "is_active": true,
  "doctor_profile": {
    "full_name": "New Doctor",
    "specialization": "Therapist",
    "phone": "+77000000000",
    "room": "101"
  }
}
```

## Patients
Base: `/admin/patients/`

- `GET /admin/patients/`
- `POST /admin/patients/`
- `GET /admin/patients/{id}/`
- `PATCH /admin/patients/{id}/`
- `DELETE /admin/patients/{id}/`

Create patient (пример):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": "",
  "birth_date": null,
  "gender": "U",
  "phone": "+77000000001",
  "email": "john.doe@mail.local",
  "address": "",
  "comment": ""
}
```

Gender values:
- `M` (male), `F` (female), `U` (unknown)

## Services
Base: `/admin/services/`

- `GET /admin/services/`
- `POST /admin/services/`
- `GET /admin/services/{id}/`
- `PATCH /admin/services/{id}/`
- `DELETE /admin/services/{id}/`

Create service (пример):
```json
{
  "code": "CONSULT",
  "name_en": "Consultation",
  "name_ru": "Консультация",
  "name_kk": "Кеңес беру",
  "description_en": "",
  "description_ru": "",
  "description_kk": "",
  "duration_minutes": 30,
  "price": "10000.00",
  "is_active": true
}
```

## Rooms
Base: `/admin/rooms/`

- `GET /admin/rooms/`
- `POST /admin/rooms/`
- `GET /admin/rooms/{id}/`
- `PATCH /admin/rooms/{id}/`
- `DELETE /admin/rooms/{id}/`

Create room (пример):
```json
{ "name": "101", "floor": 1, "comment": "" }
```

## Appointments
Base: `/admin/appointments/`

- `GET /admin/appointments/` (supports filters + ordering)
- `POST /admin/appointments/`
- `GET /admin/appointments/{id}/`
- `PATCH /admin/appointments/{id}/`
- `DELETE /admin/appointments/{id}/`

Create appointment (пример):
```json
{
  "patient": 10,
  "doctor": 5,
  "service": 3,
  "room": 2,
  "start_at": "2025-12-15T10:00:00Z",
  "end_at": "2025-12-15T10:30:00Z",
  "status": "SCHEDULED",
  "reason": "Demo appointment",
  "comment": ""
}
```

Status values (recommendation):
- `SCHEDULED`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`

Server validations:
- no overlap for doctor in that time range
- appointment must match doctor schedule and not be inside doctor time-off

## Reports (appointments statistics)
`GET /admin/reports/appointments/`

Query params:
- `date_from`, `date_to`, `doctor`, `status`

Response example:
```json
{
  "filters": { "date_from": null, "date_to": null, "doctor": null, "status": "SCHEDULED" },
  "total": 7,
  "by_status": [ { "status": "SCHEDULED", "total": 7 } ],
  "by_doctor": [ { "doctor_id": 5, "doctor__email": "doctor1@clinic.local", "total": 7 } ]
}
```

## Audit logs
Base: `/admin/audit-logs/`

- `GET /admin/audit-logs/` — list
- `GET /admin/audit-logs/{id}/` — retrieve

Each log has:
- `actor`, `action` (CREATE/UPDATE/DELETE/READ)
- `object_type`, `object_id`
- `ip`, `user_agent`
- `meta`

---

# Doctor API (`/api/doctor/*`) — DOCTOR only

## My appointments
Base: `/doctor/appointments/`

- `GET /doctor/appointments/`
- `GET /doctor/appointments/{id}/`

### Set status (doctor)
`POST /doctor/appointments/{id}/set_status/`

Body:
```json
{ "status": "CONFIRMED" }
```

## Visit notes
Base: `/doctor/visit-notes/`

- `GET /doctor/visit-notes/`
- `POST /doctor/visit-notes/`
- `GET /doctor/visit-notes/{id}/`
- `PATCH /doctor/visit-notes/{id}/`
- `DELETE /doctor/visit-notes/{id}/`

Create visit note:
```json
{
  "appointment": 100,
  "note_text": "Patient is stable. Follow-up in 2 weeks."
}
```

Important:
- Doctor can create a note only for **his** appointment (`appointment.doctor == request.user`).

## Attachments (files for visit notes)
For a given note:
- `GET /doctor/visit-notes/{id}/attachments/` — list files
- `POST /doctor/visit-notes/{id}/attachments/` — upload file
  - `multipart/form-data`
  - field: `file`
- `DELETE /doctor/visit-notes/{id}/attachments/{attachment_id}/` — delete file

Attachment response includes `file_url` for download:
```json
{
  "id": 1,
  "visit_note": 55,
  "file": "attachments/2025/12/scan.pdf",
  "file_url": "http://127.0.0.1:8000/media/attachments/2025/12/scan.pdf",
  "uploaded_by": 5,
  "uploaded_at": "2025-12-14T12:00:00Z"
}
```

## Schedule
Base: `/doctor/schedule/`

- `GET /doctor/schedule/`
- `POST /doctor/schedule/`
- `PATCH /doctor/schedule/{id}/`
- `DELETE /doctor/schedule/{id}/`

Create schedule item:
```json
{
  "weekday": 0,
  "start_time": "09:00:00",
  "end_time": "13:00:00",
  "slot_minutes": 30
}
```

weekday:
- `0` Monday … `6` Sunday

## Time off
Base: `/doctor/time-off/`

- `GET /doctor/time-off/`
- `POST /doctor/time-off/`
- `PATCH /doctor/time-off/{id}/`
- `DELETE /doctor/time-off/{id}/`

Create time off:
```json
{
  "start_at": "2025-12-16T09:00:00Z",
  "end_at": "2025-12-16T12:00:00Z",
  "reason": "Personal"
}
```

## My patients
Base: `/doctor/patients/`

- `GET /doctor/patients/` — only patients linked to doctor via appointments
- `GET /doctor/patients/{id}/`
- `GET /doctor/patients/{id}/history/` — appointments + notes of this doctor for that patient

Response of `/history/`:
```json
{
  "patient": { "id": 10, "full_name": "Doe John", "phone": "...", "email": "..." },
  "appointments": [ ... ],
  "visit_notes": [ ... ]
}
```

---

# Search

`GET /search/?q=<text>&limit=10`

Returns:
- `patients[]` (doctor scope applies)
- `services[]`
- `appointments[]` (doctor scope applies)

---

# AI helper endpoints (simple draft/summary)

## AI note draft
`POST /ai/note-draft/` (DOCTOR only)

Body:
```json
{
  "bullets": ["Headache", "Fatigue"],
  "free_text": "Symptoms started 3 days ago.",
  "language": "en"
}
```

Response:
```json
{ "draft": "Visit note draft

Complaints:
- Headache
..." }
```

## AI patient summary
`POST /ai/patient-summary/` (DOCTOR only)

Body:
```json
{ "patient_id": 10, "limit": 5, "language": "en" }
```

Rules:
- doctor must have at least one appointment with this patient

Response:
```json
{
  "title": "Summary for Doe John",
  "items": [
    { "date": "2025-12-10", "appointment_id": 100, "snippet": "..." }
  ]
}
```

---

## Quick demo flow (frontend smoke test)

1) **Admin login** → tokens  
2) Create: **room**, **service**, **doctor**, **patient**  
3) Create **appointment**  
4) **Doctor login** → tokens  
5) Doctor: list my appointments → open appointment  
6) Create **visit note**  
7) Upload **attachment**  
8) Open patient **history**  
9) Admin: open **audit logs** / **reports**
