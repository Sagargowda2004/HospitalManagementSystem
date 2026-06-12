# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start Backend Server

**In Terminal/PowerShell:**
```bash
cd c:\Users\Sagar\Downloads\VSCODE\Sprin-Boot-Web-Module\HospitalManagementSystem

mvnw spring-boot:run
```

Wait for this message:
```
Started HospitalManagementSystemApplication in X.XXX seconds
```

✅ Backend is now running on **http://localhost:8080**

---

### Step 2: Start Frontend Server

**Open NEW Terminal/PowerShell:**
```bash
cd c:\Users\Sagar\Downloads\VSCODE\Sprin-Boot-Web-Module\HospitalManagementSystem\frontend

python -m http.server 8000
```

You should see:
```
Serving HTTP on 0.0.0.0 port 8000
```

✅ Frontend is now running on **http://localhost:8000**

---

### Step 3: Open in Browser

Click this link or paste in your browser:
```
http://localhost:8000/
```

---

### Step 4: Login

Choose one of the test accounts:

#### Admin Account
- **Email**: admin@hospital.com
- **Password**: admin123
- **Access**: Full system access

#### Doctor Account
- **Email**: doctor@hospital.com
- **Password**: doctor123
- **Access**: Manage appointments, prescriptions, medical records

#### Patient Account
- **Email**: patient@hospital.com
- **Password**: patient123
- **Access**: Book appointments, view records, check bills

#### Receptionist Account
- **Email**: receptionist@hospital.com
- **Password**: receptionist123
- **Access**: Manage appointments and payments

---

## ✨ What You Can Do

### As Admin
- 📊 View system dashboard with statistics
- 🏥 Manage hospital departments
- 📅 Manage all appointments
- 📋 View medical records
- 💊 Manage prescriptions
- 💵 Track bills and payments
- 📢 Send notifications

### As Doctor
- 📅 View today's appointments
- 👥 See patient list
- 📋 Create medical records
- 💊 Write prescriptions
- 🔍 View patient history

### As Patient
- 📅 Book new appointments
- 📋 View medical records
- 💊 View prescriptions
- 💵 View bills and make payments
- 📢 Receive notifications

### As Receptionist
- 📅 Manage appointments
- 👥 Manage patient records
- 💵 Process payments
- 📊 View pending payments

---

## 🔧 Troubleshooting

### Backend won't start?
```
❌ "Connection to localhost:3306 refused"

✅ Solution:
1. Make sure MySQL is running
2. Run: mysql --version
3. Create database: mysql -u root -p
   CREATE DATABASE hospital_management_system;
```

### Frontend shows blank page?
```
❌ "CSS/JS files not loading"

✅ Solution:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check console for errors (F12)
3. Verify files are in frontend folder
```

### Can't login?
```
❌ "Invalid credentials"

✅ Solution:
1. Check email and password exactly
2. Use provided test accounts above
3. Check browser console for errors
4. Make sure backend is running
```

### CORS Error?
```
❌ "CORS error in console"

✅ Solution:
1. Verify backend is running
2. API_BASE_URL should be http://localhost:8080
3. Backend CORS is already configured
```

---

## 📂 File Locations

| Component | Path |
|-----------|------|
| Backend | `HospitalManagementSystem/` |
| Frontend | `HospitalManagementSystem/frontend/` |
| Database | MySQL (hospital_management_system) |
| API | http://localhost:8080 |
| Website | http://localhost:8000 |

---

## 🎯 Testing Path

### Step 1: Login as Admin
- View dashboard statistics
- Create a department
- Create an appointment
- Create a medical record

### Step 2: Login as Doctor
- View your appointments
- Check patient list
- Create a prescription

### Step 3: Login as Patient
- View medical records
- Check prescriptions
- View bills
- Create appointment

### Step 4: Login as Receptionist
- Manage appointments
- View patient payments
- Process a payment

---

## 📱 Supported Browsers

- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Apple Safari
- ✅ Microsoft Edge
- ✅ Opera

---

## 🔐 Security Notes

- Passwords are encrypted with BCrypt
- Tokens expire automatically
- Invalid tokens are blacklisted
- All data is validated on server
- HTTPS ready for production

---

## 📚 Full Documentation

For detailed documentation, see:

1. **Backend Setup** → `SETUP_GUIDE.md`
2. **Frontend Features** → `frontend/FRONTEND_FEATURES.md`
3. **Frontend README** → `frontend/README.md`
4. **API Endpoints** → See `API_TESTING_GUIDE.md`

---

## 🚨 Keep Both Running

Remember:
- 🔴 **Terminal 1**: Backend (`mvnw spring-boot:run`)
- 🔴 **Terminal 2**: Frontend (`python -m http.server 8000`)
- 🟢 **Browser**: http://localhost:8000/

---

## 🎉 You're All Set!

Your Hospital Management System is ready to use. Start with the login page and explore all features!

### Quick Links
- **Frontend**: http://localhost:8000/
- **Backend API**: http://localhost:8080/
- **Database**: hospital_management_system

---

## 💡 Pro Tips

1. **Use Browser Dev Tools** (F12)
   - Check Network tab for API calls
   - View Console for errors
   - Debug JavaScript in Sources tab

2. **Test Different Roles**
   - Each role has different access
   - Try all 4 accounts to see differences

3. **Check Features**
   - Each page has different features
   - Use all CRUD operations (Create, Read, Update, Delete)

4. **Make API Calls**
   - Use browser console to test APIs
   - Example: `APIHelper.getDepartments()`

---

Need more help? Check the **SETUP_GUIDE.md** for detailed instructions!
