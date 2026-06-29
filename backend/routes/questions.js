const express = require('express');
const { collections, toObjectId, serialize } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { getLang, localizeQuestion, localizeAnswer } = require('../utils/localize');

const router = express.Router();

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Aggregation stages that attach `patient_name` from the referenced user.
const withPatientName = [
  {
    $lookup: {
      from: 'users',
      localField: 'patient_id',
      foreignField: '_id',
      as: 'patient',
    },
  },
  { $addFields: { patient_name: { $arrayElemAt: ['$patient.name', 0] } } },
  { $project: { patient: 0 } },
];

// Aggregation stages that attach author name/role and doctor specialty to answers.
const withAnswerAuthor = [
  {
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: '_id',
      as: 'author',
    },
  },
  {
    $addFields: {
      author_name: { $arrayElemAt: ['$author.name', 0] },
      author_role: { $arrayElemAt: ['$author.role', 0] },
      doctor_specialty: {
        $let: {
          vars: { u: { $arrayElemAt: ['$author', 0] } },
          in: {
            $cond: [{ $eq: ['$$u.role', 'doctor'] }, '$$u.profile.specialty', null],
          },
        },
      },
    },
  },
  { $project: { author: 0 } },
];

router.get('/', async (req, res) => {
  const lang = getLang(req);
  const { category, search } = req.query;

  const match = {};
  if (category) match.category = category;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    match.$or = [{ title: rx }, { body: rx }, { title_ar: rx }, { body_ar: rx }];
  }

  const questions = await collections.questions().aggregate([
    { $match: match },
    ...withPatientName,
    {
      $lookup: {
        from: 'answers',
        localField: '_id',
        foreignField: 'question_id',
        as: 'answers',
      },
    },
    { $addFields: { answer_count: { $size: '$answers' } } },
    { $project: { answers: 0 } },
    { $sort: { created_at: -1 } },
  ]).toArray();

  res.json(questions.map((q) => localizeQuestion(serialize(q), lang)));
});

router.get('/:id', async (req, res) => {
  const lang = getLang(req);
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(404).json({ error: 'Question not found' });

  const found = await collections.questions().aggregate([
    { $match: { _id } },
    ...withPatientName,
  ]).toArray();

  if (!found[0]) return res.status(404).json({ error: 'Question not found' });

  const answers = await collections.answers().aggregate([
    { $match: { question_id: _id } },
    ...withAnswerAuthor,
    { $sort: { created_at: 1 } },
  ]).toArray();

  res.json({
    ...localizeQuestion(serialize(found[0]), lang),
    answers: answers.map((a) => localizeAnswer(serialize(a), lang)),
  });
});

router.post('/', authMiddleware, requireRole('patient'), async (req, res) => {
  const lang = getLang(req);
  const { title, body, category } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const result = await collections.questions().insertOne({
    patient_id: toObjectId(req.user.id),
    title,
    title_ar: null,
    body,
    body_ar: null,
    category: category || 'General',
    created_at: new Date(),
  });

  const found = await collections.questions().aggregate([
    { $match: { _id: result.insertedId } },
    ...withPatientName,
  ]).toArray();

  res.status(201).json(localizeQuestion(serialize(found[0]), lang));
});

router.post('/:id/answers', authMiddleware, async (req, res) => {
  const lang = getLang(req);
  const { body } = req.body;
  const questionId = toObjectId(req.params.id);

  if (!body) return res.status(400).json({ error: 'Answer body is required' });
  if (!questionId) return res.status(404).json({ error: 'Question not found' });

  const question = await collections.questions().findOne({ _id: questionId });
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const result = await collections.answers().insertOne({
    question_id: questionId,
    user_id: toObjectId(req.user.id),
    body,
    body_ar: null,
    created_at: new Date(),
  });

  const found = await collections.answers().aggregate([
    { $match: { _id: result.insertedId } },
    ...withAnswerAuthor,
  ]).toArray();

  res.status(201).json(localizeAnswer(serialize(found[0]), lang));
});

module.exports = router;
