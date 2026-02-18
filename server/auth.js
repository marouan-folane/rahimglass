const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rahimglass-super-secret-key-change-in-production';
const JWT_EXPIRES = '7d';

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

// Middleware: require any authenticated user
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    try {
        const payload = verifyToken(header.slice(7));
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}

// Middleware: require admin role
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }
        next();
    });
}

module.exports = { signToken, verifyToken, requireAuth, requireAdmin };
