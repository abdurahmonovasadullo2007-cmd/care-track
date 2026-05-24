// middleware/auth.js - Authentication and role-based access control

// Check if the user is logged in at all
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }
    next();
}

// Only allow admin role
function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
}

// Allow both admin and clinician
function requireClinician(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }
    const allowedRoles = ['admin', 'clinician'];
    if (!allowedRoles.includes(req.session.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
}

// Allow admin, clinician and receptionist (patient intake)
function requireReceptionist(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }
    const allowedRoles = ['admin', 'clinician', 'receptionist'];
    if (!allowedRoles.includes(req.session.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
}

module.exports = { requireLogin, requireAdmin, requireClinician, requireReceptionist };
