# CareTrack MRMS — Medical Records Management System
**BTEC Level 3 | Unit 25: Full Stack Development**

---

## Tech Stack
| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript     |
| Backend  | Node.js + Express.js                |
| Database | MySQL                               |
| Auth     | express-session + bcryptjs          |

---

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/) 8.0 or higher

### 2. Create the Database
Open MySQL Workbench or your terminal and run:
```bash
mysql -u root -p < database.sql
```
This creates the `caretrack_db` database with all tables and sample data.

### 3. Configure Database Connection
Edit `db.js` and update your MySQL credentials:
```js
user: 'root',      // your MySQL username
password: '',      // your MySQL password
```

### 4. Install Dependencies
```bash
cd caretrack-mrms
npm install
```

### 5. Start the Server
```bash
npm start
```
Or with auto-restart during development:
```bash
npm run dev
```

### 6. Open the App
Visit: **http://localhost:3000**

---

## Login Credentials (Demo)

| Username | Password  | Role       | Access Level              |
|----------|-----------|------------|---------------------------|
| admin    | admin123  | Admin      | Full CRUD on everything   |
| drsmith  | admin123  | Clinician  | View all; Edit patients & diagnoses |

> **Note:** Passwords in the database are hashed with bcrypt.
> To create new users with hashed passwords, use Node.js:
> ```js
> const bcrypt = require('bcryptjs');
> const hash = await bcrypt.hash('yourpassword', 10);
> console.log(hash);
> ```
> Then INSERT the hash into the `users` table.

---

## API Endpoints

### Auth
| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| POST   | /api/auth/login   | Login (returns session) |
| POST   | /api/auth/logout  | Logout               |
| GET    | /api/auth/me      | Get current user     |

### Doctors
| Method | Endpoint              | Role Required | Description     |
|--------|-----------------------|---------------|-----------------|
| GET    | /api/doctors          | Any           | List all doctors |
| GET    | /api/doctors/:id      | Any           | Get one doctor  |
| POST   | /api/doctors          | Admin         | Create doctor   |
| PUT    | /api/doctors/:id      | Admin         | Update doctor   |
| DELETE | /api/doctors/:id      | Admin         | Delete doctor   |

### Patients
| Method | Endpoint              | Role Required   | Description      |
|--------|-----------------------|-----------------|------------------|
| GET    | /api/patients         | Any             | List all patients |
| GET    | /api/patients/:id     | Any             | Get one patient  |
| POST   | /api/patients         | Admin/Clinician | Create patient   |
| PUT    | /api/patients/:id     | Admin/Clinician | Update patient   |
| DELETE | /api/patients/:id     | Admin           | Delete patient   |

### Illnesses
| Method | Endpoint              | Role Required   | Description         |
|--------|-----------------------|-----------------|---------------------|
| GET    | /api/illnesses        | Any             | List all diagnoses  |
| GET    | /api/illnesses/:id    | Any             | Get one diagnosis   |
| POST   | /api/illnesses        | Admin/Clinician | Create diagnosis    |
| PUT    | /api/illnesses/:id    | Admin/Clinician | Update diagnosis    |
| DELETE | /api/illnesses/:id    | Admin           | Delete diagnosis    |

---

## Project Structure
```
caretrack-mrms/
├── server.js           # Express app entry point
├── db.js               # MySQL connection pool
├── database.sql        # DB schema + sample data
├── package.json
├── middleware/
│   └── auth.js         # requireLogin, requireAdmin, requireClinician
├── routes/
│   ├── auth.js         # /api/auth/*
│   ├── doctors.js      # /api/doctors/*
│   ├── patients.js     # /api/patients/*
│   └── illnesses.js    # /api/illnesses/*
└── public/
    ├── index.html          # Login page
    ├── dashboard.html      # Stats + overview
    ├── doctors.html        # Doctor management
    ├── patients.html       # Patient management
    ├── illnesses.html      # Diagnosis management
    ├── patient-profile.html # Full patient profile
    ├── style.css           # All styles
    └── app.js              # Shared JS utilities
```

---

## Data Model (ERD Summary)
```
users
  id, username, password, role, full_name

doctors
  id, full_name, specialization, department, phone, email

patients
  id, full_name, date_of_birth, gender, phone, doctor_id → doctors.id

illnesses
  id, icd_code, description, severity, patient_id → patients.id, diagnosis_date
```

**Relationships:**
- `doctors` 1 ── N `patients`  (one doctor can have many patients)
- `patients` 1 ── N `illnesses` (one patient can have many diagnoses)

---

*BTEC Level 3 Extended Diploma | Unit 25: Full Stack Development Assignment*
