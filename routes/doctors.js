// routes/doctors.js - CRUD API for Doctors
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin, requireAdmin } = require('../middleware/auth');

// GET /api/doctors - Get all doctors (with optional search)
router.get('/', requireLogin, async (req, res) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM doctors';
        let params = [];

        if (search) {
            sql += ' WHERE full_name LIKE ? OR specialization LIKE ? OR department LIKE ?';
            const term = `%${search}%`;
            params = [term, term, term];
        }

        sql += ' ORDER BY full_name ASC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Get doctors error:', err);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

// GET /api/doctors/:id - Get a single doctor
router.get('/:id', requireLogin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Get doctor error:', err);
        res.status(500).json({ error: 'Failed to fetch doctor' });
    }
});

// GET /api/doctors/:id/patients - Get all patients of a specific doctor
router.get('/:id/patients', requireLogin, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM patients WHERE doctor_id = ? ORDER BY full_name ASC',
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Get doctor patients error:', err);
        res.status(500).json({ error: 'Failed to fetch patients for this doctor' });
    }
});

// POST /api/doctors - Create a new doctor (admin only)
router.post('/', requireAdmin, async (req, res) => {
    const { full_name, specialization, department, phone, email } = req.body;

    if (!full_name || !specialization || !department) {
        return res.status(400).json({ error: 'Name, specialization, and department are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO doctors (full_name, specialization, department, phone, email) VALUES (?, ?, ?, ?, ?)',
            [full_name, specialization, department, phone || null, email || null]
        );
        res.status(201).json({ message: 'Doctor created successfully', id: result.insertId });
    } catch (err) {
        console.error('Create doctor error:', err);
        res.status(500).json({ error: 'Failed to create doctor' });
    }
});

// PUT /api/doctors/:id - Update a doctor (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
    const { full_name, specialization, department, phone, email } = req.body;

    if (!full_name || !specialization || !department) {
        return res.status(400).json({ error: 'Name, specialization, and department are required' });
    }

    try {
        const [result] = await db.query(
            'UPDATE doctors SET full_name=?, specialization=?, department=?, phone=?, email=? WHERE id=?',
            [full_name, specialization, department, phone || null, email || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json({ message: 'Doctor updated successfully' });
    } catch (err) {
        console.error('Update doctor error:', err);
        res.status(500).json({ error: 'Failed to update doctor' });
    }
});

// DELETE /api/doctors/:id - Delete a doctor (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        console.error('Delete doctor error:', err);
        res.status(500).json({ error: 'Failed to delete doctor' });
    }
});

module.exports = router;
