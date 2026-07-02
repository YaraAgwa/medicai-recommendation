const express = require('express');
const { collections, toObjectId } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function serializeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    created_at: user.created_at,
    avatar: user.avatar || null,
    profile: user.profile || null,
  };
}

router.get('/me', authMiddleware, async (req, res) => {
  const _id = toObjectId(req.user.id);
  const user = _id && (await collections.users().findOne({ _id }));
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(serializeUser(user));
});

router.put('/me', authMiddleware, async (req, res) => {
  const _id = toObjectId(req.user.id);
  if (!_id) return res.status(404).json({ error: 'User not found' });

  const { name, avatar, ...profileData } = req.body;
  const set = {};

  if (name) set.name = name;

  // Avatar is a small base64 image (data URL). Guard its size so nobody can
  // stuff a huge file into the database. Empty/null removes the photo.
  if (avatar !== undefined) {
    if (typeof avatar === 'string' && avatar.startsWith('data:image/')) {
      if (avatar.length > 400000) {
        return res.status(400).json({ error: 'Image too large' });
      }
      set.avatar = avatar;
    } else if (avatar === null || avatar === '') {
      set.avatar = null;
    }
  }

  if (req.user.role === 'patient') {
    const { age, gender, medical_history, phone } = profileData;
    set.profile = {
      age: age ?? null,
      gender: gender ?? null,
      medical_history: medical_history ?? null,
      phone: phone ?? null,
    };
  } else {
    const { specialty, license_number, experience_years, bio, hospital } = profileData;
    const existing = await collections.users().findOne({ _id });
    const prev = (existing && existing.profile) || {};
    set.profile = {
      specialty: specialty ?? null,
      license_number: license_number ?? null,
      experience_years: experience_years ?? null,
      bio: bio ?? null,
      bio_ar: prev.bio_ar ?? null,
      hospital: hospital ?? null,
      hospital_ar: prev.hospital_ar ?? null,
    };
  }

  await collections.users().updateOne({ _id }, { $set: set });

  const user = await collections.users().findOne({ _id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(serializeUser(user));
});

module.exports = router;
