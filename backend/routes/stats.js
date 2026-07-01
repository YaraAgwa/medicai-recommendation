const express = require('express');
const { collections } = require('../database');

const router = express.Router();

// Site-wide statistics. Public — anyone can see the platform totals.
router.get('/', async (req, res) => {
  const users = collections.users();

  // countDocuments() just counts how many documents match a filter.
  // Promise.all runs these counts at the same time (faster than one-by-one).
  const [doctors, patients, questions, answers, appointments] = await Promise.all([
    users.countDocuments({ role: 'doctor' }),
    users.countDocuments({ role: 'patient' }),
    collections.questions().countDocuments(),
    collections.answers().countDocuments(),
    collections.appointments().countDocuments(),
  ]);

  // Aggregation: group all questions by their category and count each group.
  const byCategory = await collections.questions().aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  res.json({
    doctors,
    patients,
    questions,
    answers,
    appointments,
    questionsByCategory: byCategory.map((c) => ({
      category: c._id || 'General',
      count: c.count,
    })),
  });
});

module.exports = router;
