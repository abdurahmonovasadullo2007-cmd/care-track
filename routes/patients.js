// routes/patients.js - CRUD API for Patients
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin, requireClinician, requireReceptionist } = require('../middleware/auth');

// GET /api/patients - Get all patients (with optional search)
router.get('/', requireLogin, async (req, res) => {
    try {
        const { search, doctor_id } = req.query;

        // Join with doctors to get doctor name alongside patient info
        let sql = `
            SELECT p.*, d.full_name AS doctor_name, d.specialization
            FROM patients p
            LEFT JOIN doctors d ON p.doctor_id = d.id
        `;
        let params = [];
        let conditions = [];

        if (search) {
            conditions.push('(p.full_name LIKE ? OR p.phone LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term);
        }

        if (doctor_id) {
            conditions.push('p.doctor_id = ?');
            params.push(doctor_id);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY p.full_name ASC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Get patients error:', err);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// GET /api/patients/:id - Get a single patient with doctor info
router.get('/:id', requireLogin, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, d.full_name AS doctor_name, d.specialization, d.department,
                   d.phone AS doctor_phone, d.email AS doctor_email
            FROM patients p
            LEFT JOIN doctors d ON p.doctor_id = d.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Get patient error:', err);
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

// POST /api/patients - Create a new patient (admin, clinician and receptionist)
router.post('/', requireReceptionist, async (req, res) => {
    const { full_name, date_of_birth, gender, phone, doctor_id } = req.body;

    if (!full_name || !date_of_birth || !gender) {
        return res.status(400).json({ error: 'Name, date of birth, and gender are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO patients (full_name, date_of_birth, gender, phone, doctor_id) VALUES (?, ?, ?, ?, ?)',
            [full_name, date_of_birth, gender, phone || null, doctor_id || null]
        );
        res.status(201).json({ message: 'Patient created successfully', id: result.insertId });
    } catch (err) {
        console.error('Create patient error:', err);
        res.status(500).json({ error: 'Failed to create patient' });
    }
});

// PUT /api/patients/:id - Update a patient (admin, clinician and receptionist)
router.put('/:id', requireReceptionist, async (req, res) => {
    const { full_name, date_of_birth, gender, phone, doctor_id } = req.body;

    if (!full_name || !date_of_birth || !gender) {
        return res.status(400).json({ error: 'Name, date of birth, and gender are required' });
    }

    try {
        const [result] = await db.query(
            'UPDATE patients SET full_name=?, date_of_birth=?, gender=?, phone=?, doctor_id=? WHERE id=?',
            [full_name, date_of_birth, gender, phone || null, doctor_id || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({ message: 'Patient updated successfully' });
    } catch (err) {
        console.error('Update patient error:', err);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

// DELETE /api/patients/:id - Delete a patient (admin only)
router.delete('/:id', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    try {
        const [result] = await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        console.error('Delete patient error:', err);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

module.exports = router;
