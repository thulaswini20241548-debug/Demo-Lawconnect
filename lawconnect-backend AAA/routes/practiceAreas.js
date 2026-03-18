/**
 * LawConnect — Practice Areas Route
 * File: routes/practiceAreas.js
 *
 * GET  /api/practice-areas          → returns the static list of all 6 practice areas
 * POST /api/practice-areas/explain  → returns a deep-dive LexAI explanation for a topic
 *
 * The GET endpoint mirrors the frontend's data/practice-areas.js so the data
 * can eventually be served from the backend (useful if you want to manage it in a CMS).
 */

const express = require('express');
const { practiceAreaLimiter }      = require('../middleware/rateLimiter');
const { validatePracticeAreaBody } = require('../middleware/validate');
const { complete }                 = require('../utils/groq');
const { PRACTICE_AREA_PROMPT }     = require('../config/prompts');

const router = express.Router();

/* ── Static practice area data (mirrors frontend data/practice-areas.js) ── */
const PRACTICE_AREAS = [
  {
    id:          'family-law',
    icon:        '👨‍👩‍👧',
    name:        'Family Law',
    description: 'Marriage, divorce, child custody, maintenance, and inheritance under Kandyan, Muslim, and General Law.',
    query:       'family law in Sri Lanka',
    laws:        ['Marriage Registration Ordinance', 'Muslim Marriage and Divorce Act', 'Maintenance Act No. 37 of 1999', 'Domestic Violence Act No. 34 of 2005'],
  },
  {
    id:          'employment-law',
    icon:        '💼',
    name:        'Employment Law',
    description: 'Wage disputes, wrongful termination, workplace discrimination, and employee rights under Sri Lankan labour law.',
    query:       'employment rights under Shop and Office Employees Act Sri Lanka',
    laws:        ['Shop and Office Employees Act No. 19 of 1954', 'TEWA No. 45 of 1971', 'EPF Act No. 15 of 1958', 'Gratuity Act No. 12 of 1983'],
  },
  {
    id:          'property-rights',
    icon:        '🏠',
    name:        'Property Rights',
    description: 'Ownership disputes, tenant rights under the Rent Act, unlawful evictions, and land registration.',
    query:       'property rights and landlord tenant law in Sri Lanka',
    laws:        ['Rent Act No. 7 of 1972', 'Land Registration Ordinance', 'Partition Law Act No. 21 of 1977', 'Prevention of Frauds Ordinance'],
  },
  {
    id:          'consumer-protection',
    icon:        '🛡️',
    name:        'Consumer Protection',
    description: 'Defective goods, misleading advertisements, refund rights, and complaints under the Consumer Affairs Authority.',
    query:       'consumer rights under Customer Affairs Authority Act Sri Lanka',
    laws:        ['Consumer Affairs Authority Act No. 9 of 2003', 'Sale of Goods Ordinance', 'Electronic Transactions Act No. 19 of 2006'],
  },
  {
    id:          'criminal-law',
    icon:        '⚖️',
    name:        'Criminal Law',
    description: 'Rights upon arrest, bail procedures, legal aid access, and navigating the criminal justice system.',
    query:       'criminal law rights and procedures in Sri Lanka',
    laws:        ['Constitution Article 13', 'Code of Criminal Procedure Act No. 15 of 1979', 'Bail Act No. 30 of 1997', 'Penal Code of Sri Lanka'],
  },
  {
    id:          'legal-aid',
    icon:        '🤝',
    name:        'Legal Aid',
    description: 'Free legal services, Legal Aid Commission resources, and how to access affordable legal representation.',
    query:       'free legal aid services available in Sri Lanka',
    laws:        ['Legal Aid Commission Act', 'Bar Association of Sri Lanka Act'],
  },
];

/* ── GET /api/practice-areas ── */
router.get('/', (req, res) => {
  res.json({ practiceAreas: PRACTICE_AREAS });
});

/* ── GET /api/practice-areas/:id ── */
router.get('/:id', (req, res) => {
  const area = PRACTICE_AREAS.find(a => a.id === req.params.id);
  if (!area) return res.status(404).json({ error: `Practice area "${req.params.id}" not found.` });
  res.json({ practiceArea: area });
});

/* ── POST /api/practice-areas/explain ── */
router.post('/explain', practiceAreaLimiter, validatePracticeAreaBody, async (req, res) => {
  try {
    const { topic } = req.body;

    const userPrompt = `Please give a comprehensive overview of "${topic}" under Sri Lankan law. Include the key acts, common issues citizens face, their rights, and how to get help.`;

    const { reply, confidence, reason } = await complete({
      systemPrompt: PRACTICE_AREA_PROMPT,
      messages:     [{ role: 'user', content: userPrompt }],
      maxTokens:    1200,
    });

    return res.json({ reply, confidence, reason, topic });

  } catch (err) {
    console.error('[/api/practice-areas/explain] Error:', err.message);

    if (err?.status === 429) {
      return res.status(429).json({ error: 'AI service is busy. Please wait a moment.' });
    }
    return res.status(500).json({ error: 'Failed to generate explanation. Please try again.' });
  }
});

module.exports = router;
