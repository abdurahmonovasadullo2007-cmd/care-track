// routes/illnesses.js - CRUD API for Illnesses / Diagnoses
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin, requireClinician } = require('../middleware/auth');

// GET /api/illnesses - Get all illnesses (with optional filters)
router.get('/', requireLogin, async (req, res) => {
    try {
        const { search, patient_id, severity } = req.query;

        let sql = `
            SELECT i.*, p.full_name AS patient_name, d.full_name AS doctor_name
            FROM illnesses i
            JOIN patients p ON i.patient_id = p.id
            LEFT JOIN doctors d ON p.doctor_id = d.id
        `;
        let params = [];
        let conditions = [];

        if (search) {
            conditions.push('(i.icd_code LIKE ? OR i.description LIKE ? OR p.full_name LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (patient_id) {
            conditions.push('i.patient_id = ?');
            params.push(patient_id);
        }

        if (severity) {
            conditions.push('i.severity = ?');
            params.push(severity);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY i.diagnosis_date DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Get illnesses error:', err);
        res.status(500).json({ error: 'Failed to fetch illnesses' });
    }
});

// GET /api/illnesses/:id - Get a single illness record
router.get('/:id', requireLogin, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, p.full_name AS patient_name
            FROM illnesses i
            JOIN patients p ON i.patient_id = p.id
            WHERE i.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Illness record not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Get illness error:', err);
        res.status(500).json({ error: 'Failed to fetch illness record' });
    }
});

// POST /api/illnesses - Create a new illness record (admin and clinician)
router.post('/', requireClinician, async (req, res) => {
    const { icd_code, description, severity, patient_id, diagnosis_date } = req.body;

    if (!icd_code || !description || !severity || !patient_id) {
        return res.status(400).json({ error: 'ICD code, description, severity, and patient are required' });
    }

    const validSeverities = ['mild', 'moderate', 'severe'];
    if (!validSeverities.includes(severity)) {
        return res.status(400).json({ error: 'Severity must be mild, moderate, or severe' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO illnesses (icd_code, description, severity, patient_id, diagnosis_date) VALUES (?, ?, ?, ?, ?)',
            [icd_code, description, severity, patient_id, diagnosis_date || new Date().toISOString().split('T')[0]]
        );
        res.status(201).json({ message: 'Illness record created successfully', id: result.insertId });
    } catch (err) {
        console.error('Create illness error:', err);
        res.status(500).json({ error: 'Failed to create illness record' });
    }
});

// PUT /api/illnesses/:id - Update an illness record (admin and clinician)
router.put('/:id', requireClinician, async (req, res) => {
    const { icd_code, description, severity, patient_id, diagnosis_date } = req.body;

    if (!icd_code || !description || !severity || !patient_id) {
        return res.status(400).json({ error: 'ICD code, description, severity, and patient are required' });
    }

    try {
        const [result] = await db.query(
            'UPDATE illnesses SET icd_code=?, description=?, severity=?, patient_id=?, diagnosis_date=? WHERE id=?',
            [icd_code, description, severity, patient_id, diagnosis_date, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Illness record not found' });
        }
        res.json({ message: 'Illness record updated successfully' });
    } catch (err) {
        console.error('Update illness error:', err);
        res.status(500).json({ error: 'Failed to update illness record' });
    }
});

// DELETE /api/illnesses/:id - Delete an illness record (admin only)
router.delete('/:id', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    try {
        const [result] = await db.query('DELETE FROM illnesses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Illness record not found' });
        }
        res.json({ message: 'Illness record deleted successfully' });
    } catch (err) {
        console.error('Delete illness error:', err);
        res.status(500).json({ error: 'Failed to delete illness record' });
    }
});

module.exports = router;
