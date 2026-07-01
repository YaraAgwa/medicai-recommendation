const express = require('express');
const { collections, toObjectId, serialize } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { getLang, localizeDoctor } = require('../utils/localize');

const router = express.Router();

// All favorite actions belong to the logged-in patient.
router.use(authMiddleware, requireRole('patient'));

// The full list of the patient's favorite doctors (for the Favorites page).
router.get('/', async (req, res) => {
  const lang = getLang(req);
  const me = toObjectId(req.user.id);

  const doctors = await collections.favorites().aggregate([
    { $match: { patient_id: me } },
    { $lookup: { from: 'users', localField: 'doctor_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: '$doctor' },
    { $lookup: { from: 'answers', localField: 'doctor_id', foreignField: 'user_id', as: 'authored' } },
    {
      $project: {
        _id: '$doctor._id',
        name: '$doctor.name',
        email: '$doctor.email',
        specialty: '$doctor.profile.specialty',
        experience_years: '$doctor.profile.experience_years',
        bio: '$doctor.profile.bio',
        bio_ar: '$doctor.profile.bio_ar',
        hospital: '$doctor.profile.hospital',
        hospital_ar: '$doctor.profile.hospital_ar',
        answers_given: { $size: '$authored' },
      },
    },
    { $sort: { name: 1 } },
  ]).toArray();

  res.json(doctors.map((d) => localizeDoctor(serialize(d), lang)));
});

// Just the doctor ids the patient has favorited (for filling in ❤️ on lists).
router.get('/ids', async (req, res) => {
  const me = toObjectId(req.user.id);
  const rows = await collections.favorites().find({ patient_id: me }).toArray();
  res.json(rows.map((r) => r.doctor_id.toString()));
});

// Add a doctor to favorites.
router.post('/', async (req, res) => {
  const docId = toObjectId(req.body.doctor_id);
  if (!docId) return res.status(400).json({ error: 'Invalid doctor' });

  const doctor = await collections.users().findOne({ _id: docId, role: 'doctor' });
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  try {
    await collections.favorites().insertOne({
      patient_id: toObjectId(req.user.id),
      doctor_id: docId,
      created_at: new Date(),
    });
  } catch (err) {
    // Duplicate = already favorited; that's fine, not an error for the user.
    if (err.code !== 11000) throw err;
  }
  res.status(201).json({ ok: true });
});

// Remove a doctor from favorites.
router.delete('/:doctorId', async (req, res) => {
  const docId = toObjectId(req.params.doctorId);
  if (!docId) return res.status(400).json({ error: 'Invalid doctor' });

  await collections.favorites().deleteOne({
    patient_id: toObjectId(req.user.id),
    doctor_id: docId,
  });
  res.json({ ok: true });
});

module.exports = router;
