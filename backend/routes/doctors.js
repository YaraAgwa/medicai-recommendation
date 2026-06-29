const express = require('express');
const { collections, toObjectId, serialize } = require('../database');
const { getLang, localizeAnswer, localizeDoctor } = require('../utils/localize');

const router = express.Router();

// Flatten the embedded doctor `profile` onto the top-level document and attach
// an `answers_given` count, matching the shape the frontend expects.
const doctorShape = [
  {
    $lookup: {
      from: 'answers',
      localField: '_id',
      foreignField: 'user_id',
      as: 'authored',
    },
  },
  {
    $addFields: {
      answers_given: { $size: '$authored' },
      specialty: '$profile.specialty',
      license_number: '$profile.license_number',
      experience_years: '$profile.experience_years',
      bio: '$profile.bio',
      bio_ar: '$profile.bio_ar',
      hospital: '$profile.hospital',
      hospital_ar: '$profile.hospital_ar',
    },
  },
  { $project: { authored: 0, profile: 0, password: 0 } },
];

router.get('/', async (req, res) => {
  const lang = getLang(req);
  const { specialty } = req.query;

  const match = { role: 'doctor' };
  if (specialty) match['profile.specialty'] = specialty;

  const doctors = await collections.users().aggregate([
    { $match: match },
    ...doctorShape,
    { $sort: { name: 1 } },
  ]).toArray();

  res.json(doctors.map((d) => localizeDoctor(serialize(d), lang)));
});

router.get('/specialties', async (req, res) => {
  const specialties = await collections.users().distinct('profile.specialty', {
    role: 'doctor',
  });
  res.json(specialties.filter(Boolean).sort());
});

router.get('/:id', async (req, res) => {
  const lang = getLang(req);
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(404).json({ error: 'Doctor not found' });

  const found = await collections.users().aggregate([
    { $match: { _id, role: 'doctor' } },
    ...doctorShape,
  ]).toArray();

  if (!found[0]) return res.status(404).json({ error: 'Doctor not found' });

  const recentAnswers = await collections.answers().aggregate([
    { $match: { user_id: _id } },
    {
      $lookup: {
        from: 'questions',
        localField: 'question_id',
        foreignField: '_id',
        as: 'question',
      },
    },
    {
      $addFields: {
        question_title: { $arrayElemAt: ['$question.title', 0] },
        question_title_ar: { $arrayElemAt: ['$question.title_ar', 0] },
      },
    },
    { $project: { question: 0 } },
    { $sort: { created_at: -1 } },
    { $limit: 10 },
  ]).toArray();

  res.json({
    ...localizeDoctor(serialize(found[0]), lang),
    recentAnswers: recentAnswers.map((a) => localizeAnswer(serialize(a), lang)),
  });
});

module.exports = router;
