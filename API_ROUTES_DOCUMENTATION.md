# Savannah Trail API Routes Documentation

Base URL: `/api/v1.0`

---

## 🔐 Authentication Routes

**Base Path:** `/api/v1.0/auth`

### 1. POST `/auth/login`

**Description:** Authenticate user and get access token

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Login successful",
    "response": {
        "user": {
            "_id": "user_id",
            "name": "User Name",
            "email": "user@example.com",
            "role": "admin"
        },
        "token": "jwt_access_token",
        "expires_at": "2024-01-01T00:00:00.000Z"
    }
}
```

**Notes:** Sets httpOnly cookie `st_refresh` for refresh token

---

### 2. POST `/auth/refresh`

**Description:** Refresh access token using refresh token

**Request Body (optional):**

```json
{
    "refresh_token": "refresh_token_string"
}
```

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Token refreshed successfully",
    "response": {
        "user": {
            /* user object */
        },
        "token": "new_jwt_access_token",
        "expires_at": "2024-01-01T00:00:00.000Z"
    }
}
```

**Notes:** Uses cookie or body.refresh_token

---

### 3. POST `/auth/logout`

**Description:** Logout user and invalidate refresh token

**Request Body (optional):**

```json
{
    "refresh_token": "refresh_token_string"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Logout successful",
    "code": 200,
    "response": null
}
```

---

### 4. POST `/auth/create-user`

**Description:** Create new user account

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "admin",
    "permissions": ["read", "write"]
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "User created successfully",
    "code": 201,
    "response": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin"
    }
}
```

---

## 📅 Booking Routes

**Base Path:** `/api/v1.0/bookings`

### 1. GET `/bookings/`

**Description:** Get all bookings with optional filters (no pagination)

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `guest_name` (string) - Filter by guest name (case-insensitive)
- `guest_email` (string) - Filter by guest email (case-insensitive)
- `package_id` (string) - Filter by package ID
- `payment_status` (string) - Filter by payment status
- `booking_status` (string) - Filter by booking status
- `tour_date` (date) - Filter by tour date

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Bookings retrieved successfully",
    "responses": {
        "docs": [
            {
                "_id": "booking_id",
                "package_id": "package_id",
                "guest_name": "Jane Doe",
                "guest_phone": "+1234567890",
                "guest_email": "jane@example.com",
                "tour_date": "2024-01-15T00:00:00.000Z",
                "num_guests": 4,
                "total_amount": 500,
                "payment_status": "pending",
                "booking_status": "confirmed",
                "assigned_guide_id": "guide_id",
                "addons": [{ "name": "Lunch", "price": 20 }]
            }
        ],
        "total": 50,
        "limit": 10,
        "page": 1,
        "pages": 5
    }
}
```

---

### 2. POST `/bookings/create`

**Description:** Create new booking and initialize payment

**Request Body:**

```json
{
    "package_id": "package_id",
    "guest_name": "Jane Doe",
    "guest_phone": "+1234567890",
    "guest_email": "jane@example.com",
    "tour_date": "2024-01-15T00:00:00.000Z",
    "num_guests": 4,
    "addons": [{ "name": "Lunch", "price": 20 }],
    "redirect_url": "https://example.com/success"
}
```

**Response (201):**

```json
{
    "success": true,
    "code": 201,
    "message": "Booking created successfully",
    "responses": {
        "booking": {
            "_id": "booking_id",
            "package_id": "package_id",
            "guest_name": "Jane Doe",
            "total_amount": 500,
            "invoice_id": "invoice_id"
        },
        "invoice": {
            "_id": "invoice_id",
            "booking_id": "booking_id",
            "amount": 500,
            "currency": "GHS",
            "status": "pending",
            "paystack_authorization_url": "https://checkout.paystack.com/..."
        }
    }
}
```

---

### 3. GET `/bookings/:id`

**Description:** Get booking by ID

**URL Parameters:**

- `id` (string) - Booking ID

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Booking retrieved successfully",
    "responses": {
        "_id": "booking_id",
        "package_id": "package_id",
        "guest_name": "Jane Doe"
    }
}
```

---

### 4. PUT `/bookings/update/:id`

**Description:** Update booking details

**URL Parameters:**

- `id` (string) - Booking ID

**Request Body:**

```json
{
    "guest_name": "Jane Smith",
    "guest_phone": "+1234567890",
    "guest_email": "jane.smith@example.com",
    "tour_date": "2024-01-20T00:00:00.000Z",
    "num_guests": 5,
    "payment_status": "success",
    "booking_status": "confirmed",
    "assigned_guide_id": "guide_id",
    "addons": [{ "name": "Lunch", "price": 20 }]
}
```

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Booking updated successfully"
}
```

---

### 5. DELETE `/bookings/delete/:id`

**Description:** Delete booking

**URL Parameters:**

- `id` (string) - Booking ID

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Booking deleted successfully",
    "responses": null
}
```

---

### 6. POST `/bookings/:id/reassign-guide`

**Description:** Reassign guide to booking

**URL Parameters:**

- `id` (string) - Booking ID

**Request Body:**

```json
{
    "guide_id": "new_guide_id"
}
```

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Guide reassigned successfully",
    "responses": {
        "_id": "booking_id",
        "assigned_guide_id": "new_guide_id"
    }
}
```

---

## 👨‍🏫 Guide Routes

**Base Path:** `/api/v1.0/guides`

### 1. GET `/guides/`

**Description:** Get paginated guides with filters

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter by status (active/inactive)
- `name` (string) - Filter by name (case-insensitive)

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Guides retrieved successfully",
    "responses": {
        "docs": [
            {
                "_id": "guide_id",
                "name": "John Guide",
                "email": "john@example.com",
                "phone": "+1234567890",
                "bio": "Experienced tour guide",
                "photo_url": "https://s3.amazonaws.com/...",
                "languages": ["English", "French"],
                "specialties": ["Wildlife", "History"],
                "status": "active",
                "availability": [
                    {
                        "date": "2024-01-15T00:00:00.000Z",
                        "available": true,
                        "blocked_reason": null
                    }
                ]
            }
        ],
        "total": 20,
        "limit": 10,
        "page": 1,
        "pages": 2
    }
}
```

---

### 2. GET `/guides/get-guide/:id`

**Description:** Get guide by ID

**URL Parameters:**

- `id` (string) - Guide ID

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Guide retrieved successfully",
    "response": {
        "_id": "guide_id",
        "name": "John Guide",
        "email": "john@example.com"
    }
}
```

---

### 3. POST `/guides/`

**Description:** Create new guide

**Content-Type:** `multipart/form-data`

**Form Data:**

- `name` (string, required)
- `email` (string, required)
- `phone` (string, required)
- `bio` (string, required)
- `photo_url` (string, optional)
- `languages` (array of strings, optional)
- `specialties` (array of strings, optional)
- `status` (string, optional: active/inactive, default: inactive)
- `availability` (array, optional)
- `image` (file, optional) - Profile image

**Response (201):**

```json
{
    "success": true,
    "code": 201,
    "message": "Guide created successfully",
    "response": {
        "_id": "guide_id",
        "name": "John Guide",
        "email": "john@example.com"
    }
}
```

---

### 4. GET `/guides/available`

**Description:** Get available guides for specific date range

**Query Parameters:**

- `start_date` (date, ISO format)
- `end_date` (date, ISO format)
- `date` (date, ISO format) - Alternative to start_date/end_date
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, default: active)

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Available guides retrieved successfully",
    "responses": {
        "docs": [
            {
                "_id": "guide_id",
                "name": "John Guide",
                "status": "active"
            }
        ],
        "total": 5,
        "limit": 20,
        "page": 1,
        "pages": 1
    }
}
```

---

## 📦 Package Routes

**Base Path:** `/api/v1.0/packages`

### 1. GET `/packages/`

**Description:** Get all packages (no pagination)

**Query Parameters:**

- `status` (string) - Filter by status (active/inactive/draft)

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Packages retrieved successfully",
    "responses": {
        "docs": [
            {
                "_id": "package_id",
                "title": "Safari Adventure",
                "slug": "safari-adventure",
                "description": "Amazing safari experience",
                "base_price": 200,
                "guest_limit": 10,
                "extra_guest_fee": 50,
                "duration_hours": 8,
                "images": ["https://s3.amazonaws.com/..."],
                "addons": [{ "name": "Lunch", "price": 20 }],
                "available_dates": ["2024-01-15T00:00:00.000Z"],
                "status": "active"
            }
        ]
    }
}
```

---

### 2. GET `/packages/paginate`

**Description:** Get paginated packages

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter by status

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Packages retrieved successfully",
    "responses": {
        "docs": [
            /* package objects */
        ],
        "total": 30,
        "limit": 10,
        "page": 1,
        "pages": 3
    }
}
```

---

### 3. GET `/packages/:id`

**Description:** Get package by ID

**URL Parameters:**

- `id` (string) - Package ID

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Package retrieved successfully",
    "responses": {
        "_id": "package_id",
        "title": "Safari Adventure"
    }
}
```

---

### 4. POST `/packages/create`

**Description:** Create new package

**Request Body:**

```json
{
    "title": "Safari Adventure",
    "slug": "safari-adventure",
    "description": "Amazing safari experience",
    "base_price": 200,
    "guest_limit": 10,
    "extra_guest_fee": 50,
    "duration_hours": 8,
    "images": ["https://s3.amazonaws.com/image1.jpg"],
    "addons": [
        { "name": "Lunch", "price": 20 },
        { "name": "Photography", "price": 30 }
    ],
    "available_dates": ["2024-01-15T00:00:00.000Z"],
    "status": "draft"
}
```

**Response (201):**

```json
{
    "success": true,
    "code": 201,
    "message": "Package created successfully",
    "responses": {
        "_id": "package_id",
        "title": "Safari Adventure"
    }
}
```

---

### 5. PUT `/packages/:id`

**Description:** Update package

**URL Parameters:**

- `id` (string) - Package ID

**Request Body:** (all fields optional)

```json
{
    "title": "Updated Safari Adventure",
    "base_price": 250,
    "status": "active"
}
```

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Package updated successfully",
    "responses": {
        "_id": "package_id",
        "title": "Updated Safari Adventure"
    }
}
```

---

### 6. DELETE `/packages/:id`

**Description:** Soft delete package (sets status to inactive)

**URL Parameters:**

- `id` (string) - Package ID

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Package deleted successfully",
    "responses": {
        "_id": "package_id",
        "status": "inactive"
    }
}
```

---

## 📊 Dashboard Routes

**Base Path:** `/api/v1.0/dashboard`

### 1. GET `/dashboard/kpis`

**Description:** Get dashboard KPIs for date range

**Query Parameters:**

- `date_from` (date, ISO format, required)
- `date_to` (date, ISO format, required)

**Example:** `/dashboard/kpis?date_from=2024-01-01&date_to=2024-01-31`

**Response (200):**

```json
{
    "total_bookings": 150,
    "total_revenue": 75000,
    "pending_bookings": 20,
    "confirmed_bookings": 100,
    "cancelled_bookings": 30,
    "average_booking_value": 500
}
```

---

## 🔧 Extension Routes

**Base Path:** `/api/v1.0/extensions`

### 1. POST `/extensions/file/upload`

**Description:** Upload single file to S3

**Content-Type:** `multipart/form-data`

**Form Data:**

- `file` (file, required) - File to upload
- `file_name` (string, required) - Desired filename
- `folder` (string, optional) - S3 folder path

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Files uploaded successfully",
    "responses": {
        "url": "https://s3.amazonaws.com/bucket/folder/filename.jpg",
        "key": "folder/filename.jpg"
    }
}
```

---

### 2. POST `/extensions/file/upload-multiple`

**Description:** Upload multiple files to S3

**Content-Type:** `multipart/form-data`

**Form Data:**

- `files` (files, required) - Multiple files to upload
- `file_name` (string, optional) - Base filename
- `folder` (string, optional) - S3 folder path

**Response (200):**

```json
{
    "success": true,
    "code": 200,
    "message": "Files uploaded successfully",
    "responses": [
        {
            "url": "https://s3.amazonaws.com/bucket/folder/file1.jpg",
            "key": "folder/file1.jpg"
        },
        {
            "url": "https://s3.amazonaws.com/bucket/folder/file2.jpg",
            "key": "folder/file2.jpg"
        }
    ]
}
```

---

### 3. POST `/extensions/callback/check-paystack-payment`

**Description:** Paystack payment webhook callback

**Query Parameters:**

- `reference` (string, required) - Paystack payment reference

**Response (200):**

- Redirects to booking redirect_url if successful
- Returns "Payment Successful" text if no redirect_url

---

## 📝 Notes

### Common Response Format

All successful responses follow this structure:

```json
{
    "success": true,
    "code": 200,
    "message": "Operation successful",
    "response": {
        /* data */
    }
}
```

### Error Response Format

```json
{
    "success": false,
    "message": "Error message",
    "details": {
        /* error details in development */
    }
}
```

### Pagination

Paginated endpoints return:

- `docs`: Array of results
- `total`: Total number of documents
- `limit`: Items per page
- `page`: Current page number
- `pages`: Total number of pages

### Authentication

- Login returns JWT access token (15 min expiry)
- Refresh token stored in httpOnly cookie `st_refresh` (90 days)
- Use Authorization header: `Bearer <access_token>`

### Payment Flow

1. Create booking → Returns invoice with Paystack authorization URL
2. User completes payment on Paystack
3. Paystack redirects to callback endpoint
4. System verifies payment and updates invoice status
5. User redirected to booking redirect_url
