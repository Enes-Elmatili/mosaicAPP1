const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authenticateFlexible = require('../middleware/authenticateFlexible');

router.post('/login', (req, res) => {
  const user = { id: 'u1', role: 'tenant', email: req.body?.email || 'demo@mosaic.test' };
  const token = jwt.sign(user, process.env.JWT_SECRET || 'dev-jwt', { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly:true, sameSite:'lax', secure:false, maxAge:7*24*3600*1000 });
  res.json({ ok:true, user });
});

router.get('/me', authenticateFlexible, (req, res) => res.json({ user: req.user || null }));
router.post('/logout', (req, res) => { res.clearCookie('token', { httpOnly:true, sameSite:'lax', secure:false }); res.json({ ok:true }); });

module.exports = router;
