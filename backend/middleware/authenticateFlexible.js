const jwt = require('jsonwebtoken');

module.exports = function authenticateFlexible(req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const master = process.env.MASTER_KEY || process.env.VITE_MASTER_KEY;

  if (!isProd) {
    const key = req.header('x-master-key');
    if (key && master && key === master) {
      req.user = { id: 'dev', role: 'admin', via: 'master-key' };
      return next();
    }
  }

  const auth = req.header('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const token = bearer || req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
