const express = require('express');
const { collections, toObjectId, serialize } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: all reviews for a doctor + the average rating and count.
router.get('/doctor/:doctorId', async (req, res) => {
  const docId = toObjectId(req.params.doctorId);
  if (!docId) return res.status(404).json({ error: 'Doctor not found' });

  const reviews = await collections.reviews().aggregate([
    { $match: { doctor_id: docId } },
    { $lookup: { from: 'users', localField: 'patient_id', foreignField: '_id', as: 'patient' } },
    { $addFields: { patient_name: { $arrayElemAt: ['$patient.name', 0] } } },
    { $project: { patient: 0 } },
    { $sort: { created_at: -1 } },
  ]).toArray();

  // Work out the average star rating (null if there are no reviews yet).
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;

  res.json({
    average,
    count,
    reviews: reviews.map(serialize),
  });
});

// The logged-in patient's own review for a doctor (or null).
router.get('/mine/:doctorId', authMiddleware, requireRole('patient'), async (req, res) => {
  const docId = toObjectId(req.params.doctorId);
  if (!docId) return res.status(404).json({ error: 'Doctor not found' });

  const review = await collections.reviews().findOne({
    patient_id: toObjectId(req.user.id),
    doctor_id: docId,
  });
  res.json(review ? serialize(review) : null);
});

// Patient submits (or updates) their review for a doctor.
router.post('/', authMiddleware, requireRole('patient'), async (req, res) => {
  const { doctor_id, rating, comment } = req.body;
  const docId = toObjectId(doctor_id);
  const stars = Number(rating);

  if (!docId) return res.status(400).json({ error: 'Invalid doctor' });
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const doctor = await collections.users().findOne({ _id: docId, role: 'doctor' });
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  // upsert: update the patient's existing review, or create it if none exists.
  await collections.reviews().updateOne(
    { patient_id: toObjectId(req.user.id), doctor_id: docId },
    { $set: { rating: stars, comment: comment || '', created_at: new Date() } },
    { upsert: true }
  );

  res.status(201).json({ ok: true });
});

module.exports = router;
