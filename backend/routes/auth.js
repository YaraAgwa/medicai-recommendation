const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { collections } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register/patient', async (req, res) => {
  const { email, password, name, age, gender, medical_history, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = await collections.users().insertOne({
      email,
      password: hashed,
      role: 'patient',
      name,
      created_at: new Date(),
      profile: {
        age: age || null,
        gender: gender || null,
        medical_history: medical_history || null,
        phone: phone || null,
      },
    });

    const user = { id: result.insertedId.toString(), email, role: 'patient', name };
    res.status(201).json({ token: createToken(user), user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/register/doctor', async (req, res) => {
  const { email, password, name, specialty, license_number, experience_years, bio, hospital } = req.body;

  if (!email || !password || !name || !specialty) {
    return res.status(400).json({ error: 'Email, password, name, and specialty are required' });
  }

  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = await collections.users().insertOne({
      email,
      password: hashed,
      role: 'doctor',
      name,
      created_at: new Date(),
      profile: {
        specialty,
        license_number: license_number || null,
        experience_years: experience_years || null,
        bio: bio || null,
        bio_ar: null,
        hospital: hospital || null,
        hospital_ar: null,
      },
    });

    const user = { id: result.insertedId.toString(), email, role: 'doctor', name };
    res.status(201).json({ token: createToken(user), user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  const user = await collections.users().findOne({ email, role });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const safeUser = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };
  res.json({ token: createToken(safeUser), user: safeUser });
});

module.exports = router;
