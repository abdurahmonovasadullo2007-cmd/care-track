-- CareTrack MRMS - Database Schema
-- Run this file in MySQL to set up the database

CREATE DATABASE IF NOT EXISTS caretrack_db;
USE caretrack_db;

-- Users table (for login)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'clinician', 'receptionist') NOT NULL DEFAULT 'clinician',
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    phone VARCHAR(20),
    doctor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Illnesses / Diagnoses table
CREATE TABLE IF NOT EXISTS illnesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icd_code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('mild', 'moderate', 'severe') NOT NULL,
    patient_id INT NOT NULL,
    diagnosis_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Admin and Clinician users (passwords are hashed with bcrypt)
-- admin123 and clinic123 are the plain passwords
-- Password for both accounts is: admin123
INSERT INTO users (username, password, role, full_name) VALUES
('admin',         '$2a$10$DzBPTM4XemzeXROBwuesReUpCfXrfBpGOuJbvEJKDG1KTM4LFCU2K', 'admin',        'System Administrator'),
('drsmith',       '$2a$10$DzBPTM4XemzeXROBwuesReUpCfXrfBpGOuJbvEJKDG1KTM4LFCU2K', 'clinician',    'Dr. John Smith'),
('receptionist',  '$2a$10$DzBPTM4XemzeXROBwuesReUpCfXrfBpGOuJbvEJKDG1KTM4LFCU2K', 'receptionist', 'Qabulxona xodimi');

-- Sample Doctors
INSERT INTO doctors (full_name, specialization, department, phone, email) VALUES
('Dr. Sarah Johnson',  'Cardiology',        'Heart & Vascular',   '+44 7700 900001', 'sarah.johnson@caretrack.nhs'),
('Dr. Michael Chen',   'Neurology',         'Brain & Spine',      '+44 7700 900002', 'michael.chen@caretrack.nhs'),
('Dr. Emily Davis',    'General Practice',  'Primary Care',       '+44 7700 900003', 'emily.davis@caretrack.nhs'),
('Dr. James Wilson',   'Orthopaedics',      'Bone & Joint',       '+44 7700 900004', 'james.wilson@caretrack.nhs'),
('Dr. Fatima Al-Hassan','Paediatrics',      'Children\'s Ward',   '+44 7700 900005', 'fatima.alhassan@caretrack.nhs');

-- Sample Patients
INSERT INTO patients (full_name, date_of_birth, gender, phone, doctor_id) VALUES
('Alice Thompson',    '1985-03-12', 'female', '+44 7800 100001', 1),
('Bob Patel',         '1972-07-25', 'male',   '+44 7800 100002', 2),
('Carol Williams',    '1990-11-08', 'female', '+44 7800 100003', 3),
('David Brown',       '1965-01-30', 'male',   '+44 7800 100004', 4),
('Emma Clarke',       '2005-06-15', 'female', '+44 7800 100005', 5),
('Frank Miller',      '1978-09-22', 'male',   '+44 7800 100006', 1),
('Grace Lee',         '1995-04-03', 'female', '+44 7800 100007', 3);

-- Sample Illnesses
INSERT INTO illnesses (icd_code, description, severity, patient_id, diagnosis_date) VALUES
('I10',   'Essential (primary) hypertension',             'moderate', 1, '2024-01-15'),
('I25.1', 'Atherosclerotic heart disease',                'severe',   1, '2024-03-20'),
('G35',   'Multiple sclerosis',                           'severe',   2, '2023-11-10'),
('G43.9', 'Migraine, unspecified',                        'mild',     2, '2024-02-05'),
('J06.9', 'Acute upper respiratory infection, unspecified','mild',    3, '2024-05-01'),
('M54.5', 'Low back pain',                                'moderate', 4, '2024-04-18'),
('M17.1', 'Primary osteoarthritis of knee',               'moderate', 4, '2023-09-30'),
('J45.9', 'Asthma, unspecified',                          'moderate', 5, '2022-07-11'),
('E11.9', 'Type 2 diabetes mellitus without complications','moderate', 6, '2023-12-01'),
('K21.0', 'Gastro-oesophageal reflux disease',            'mild',     7, '2024-04-22');
