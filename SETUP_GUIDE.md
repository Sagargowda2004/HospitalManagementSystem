# Hospital Management System - Complete Setup Guide

## 📋 Prerequisites

### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum
- **Storage**: 500MB free space

### Software Requirements
- **Java**: JDK 17 or higher
- **Maven**: 3.9.0 or higher
- **MySQL**: 8.0 or higher
- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Code Editor**: VS Code or any text editor

### Installation

#### 1. Java JDK 17
```bash
# Verify Java installation
java -version

# Should output: java version "17.x.x"
```

#### 2. Maven
```bash
# Verify Maven installation
mvn -version

# Should output: Apache Maven 3.9.x
```

#### 3. MySQL
```bash
# Verify MySQL installation
mysql --version

# Should output: mysql  Ver 8.x
```

## 🗄️ Database Setup

### 1. Create Database
```sql
-- Start MySQL
mysql -u root -p

-- Create database
CREATE DATABASE hospital_management_system;

-- Use the database
USE hospital_management_system;

-- Tables will be auto-created by JPA Hibernate
```

### 2. Configure Database Connection
Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_management_system
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

## 🏗️ Backend Setup & Run

### 1. Navigate to Project Directory
```bash
cd c:\Users\Sagar\Downloads\VSCODE\Sprin-Boot-Web-Module\HospitalManagementSystem
```

### 2. Build the Project
```bash
# Using Maven Wrapper (Recommended)
mvnw clean install

# Or using system Maven
mvn clean install
```

### 3. Run the Backend Server
```bash
# Using Maven
mvnw spring-boot:run

# Or using command line
java -jar target/HospitalManagementSystem-0.0.1-SNAPSHOT.jar
```

### 4. Verify Backend is Running
Open browser and navigate to:
```
http://localhost:8080/
```

You should see a 404 page (expected, as there's no root endpoint).

Check the console output:
```
Started HospitalManagementSystemApplication in X.XXX seconds
```

## 🎨 Frontend Setup & Run

### Option 1: Using Python HTTP Server (Recommended)

#### Step 1: Navigate to Frontend Directory
```bash
cd c:\Users\Sagar\Downloads\VSCODE\Sprin-Boot-Web-Module\HospitalManagementSystem\frontend
```

#### Step 2: Start HTTP Server
```bash
# Python 3
python -m http.server 8000

# Output: Serving HTTP on 0.0.0.0 port 8000
```

#### Step 3: Access Frontend
Open browser and navigate to:
```
http://localhost:8000/
```

### Option 2: Using Node.js HTTP Server

#### Step 1: Install http-server globally
```bash
npm install -g http-server
```

#### Step 2: Navigate to Frontend Directory
```bash
cd c:\Users\Sagar\Downloads\VSCODE\Sprin-Boot-Web-Module\HospitalManagementSystem\frontend
```

#### Step 3: Start Server
```bash
http-server
```

#### Step 4: Access Frontend
Open browser and navigate to:
```
http://localhost:8080/
```

### Option 3: Using VS Code Live Server

#### Step 1: Install Live Server Extension
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search for "Live Server"
- Install by Ritwick Dey

#### Step 2: Open Frontend Folder
```bash
code c:\Users\Sagar\Downloads\VSCODE\Sprin-Boot-Web-Module\HospitalManagementSystem\frontend
```

#### Step 3: Start Live Server
- Right-click on `index.html`
- Select "Open with Live Server"
- Browser will automatically open at `http://localhost:5500/`

### Option 4: Direct File Opening
```bash
# Simply open index.html in your browser
# File path: c:\Users\Sagar\Downloads\VSCODE\Sprin-Boot-Web-Module\HospitalManagementSystem\frontend\index.html

# Note: AJAX calls may not work due to CORS restrictions
```

## 🔐 Testing Credentials

### Admin Account
```
Email: admin@hospital.com
Password: admin123
Role: ADMIN
```

### Doctor Account
```
Email: doctor@hospital.com
Password: doctor123
Role: DOCTOR
```

### Patient Account
```
Email: patient@hospital.com
Password: patient123
Role: PATIENT
```

### Receptionist Account
```
Email: receptionist@hospital.com
Password: receptionist123
Role: RECEPTIONIST
```

### Create New Account
1. Go to signup page
2. Enter name, email, password, and select role
3. Click "Sign Up"
4. Login with new credentials

## 📡 API Testing

### Using Browser Console
```javascript
// Test API connection
fetch('http://localhost:8080/auth/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
})
.then(r => r.json())
.then(d => console.log(d));
```

### Using Postman
1. Download and install Postman
2. Create new request
3. Method: POST
4. URL: `http://localhost:8080/auth/login`
5. Body (JSON):
```json
{
    "email": "admin@hospital.com",
    "password": "admin123"
}
```
6. Send request and check response

### Using curl
```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
  }'

# Get user info (replace TOKEN with actual access token)
curl -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🚀 Complete Application Flow

### 1. Start Backend
```bash
cd HospitalManagementSystem
mvnw spring-boot:run
# Wait for: Started HospitalManagementSystemApplication
```

### 2. Start Frontend (in new terminal)
```bash
cd frontend
python -m http.server 8000
# Shows: Serving HTTP on 0.0.0.0 port 8000
```

### 3. Open Browser
```
http://localhost:8000/
```

### 4. Login
- Enter credentials (see Testing Credentials above)
- You'll be redirected to dashboard based on role

## ✅ System Verification Checklist

### Backend
- [ ] Java JDK 17+ installed
- [ ] Maven 3.9+ installed
- [ ] MySQL running and hospital database created
- [ ] Backend server running on port 8080
- [ ] API endpoints responding (check console)

### Frontend
- [ ] Frontend files in correct directory structure
- [ ] HTTP server running on port 8000 or 8080
- [ ] Browser can access index.html
- [ ] CSS and JavaScript files loading

### Database
- [ ] MySQL service running
- [ ] Database `hospital_management_system` created
- [ ] Connection configured in application.properties

### Network
- [ ] Both backend and frontend ports are not blocked
- [ ] CORS is configured correctly
- [ ] No firewall blocking connections

## 🐛 Troubleshooting

### Backend Issues

#### "Connection to localhost:3306 refused"
```
Solution:
1. Verify MySQL is running: mysql --version
2. Check username and password in application.properties
3. Ensure database is created: mysql -u root -p
   CREATE DATABASE hospital_management_system;
4. Verify port 3306 is not blocked
```

#### "Cannot run program 'mvn'"
```
Solution:
1. Verify Maven is installed: mvn -version
2. Add Maven to PATH
3. Use Maven wrapper instead: mvnw
```

#### "Port 8080 already in use"
```
Solution:
1. Find process using port 8080:
   netstat -ano | findstr :8080
2. Kill the process:
   taskkill /PID <PID> /F
3. Or use different port in application.properties:
   server.port=8081
```

### Frontend Issues

#### "CORS error in browser console"
```
Solution:
1. Ensure backend is running
2. Check API_BASE_URL in js/api.js is correct
3. Verify CORS is enabled in SecurityConfig
4. Try accessing API directly in browser
```

#### "CSS not loading / Styling looks broken"
```
Solution:
1. Check css/style.css exists in frontend folder
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check browser console for CSS file 404 errors
4. Verify relative paths are correct
```

#### "Cannot connect to API"
```
Solution:
1. Verify backend server is running
2. Check API_BASE_URL in js/api.js
3. Check browser console for errors
4. Test with curl/Postman
5. Verify firewall isn't blocking
```

#### "Form submissions not working"
```
Solution:
1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Check form validation
4. Test API with Postman
```

### Database Issues

#### "MySQL authentication error"
```
Solution:
1. Verify credentials:
   mysql -u root -p
2. Enter correct password
3. Check application.properties has correct credentials
```

#### "Table doesn't exist"
```
Solution:
1. Check database was created:
   SHOW DATABASES;
   USE hospital_management_system;
   SHOW TABLES;
2. Verify spring.jpa.hibernate.ddl-auto=update
3. Restart backend to recreate tables
```

## 📚 File Structure

```
HospitalManagementSystem/
├── backend/
│   ├── src/
│   │   ├── main/java/com/hms/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── dto/
│   │   │   ├── config/
│   │   │   ├── security/
│   │   │   └── HospitalManagementSystemApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── application-prod.properties
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── api.js
│   ├── pages/
│   │   ├── admin-dashboard.html
│   │   ├── doctor-dashboard.html
│   │   ├── patient-dashboard.html
│   │   ├── receptionist-dashboard.html
│   │   └── ... other pages
│   ├── README.md
│   └── FRONTEND_FEATURES.md
└── Documentation/
    ├── API_TESTING_GUIDE.md
    ├── FEATURES.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── SETUP_GUIDE.md (this file)
```

## 🎯 Next Steps

1. **Customize Data**: Add real departments, doctors, and patients
2. **Configure Email**: Set up email in application.properties
3. **Deploy**: Deploy to AWS, Azure, or Heroku
4. **Enhance UI**: Customize styling and add more features
5. **Add More Features**: Integrate third-party services

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation
3. Check browser console and server logs
4. Test API with Postman
5. Verify all prerequisites are installed

## 🎉 You're All Set!

Your Hospital Management System is now ready to use. Start with the backend, then the frontend, and begin managing your hospital operations!

### Quick Start Summary
```bash
# Terminal 1: Start Backend
cd HospitalManagementSystem
mvnw spring-boot:run

# Terminal 2: Start Frontend
cd frontend
python -m http.server 8000

# Browser
http://localhost:8000/
```

Login and start using the system!
