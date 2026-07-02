const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

// The specialties the app actually has doctors for. We constrain the AI to
// choose from this list so we can link the patient straight to matching doctors.
const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
  'General Medicine', 'Psychiatry', 'Gastroenterology', 'Oncology',
  'Endocrinology', 'Pulmonology', 'Urology',
];

// Create the client only if a key is configured (reads ANTHROPIC_API_KEY from env).
// If there's no key, the route responds gracefully instead of crashing.
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

router.post('/symptom-check', async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
    return res.status(400).json({ error: 'Please describe your symptoms.' });
  }
  if (symptoms.length > 2000) {
    return res.status(400).json({ error: 'That description is too long — please shorten it.' });
  }
  if (!client) {
    return res.status(503).json({ error: 'The AI assistant is not set up on the server yet.' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system:
        `You are a careful medical triage assistant for the MedicAI platform. ` +
        `A patient describes their symptoms. Suggest which medical specialty they should consult, ` +
        `chosen ONLY from this list: ${SPECIALTIES.join(', ')}. ` +
        `Give brief, calm, general guidance (2-4 sentences). You are NOT a doctor and must NOT diagnose — ` +
        `frame everything as guidance to help them find the right specialist. ` +
        `Assess urgency: "routine" (see a doctor when convenient), "soon" (within a few days), ` +
        `or "emergency" (seek immediate care / call emergency services now).`,
      messages: [{ role: 'user', content: symptoms }],
      // Structured output: the model must return JSON matching this exact shape.
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              specialty: { type: 'string', enum: SPECIALTIES },
              also_consider: { type: 'array', items: { type: 'string', enum: SPECIALTIES } },
              advice: { type: 'string' },
              urgency: { type: 'string', enum: ['routine', 'soon', 'emergency'] },
            },
            required: ['specialty', 'also_consider', 'advice', 'urgency'],
            additionalProperties: false,
          },
        },
      },
    });

    const text = response.content.find((b) => b.type === 'text')?.text || '{}';
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('AI symptom-check failed:', err.message);
    res.status(502).json({ error: 'The AI assistant could not process that right now. Please try again.' });
  }
});

module.exports = router;
