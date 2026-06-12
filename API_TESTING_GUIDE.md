# Hospital Management System - API Testing Guide

## Quick Start Guide

### 1. Authentication Flow

#### Step 1: Sign Up (Create User)
```bash
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "PATIENT"
}

Response: "Signup successful"
```

#### Step 2: Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "role": "PATIENT",
  "email": "john@example.com"
}
```

#### Step 3: Use Access Token for Requests
```bash
GET /auth/me
Authorization: Bearer {accessToken}

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "PATIENT"
}
```

#### Step 4: Refresh Token (When Access Token Expires)
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "{refreshToken}"
}

Response:
{
  "accessToken": "new_token...",
  "refreshToken": "{refreshToken}",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "role": "PATIENT",
  "email": "john@example.com"
}
```

#### Step 5: Logout
```bash
POST /auth/logout
Authorization: Bearer {accessToken}

Response:
{
  "message": "Logout successful"
}
```

---

## 2. Department Management (ADMIN Only)

### Create Department
```bash
POST /api/departments
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "name": "Cardiology",
  "description": "Heart and cardiovascular diseases",
  "phoneNumber": "+1-800-123-4567",
  "headName": "Dr. Sarah Johnson",
  "isActive": true
}
```

### Get All Departments
```bash
GET /api/departments
```

### Get Active Departments
```bash
GET /api/departments/active/list
```

### Update Department
```bash
PUT /api/departments/1
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "name": "Cardiology Department",
  "description": "Updated description",
  "headName": "Dr. Jane Smith"
}
```

---

## 3. Appointments

### Create Appointment (PATIENT/DOCTOR/ADMIN)
```bash
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 2,
  "departmentId": 1,
  "appointmentDate": "2024-07-20T10:30:00",
  "reason": "Regular checkup",
  "notes": "Patient mentioned chest pain in previous visit"
}
```

### Get My Appointments (PATIENT)
```bash
GET /api/appointments/patient/1
Authorization: Bearer {patientToken}
```

### Get Doctor's Appointments (DOCTOR)
```bash
GET /api/appointments/doctor/2
Authorization: Bearer {doctorToken}
```

### Update Appointment Status (DOCTOR/ADMIN)
```bash
PUT /api/appointments/1
Authorization: Bearer {doctorToken}
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "Appointment completed successfully"
}
```

### Get Appointments by Status (ADMIN)
```bash
GET /api/appointments/status/SCHEDULED
Authorization: Bearer {adminToken}
```

---

## 4. Medical Records

### Create Medical Record (DOCTOR Only)
```bash
POST /api/medical-records
Authorization: Bearer {doctorToken}
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 2,
  "appointmentId": 1,
  "diagnosis": "Hypertension Stage 2",
  "treatment": "Prescribed Metoprolol 25mg twice daily",
  "notes": "Patient to follow up in 2 weeks",
  "bloodPressure": "150/95",
  "temperature": "98.6°F",
  "heartRate": "78 bpm",
  "weight": "75 kg",
  "height": "180 cm"
}
```

### Get Patient Medical Records
```bash
GET /api/medical-records/patient/1
Authorization: Bearer {token}
```

### Update Medical Record (DOCTOR)
```bash
PUT /api/medical-records/1
Authorization: Bearer {doctorToken}
Content-Type: application/json

{
  "diagnosis": "Updated diagnosis",
  "treatment": "Updated treatment",
  "notes": "Follow-up after 1 week"
}
```

---

## 5. Prescriptions

### Create Prescription (DOCTOR Only)
```bash
POST /api/prescriptions
Authorization: Bearer {doctorToken}
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 2,
  "medicalRecordId": 1,
  "medicineName": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "duration": "30 days",
  "instructions": "Take with water after breakfast. Do not skip doses."
}
```

### Get Patient Prescriptions
```bash
GET /api/prescriptions/patient/1
Authorization: Bearer {patientToken}
```

### Get Active Prescriptions
```bash
GET /api/prescriptions/status/ACTIVE
Authorization: Bearer {doctorToken}
```

### Update Prescription Status
```bash
PUT /api/prescriptions/1
Authorization: Bearer {doctorToken}
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

---

## 6. Billing & Payments

### Create Bill (ADMIN Only)
```bash
POST /api/bills
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "patientId": 1,
  "consultationCharges": 500,
  "medicineCharges": 1500,
  "testCharges": 2000,
  "otherCharges": 300,
  "notes": "Lab tests, medicines, and consultation included"
}

Response:
{
  "id": 1,
  "billNumber": "BILL-1624567890123",
  "totalAmount": 4300,
  "paidAmount": 0,
  "balanceAmount": 4300,
  "status": "PENDING"
}
```

### Get Patient Bills
```bash
GET /api/bills/patient/1
Authorization: Bearer {token}
```

### Get Bills by Status
```bash
GET /api/bills/status/PENDING
Authorization: Bearer {adminToken}
```

### Record Payment
```bash
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "billId": 1,
  "amount": 2000,
  "paymentMethod": "CARD",
  "transactionId": "TXN-ABC123XYZ",
  "remarks": "Payment via credit card"
}

Response:
{
  "id": 1,
  "billId": 1,
  "amount": 2000,
  "paymentMethod": "CARD",
  "status": "COMPLETED",
  "paymentDate": "2024-06-15T10:30:00"
}
```

### Update Bill Status
```bash
PATCH /api/bills/1/status/PARTIAL
Authorization: Bearer {adminToken}
```

---

## 7. Notifications

### Send Email Notification (ADMIN/DOCTOR)
```bash
POST /api/notifications
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "userId": 1,
  "type": "EMAIL",
  "subject": "Appointment Reminder",
  "message": "Your appointment with Dr. Smith is scheduled for tomorrow at 10:30 AM. Please arrive 15 minutes early.",
  "recipientEmail": "patient@example.com"
}
```

### Send SMS Notification (requires SMS gateway)
```bash
POST /api/notifications
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "userId": 1,
  "type": "SMS",
  "subject": "Appointment Reminder",
  "message": "Your appointment is tomorrow at 10:30 AM",
  "recipientPhone": "+1-234-567-8900"
}
```

### Get User Notifications
```bash
GET /api/notifications/user/1
Authorization: Bearer {token}
```

### Get Notifications by Status
```bash
GET /api/notifications/status/SENT
Authorization: Bearer {adminToken}
```

---

## 8. Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## 9. Error Response Format

```json
{
  "error": "Description of what went wrong"
}
```

Example:
```bash
POST /api/appointments
Response 401:
{
  "error": "Unauthorized"
}

POST /api/appointments
Response 403:
{
  "error": "Access Denied"
}
```

---

## 10. Using Postman

### Setup:
1. Create a new Postman collection
2. Add Authorization tab for each request
3. Set Type to "Bearer Token"
4. Use the `accessToken` from login response

### Environment Variables (Optional):
```
baseUrl: http://localhost:8080
accessToken: {{token_from_login}}
refreshToken: {{refresh_token_from_login}}
```

---

## 11. cURL Examples

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password@123"}'
```

### Get Profile
```bash
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Appointment
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 2,
    "departmentId": 1,
    "appointmentDate": "2024-07-20T10:30:00",
    "reason": "Checkup"
  }'
```

---

## 12. User Roles for Testing

Create test users with these credentials:

**Admin User:**
- Email: `admin@hospital.com`
- Password: `Admin@123`
- Role: `ADMIN`

**Doctor User:**
- Email: `doctor@hospital.com`
- Password: `Doctor@123`
- Role: `DOCTOR`

**Patient User:**
- Email: `patient@hospital.com`
- Password: `Patient@123`
- Role: `PATIENT`

**Receptionist User:**
- Email: `receptionist@hospital.com`
- Password: `Receptionist@123`
- Role: `RECEPTIONIST`

---

**Last Updated**: June 2024
**API Version**: 1.0.0
