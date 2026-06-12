# Hospital Management System - Feature Documentation

## 🎉 Project Overview
This document provides a complete guide to the enhanced Hospital Management System with JWT authentication, role-based access control, and comprehensive healthcare management features.

---

## 1. 🔐 Enhanced JWT Authentication System

### New Features:
- **Access & Refresh Tokens**: Dual-token system with separate expiration times
- **Token Blacklist**: Logout functionality with token revocation
- **Role-Based Access Control (RBAC)**: Improved security with role-specific permissions
- **Token Type Validation**: Separate validation for access and refresh tokens

### Configuration (application.properties):
```properties
jwt.secret=your-secret-key
jwt.expiration-ms=3600000          # Access token: 1 hour
jwt.refresh-expiration-ms=604800000 # Refresh token: 7 days
```

### New Endpoints:

#### 1. **User Authentication**
- `POST /auth/signup` - Register new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "PATIENT"
  }
  ```

- `POST /auth/login` - Login with email and password
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
  **Response:**
  ```json
  {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "role": "PATIENT",
    "email": "john@example.com"
  }
  ```

#### 2. **Token Management**
- `POST /auth/refresh` - Refresh access token
  ```json
  {
    "refreshToken": "eyJhbGc..."
  }
  ```

- `POST /auth/logout` - Logout and blacklist token
  - **Required**: Bearer token in Authorization header
  - **Response**: Success message

- `GET /auth/me` - Get user profile (Authenticated)
  - **Required**: Bearer token in Authorization header

### Database Tables:
- `refresh_tokens` - Stores active refresh tokens
- `token_blacklist` - Stores revoked access tokens

---

## 2. 🏥 Department Management

### Endpoints:
- `POST /api/departments` - Create department [ADMIN]
- `GET /api/departments` - Get all departments
- `GET /api/departments/active/list` - Get active departments
- `GET /api/departments/{id}` - Get department by ID
- `PUT /api/departments/{id}` - Update department [ADMIN]
- `DELETE /api/departments/{id}` - Soft delete department [ADMIN]

### Request Body (Create/Update):
```json
{
  "name": "Cardiology",
  "description": "Heart and cardiovascular diseases",
  "phoneNumber": "+1-234-567-8900",
  "headName": "Dr. Smith",
  "isActive": true
}
```

---

## 3. 📅 Appointment Management

### Endpoints:
- `POST /api/appointments` - Create appointment [PATIENT, DOCTOR, ADMIN]
- `GET /api/appointments` - Get all appointments [ADMIN]
- `GET /api/appointments/{id}` - Get appointment by ID [PATIENT, DOCTOR, ADMIN]
- `GET /api/appointments/patient/{patientId}` - Get patient appointments
- `GET /api/appointments/doctor/{doctorId}` - Get doctor appointments [DOCTOR, ADMIN]
- `GET /api/appointments/status/{status}` - Get appointments by status [ADMIN]
- `PUT /api/appointments/{id}` - Update appointment [DOCTOR, ADMIN]
- `DELETE /api/appointments/{id}` - Delete appointment [DOCTOR, ADMIN]

### Request Body:
```json
{
  "patientId": 1,
  "doctorId": 2,
  "departmentId": 3,
  "appointmentDate": "2024-06-15T10:30:00",
  "reason": "Regular checkup",
  "notes": "Patient has prior headaches"
}
```

### Appointment Status:
- SCHEDULED
- COMPLETED
- CANCELLED
- RESCHEDULED

---

## 4. 📋 Medical Records Management

### Endpoints:
- `POST /api/medical-records` - Create medical record [DOCTOR]
- `GET /api/medical-records` - Get all records [ADMIN]
- `GET /api/medical-records/{id}` - Get record by ID [DOCTOR, PATIENT, ADMIN]
- `GET /api/medical-records/patient/{patientId}` - Get patient records
- `GET /api/medical-records/doctor/{doctorId}` - Get doctor's records [DOCTOR, ADMIN]
- `PUT /api/medical-records/{id}` - Update record [DOCTOR]
- `DELETE /api/medical-records/{id}` - Delete record [DOCTOR]

### Request Body:
```json
{
  "patientId": 1,
  "doctorId": 2,
  "appointmentId": 1,
  "diagnosis": "Hypertension",
  "treatment": "Prescribed Lisinopril 10mg daily",
  "notes": "Monitor blood pressure regularly",
  "bloodPressure": "140/90",
  "temperature": "98.6°F",
  "heartRate": "72 bpm",
  "weight": "75 kg",
  "height": "180 cm"
}
```

---

## 5. 💊 Prescription Management

### Endpoints:
- `POST /api/prescriptions` - Create prescription [DOCTOR]
- `GET /api/prescriptions` - Get all prescriptions [ADMIN]
- `GET /api/prescriptions/{id}` - Get prescription [DOCTOR, PATIENT, ADMIN]
- `GET /api/prescriptions/patient/{patientId}` - Get patient prescriptions
- `GET /api/prescriptions/doctor/{doctorId}` - Get doctor's prescriptions [DOCTOR, ADMIN]
- `GET /api/prescriptions/status/{status}` - Get by status [DOCTOR, ADMIN]
- `PUT /api/prescriptions/{id}` - Update prescription [DOCTOR]
- `DELETE /api/prescriptions/{id}` - Delete prescription [DOCTOR]

### Request Body:
```json
{
  "patientId": 1,
  "doctorId": 2,
  "medicalRecordId": 1,
  "medicineName": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "duration": "30 days",
  "instructions": "Take with water after breakfast"
}
```

### Prescription Status:
- ACTIVE
- COMPLETED
- CANCELLED

---

## 6. 💳 Billing & Payment System

### A. Bill Management

**Endpoints:**
- `POST /api/bills` - Create bill [ADMIN]
- `GET /api/bills` - Get all bills [ADMIN]
- `GET /api/bills/{id}` - Get bill [ADMIN, PATIENT]
- `GET /api/bills/patient/{patientId}` - Get patient bills [ADMIN, PATIENT]
- `GET /api/bills/status/{status}` - Get bills by status [ADMIN]
- `PATCH /api/bills/{id}/status/{status}` - Update bill status [ADMIN]
- `PUT /api/bills/{id}` - Update bill [ADMIN]
- `DELETE /api/bills/{id}` - Delete bill [ADMIN]

**Request Body:**
```json
{
  "patientId": 1,
  "consultationCharges": 500,
  "medicineCharges": 1500,
  "testCharges": 2000,
  "otherCharges": 300,
  "notes": "Includes lab tests and medicines"
}
```

**Bill Status:**
- PENDING
- PARTIAL (partially paid)
- PAID (fully paid)
- CANCELLED

### B. Payment Management

**Endpoints:**
- `POST /api/payments` - Record payment [ADMIN, PATIENT]
- `GET /api/payments` - Get all payments [ADMIN]
- `GET /api/payments/{id}` - Get payment [ADMIN, PATIENT]
- `GET /api/payments/bill/{billId}` - Get bill payments [ADMIN, PATIENT]
- `GET /api/payments/status/{status}` - Get payments by status [ADMIN]
- `DELETE /api/payments/{id}` - Delete payment [ADMIN]

**Request Body:**
```json
{
  "billId": 1,
  "amount": 1000,
  "paymentMethod": "CARD",
  "transactionId": "TXN-123456",
  "remarks": "Payment made via credit card"
}
```

**Payment Methods:**
- CASH
- CARD
- BANK_TRANSFER
- CHEQUE
- UPI

---

## 7. 📧 Notification System (Email & SMS)

### Endpoints:
- `POST /api/notifications` - Send notification [ADMIN, DOCTOR]
- `GET /api/notifications` - Get all [ADMIN]
- `GET /api/notifications/{id}` - Get notification [ADMIN, DOCTOR, PATIENT]
- `GET /api/notifications/user/{userId}` - Get user notifications
- `GET /api/notifications/status/{status}` - Get by status [ADMIN]
- `GET /api/notifications/type/{type}` - Get by type [ADMIN]
- `DELETE /api/notifications/{id}` - Delete notification [ADMIN]

### Request Body:
```json
{
  "userId": 1,
  "type": "EMAIL",
  "subject": "Appointment Reminder",
  "message": "Your appointment is tomorrow at 10:30 AM",
  "recipientEmail": "patient@example.com",
  "recipientPhone": "+1-234-567-8900"
}
```

### Notification Types:
- **EMAIL** - Sent via email service
- **SMS** - SMS notification (requires SMS gateway integration)
- **IN_APP** - In-application notification

### Notification Status:
- PENDING
- SENT
- FAILED

---

## 8. 🔒 Role-Based Access Control

### Available Roles:
1. **ADMIN** - Full system access
2. **DOCTOR** - Medical records, prescriptions, appointments
3. **PATIENT** - Own records, appointments, bills
4. **RECEPTIONIST** - Appointment management, patient info

### Permission Matrix:

| Feature | ADMIN | DOCTOR | PATIENT | RECEPTIONIST |
|---------|-------|--------|---------|--------------|
| Departments | CRUD | R | - | R |
| Appointments | CRUD | CRUD | CRU | CRU |
| Medical Records | R | CRUD | R | - |
| Prescriptions | R | CRUD | R | - |
| Bills | CRUD | - | R | - |
| Payments | CRUD | - | CRU | - |
| Notifications | CRUD | CRU | R | - |
| User Profiles | R | R | R | - |

---

## 9. 📦 Database Schema

### New Tables:
```sql
-- Authentication
- refresh_tokens
- token_blacklist

-- Core
- departments
- appointments
- medical_records
- prescriptions

-- Billing
- bills
- payments

-- Communication
- notifications
```

---

## 10. 🚀 API Headers & Authentication

### All Authenticated Endpoints Require:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Example Request:
```bash
curl -X GET http://localhost:8080/api/appointments/patient/1 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

## 11. 📝 Configuration

### Email Setup (optional)
Add to `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

---

## 12. 🧪 Testing the Features

### Sample Login Request:
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "password123"
}
```

### Sample Create Appointment:
```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 2,
  "departmentId": 1,
  "appointmentDate": "2024-07-20T10:30:00",
  "reason": "Routine checkup",
  "notes": "Patient has history of high blood pressure"
}
```

---

## 13. 🔄 Workflow Example

### Patient Visit Flow:
1. **Login** → Get access token
2. **Create/View Appointment** → Book or check appointments
3. **Medical Record** → Doctor creates record during visit
4. **Prescription** → Doctor prescribes medicines
5. **Bill** → Admin creates bill
6. **Payment** → Patient makes payment
7. **Notification** → Patient gets appointment/status notifications

---

## 14. 📊 Technology Stack

- **Framework**: Spring Boot 3.5.6
- **Java Version**: 17+
- **Database**: MySQL
- **Security**: Spring Security + JWT
- **API**: RESTful with role-based access
- **Mail**: Spring Mail (optional)
- **ORM**: JPA/Hibernate

---

## 15. 🎯 Next Steps (Optional Enhancements)

- [ ] Integrate Twilio for SMS functionality
- [ ] Add prescription PDF generation
- [ ] Implement appointment reminders via cron jobs
- [ ] Add payment gateway integration (Stripe, Razorpay)
- [ ] Create frontend with React/Angular
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement audit logging
- [ ] Add video consultation feature

---

**Created**: June 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
