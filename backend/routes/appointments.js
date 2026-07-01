const express = require('express');
const { collections, toObjectId, serialize } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// A patient books an appointment with a doctor (instantly confirmed).
router.post('/', authMiddleware, requireRole('patient'), async (req, res) => {
  const { doctor_id, date, reason } = req.body;

  if (!doctor_id || !date) {
    return res.status(400).json({ error: 'Doctor and date are required' });
  }

  const docId = toObjectId(doctor_id);
  if (!docId) return res.status(400).json({ error: 'Invalid doctor' });

  // Make sure this doctor really exists and is actually a doctor.
  const doctor = await collections.users().findOne({ _id: docId, role: 'doctor' });
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const appointment = {
    patient_id: toObjectId(req.user.id),
    doctor_id: docId,
    date,
    reason: reason || '',
    status: 'confirmed',
    created_at: new Date(),
  };

  const result = await collections.appointments().insertOne(appointment);

  res.status(201).json(serialize({
    _id: result.insertedId,
    ...appointment,
    other_name: doctor.name,
    other_specialty: doctor.profile && doctor.profile.specialty,
  }));
});

// List the logged-in user's appointments. Works for both roles: a patient sees
// their bookings (with the doctor's name); a doctor sees theirs (with the
// patient's name).
router.get('/mine', authMiddleware, async (req, res) => {
  const me = toObjectId(req.user.id);
  const isDoctor = req.user.role === 'doctor';
  const mineField = isDoctor ? 'doctor_id' : 'patient_id';   // which are "mine"
  const otherField = isDoctor ? 'patient_id' : 'doctor_id';  // the other person

  const appointments = await collections.appointments().aggregate([
    { $match: { [mineField]: me } },
    {
      $lookup: {
        from: 'users',
        localField: otherField,
        foreignField: '_id',
        as: 'other',
      },
    },
    {
      $addFields: {
        other_name: { $arrayElemAt: ['$other.name', 0] },
        other_specialty: {
          $let: {
            vars: { u: { $arrayElemAt: ['$other', 0] } },
            in: '$$u.profile.specialty',
          },
        },
      },
    },
    { $project: { other: 0 } },
    { $sort: { date: 1 } },
  ]).toArray();

  res.json(appointments.map(serialize));
});

// Cancel an appointment. Only the patient or the doctor on it may cancel.
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(404).json({ error: 'Appointment not found' });

  const appointment = await collections.appointments().findOne({ _id: id });
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  const me = toObjectId(req.user.id);
  const isMine = appointment.patient_id.equals(me) || appointment.doctor_id.equals(me);
  if (!isMine) return res.status(403).json({ error: 'Not allowed' });

  await collections.appointments().updateOne({ _id: id }, { $set: { status: 'cancelled' } });
  res.json(serialize({ ...appointment, status: 'cancelled' }));
});

module.exports = router;
