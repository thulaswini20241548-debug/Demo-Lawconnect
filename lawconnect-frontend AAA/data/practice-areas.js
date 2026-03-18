/**
 * LawConnect — Practice Areas Data
 * File: data/practice-areas.js
 * Description: All six legal practice area cards rendered on the homepage.
 *              Each entry defines the icon, name, description, and the
 *              pre-filled query that fires when the user clicks a card.
 */

const PRACTICE_AREAS = [
  {
    icon: '👨‍👩‍👧',
    name: 'Family Law',
    description:
      'Marriage, divorce, child custody, maintenance, and inheritance under Kandyan, Muslim, and General Law.',
    query: 'family law in Sri Lanka',
  },
  {
    icon: '💼',
    name: 'Employment Law',
    description:
      'Wage disputes, wrongful termination, workplace discrimination, and employee rights under Sri Lankan labour law.',
    query: 'employment rights under Shop and Office Employees Act Sri Lanka',
  },
  {
    icon: '🏠',
    name: 'Property Rights',
    description:
      'Ownership disputes, tenant rights under the Rent Act, unlawful evictions, and land registration.',
    query: 'property rights and landlord tenant law in Sri Lanka',
  },
  {
    icon: '🛡️',
    name: 'Consumer Protection',
    description:
      'Defective goods, misleading advertisements, refund rights, and complaints under the Consumer Affairs Authority.',
    query: 'consumer rights under Customer Affairs Authority Act Sri Lanka',
  },
  {
    icon: '⚖️',
    name: 'Criminal Law',
    description:
      'Rights upon arrest, bail procedures, legal aid access, and navigating the criminal justice system.',
    query: 'criminal law rights and procedures in Sri Lanka',
  },
  {
    icon: '🤝',
    name: 'Legal Aid',
    description:
      'Free legal services, Legal Aid Commission resources, and how to access affordable legal representation.',
    query: 'free legal aid services available in Sri Lanka',
  },
];
