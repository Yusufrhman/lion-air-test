# Lion FMS — API Contract (v1)

Base URL: `http://localhost:8000/api/v1`

All requests and responses use JSON, except file upload (`multipart/form-data`) and file download (binary stream).

---

## 1. Authentication

- **Mechanism**: Laravel Sanctum bearer token (opaque token, does not expire).
- After login, store `accessToken` and send it on every protected request:

  ```
  Authorization: Bearer <accessToken>
  ```

- **Roles**: `administrator` (full access) and `viewer` (read-only).
  Endpoints marked **[admin]** require the `administrator` role.

### Standard error responses

| Status | Body |
|---|---|
| 401 Unauthenticated | `{ "message": "Unauthenticated." }` |
| 403 Forbidden (non-admin on [admin] route) | `{ "message": "Forbidden" }` |
| 404 Not found (any missing resource) | `{ "message": "Resource not found." }` |
| 422 Validation error | `{ "message": "...", "errors": { "<field>": ["error msg", ...] } }` |

`errors` is an object keyed by field name; each value is an array of messages. Use `Object.entries(errors)[0][1][0]` to show the first error.

---

## 2. Shared data shapes

### User

```json
{ "id": 1, "email": "admin@example.com", "role": "administrator" }
```

### FolderNode (recursive, used by folder tree)

```json
{
  "id": 1,
  "name": "HR",
  "parentId": null,
  "children": [ /* FolderNode[] */ ],
  "files": [ { "id": 10, "name": "policy.pdf" } ]
}
```

### FileDTO (used by all `/files` responses)

```json
{
  "id": 10,
  "fileName": "original-upload.pdf",
  "title": "Company Policy",
  "department": { "id": 1, "name": "Finance" },
  "folder": { "id": 2, "name": "Documents" },
  "uploadedBy": { "id": 1, "email": "admin@example.com" },
  "uploadedAt": "2026-09-16T12:00:00.000000Z"
}
```

### Department

```json
{
  "id": 1,
  "name": "Finance",
  "createdAt": "2026-09-16T12:00:00.000000Z",
  "updatedAt": "2026-09-16T12:00:00.000000Z"
}
```

---

## 3. Endpoints

### Auth

#### `POST /login` — public

Request:

```json
{ "email": "admin@example.com", "password": "password" }
```

Response **200**:

```json
{
  "data": {
    "accessToken": "1|xxxxxxxxxxxx",
    "user": { "id": 1, "email": "admin@example.com", "role": "administrator" }
  }
}
```

Errors: `401` `{ "message": "Invalid credentials" }`, `422` validation.

#### `POST /logout` — auth

Deletes the current token. Response **200**: `{ "message": "Logged out successfully" }`

#### `GET /me` — auth

Response **200**: `{ "data": { "id": 1, "email": "...", "role": "..." } }`

---

### Folders

#### `GET /folders` — auth

Returns the full folder tree (root folders only, children nested recursively).

Response **200**: `{ "data": [ FolderNode, ... ] }`

#### `POST /folders` — [admin]

Request:

```json
{ "name": "New Folder", "parentId": 1 }
```

- `name` — required string
- `parentId` — nullable int, must reference an existing folder. Omit/`null` for a root folder.

Response **201**:

```json
{ "message": "Folder created successfully.", "data": { "id": 5, "name": "New Folder", "parentId": 1 } }
```

#### `GET /folders/{id}` — auth

Response **200**:

```json
{
  "data": {
    "id": 2,
    "name": "Documents",
    "parent": { "id": 1, "name": "HR" },
    "children": [ { "id": 5, "name": "Sub", "parentId": 2 } ],
    "files": [ { "id": 10, "name": "policy.pdf" } ]
  }
}
```

`parent` is `null` for root folders.

#### `PATCH /folders/{id}` — [admin]

Request (both fields optional):

```json
{ "name": "Renamed", "parentId": 3 }
```

Business-rule errors (**422**, field `parentId`):
- `"A folder cannot be its own parent."`
- `"The selected parent would create a circular folder hierarchy."`

Response **200**: `{ "message": "Folder updated successfully.", "data": { "id": 2, "name": "Renamed", "parentId": 3 } }`

#### `DELETE /folders/{id}` — [admin]

Only **empty** folders can be deleted.

Response **200**: `{ "message": "Folder deleted successfully." }`

Errors **409 Conflict**:
- `{ "message": "Folder cannot be deleted because it contains child folders." }`
- `{ "message": "Folder cannot be deleted because it contains files." }`

---

### Departments

#### `GET /departments` — auth

Response **200**: `{ "data": [ Department, ... ] }` (ordered by name asc)

#### `POST /departments` — [admin]

Request: `{ "name": "Finance" }` — required, must be unique.

Response **201**: `{ "message": "Department created successfully.", "data": Department }`

#### `PATCH /departments/{id}` — [admin]

Request: `{ "name": "Finance & Ops" }` — required if present, unique (ignoring self).

Response **200**: `{ "message": "Department updated successfully.", "data": Department }`

#### `DELETE /departments/{id}` — [admin]

Response **200**: `{ "message": "Department deleted successfully." }`

Error **409**: `{ "message": "Department cannot be deleted because it is currently used by files." }`

---

### Files

#### `GET /files` — auth

Query params (all optional):

| Param | Type | Default | Notes |
|---|---|---|---|
| `perPage` | int | 10 | clamped 1–100 |
| `search` | string | — | matches `fileName` or `title` |
| `departmentId` | int | — | filter by department |

Response **200**:

```json
{
  "data": [ FileDTO ],
  "meta": { "currentPage": 1, "perPage": 10, "total": 42 }
}
```

> `meta` only contains `currentPage`, `perPage`, `total`. Compute total pages client-side: `Math.ceil(total / perPage)`.

#### `POST /files` — [admin] — multipart/form-data

Fields:

| Field | Type | Rules |
|---|---|---|
| `title` | string | required, max 255 |
| `departmentId` | int | required, must exist |
| `folderId` | int | required, must exist |
| `file` | file | required, max **10 MB**, types: `pdf, doc, docx, xls, xlsx, png, jpg, jpeg` |

Response **201**: `{ "message": "File uploaded successfully.", "data": FileDTO }`

#### `GET /files/{id}` — auth

Response **200**: `{ "data": FileDTO }`

#### `PATCH /files/{id}` — [admin] — JSON

Updates metadata only — the physical file **cannot** be replaced via this endpoint.

Request (all optional):

```json
{ "title": "New Title", "departmentId": 2, "folderId": 7 }
```

Response **200**: `{ "message": "File updated successfully.", "data": FileDTO }`

#### `DELETE /files/{id}` — [admin]

Response **200**: `{ "message": "File deleted successfully." }`

#### `GET /files/{id}/download` — auth

Returns a binary file stream with `Content-Disposition: attachment; filename=<fileName>`.

For frontend: fetch with the auth header and convert to blob — do **not** use a plain `<a href>` link (token required).

Error **404**: `{ "message": "Physical file not found." }`

---

### Dashboard

#### `GET /dashboard` — [admin]

Response **200**:

```json
{
  "data": {
    "latestFiles": [ FileDTO ],
    "totalFolders": 12,
    "totalFiles": 42,
    "totalDepartments": 5
  }
}
```

---

## 4. Frontend quick notes

1. All request payloads and responses are **camelCase** (`parentId`, `departmentId`, `folderId`, `perPage`, `createdAt`).
2. All protected routes need `Authorization: Bearer <token>`; a missing/invalid token returns 401 → redirect to login.
3. Deletion conflicts (non-empty folder, department in use) return **409**, not 422 — check for both.
4. Delete flows can show the `message` from the 409 body directly to the user.
5. Seeded accounts for local dev: `admin@example.com` / `viewer@example.com`, password `password`.
