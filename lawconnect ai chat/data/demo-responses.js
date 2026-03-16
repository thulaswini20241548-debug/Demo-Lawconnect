/**
 * LawConnect — Demo Responses Database
 * File: data/demo-responses.js
 *
 * Description: Pre-scripted, legally accurate responses for Demo Mode
 *              (when no Anthropic API key is provided). Responses are keyed
 *              by topic and matched via keyword detection in chat.js.
 *
 * Format:  DEMO_RESPONSES[key] = markdown-formatted string
 *          Keywords that trigger each key are in DEMO_KEYWORDS below.
 *
 * Sources: Sri Lankan statutes including the Rent Act No. 7 of 1972,
 *          Shop and Office Employees Act No. 19 of 1954, Consumer Affairs
 *          Authority Act No. 9 of 2003, Constitution of Sri Lanka 1978.
 */

/* ─── Response Content ─── */
const DEMO_RESPONSES = {

  /* ── TENANT / EVICTION ── */
  tenant: `Under Sri Lanka's **Rent Act No. 7 of 1972**, tenants have significant protections against arbitrary eviction:

**Your key rights:**
1. Landlord MUST provide **written notice** — verbal eviction notices are not legally valid
2. You are entitled to a **minimum notice period** (typically 1–3 months depending on circumstances)
3. Eviction requires **lawful grounds** such as non-payment of rent or landlord's own use
4. Forced eviction without a **court order** is illegal — you can seek a court injunction

**If being evicted unlawfully:**
• Do not vacate until proper written notice is served
• File an application at the **Rent Board / District Court**
• Contact the **Legal Aid Commission** if you cannot afford a lawyer (free service)

**Useful contacts:**
• Legal Aid Commission: 011-2433618
• Nearest District Court registry

⚠️ *This is general information, not formal legal advice. For your specific situation, consulting a qualified lawyer is recommended.*

Would you like more information about filing a complaint or finding free legal aid?`,

  /* ── WAGE / EMPLOYMENT ── */
  wage: `This is a serious violation of Sri Lankan labour law! Under the **Shop and Office Employees Act No. 19 of 1954**, employers **cannot withhold wages** for alleged damages without a proper legal process.

**Your immediate rights:**
1. Demand your wages **in writing** from your employer (keep a copy)
2. File a complaint at the **Department of Labour** nearest to you — free of charge
3. Apply to a **Labour Tribunal** — they offer expedited and low-cost remedies for wage disputes

**Important to know:**
• Making false criminal threats to prevent you from claiming wages is a **criminal offence** under the Penal Code
• The law protects you from retaliation for asserting your wage rights

**Free help available:**
• **Legal Aid Commission of Sri Lanka** — free legal assistance for qualifying individuals
• **Department of Labour** regional offices handle wage complaints at no cost
• Employees can also approach the **Industrial Relations Division**

The amount owed is legally recoverable. Do not give up your right to earned wages.

⚠️ *This is general information. For your specific case, especially where threats are involved, please consult a qualified lawyer.*`,

  /* ── CONSUMER RIGHTS ── */
  consumer: `Under the **Consumer Affairs Authority Act No. 9 of 2003**, you have strong protections against defective products and misleading advertising.

**How to file a complaint:**
1. **Gather evidence** — keep receipts, photos of the defect, and all written communications
2. **Contact the seller first** — send a written complaint requesting a refund or replacement
3. **File with the CAA** — visit or call the Consumer Affairs Authority; investigations are free of charge
4. **Small Claims Court** — for monetary recovery up to a specified threshold

**Key rights you hold:**
• Protection against **misleading advertising** regardless of fine-print terms
• Sellers cannot use "opened package" policies to override statutory rights for defective goods
• The CAA can impose fines and **order compensation** on your behalf

**Useful contacts:**
📞 CAA Hotline: **1977** (free, island-wide)
🌐 www.caa.gov.lk

⚠️ *This is general information, not formal legal advice. For complex disputes, consult a qualified lawyer.*

Would you like guidance on writing a formal consumer complaint letter?`,

  /* ── LEGAL AID ── */
  legalAid: `Sri Lanka offers several **free legal aid** options for citizens who cannot afford private legal fees:

**1. Legal Aid Commission of Sri Lanka (LAC)**
• Provides completely free legal services to those who qualify
• Centres island-wide: Colombo, Kandy, Galle, Kurunegala, Jaffna, and more
• Handles criminal defence, civil matters, family law, and labour disputes
• Contact: 011-2433618

**2. Bar Association of Sri Lanka (BASL)**
• Maintains a lawyer directory for finding specialists
• Has a pro bono scheme for deserving cases
• Contact: 011-2323458

**3. Women In Need (WIN)**
• Free legal aid specifically for women facing domestic violence or family law issues
• Provides shelter, counselling, and legal representation

**4. University Legal Aid Clinics**
• Law faculties at University of Colombo, University of Peradeniya offer free consultations
• Ideal for straightforward legal queries

**Eligibility:** Generally based on income level. The LAC assesses each case individually at no cost.

**How to apply:** Visit your nearest Legal Aid Commission office with your National Identity Card and a brief description of your legal matter.

⚠️ *Availability may vary. We recommend calling ahead to confirm current services and office hours.*`,

  /* ── CRIMINAL / ARREST RIGHTS ── */
  criminal: `Under **Article 13 of the Constitution of Sri Lanka**, you have fundamental rights upon arrest:

**Your rights when arrested:**
1. **Right to know** the reason for your arrest immediately
2. **Right to remain silent** — you are not obligated to make any statement
3. **Right to legal representation** — you may contact a lawyer immediately
4. **Right to be produced before a Magistrate** within 24 hours of arrest
5. **Right to bail** — a Magistrate can grant bail; police bail is available for minor offences

**If rights are violated:**
• You may file a **Fundamental Rights petition** in the Supreme Court (Article 17)
• Your lawyer can apply for a **Writ of Habeas Corpus** if you are held illegally

**Free legal help:**
• **Legal Aid Commission** provides free criminal defence for qualifying individuals
• Public Defenders are available through the courts system

⚠️ *This is general information. If you or someone you know has been arrested, contact a lawyer or the Legal Aid Commission immediately.*`,

  /* ── FAMILY / DIVORCE ── */
  family: `Sri Lanka has **multiple personal laws** governing family matters depending on your ethnicity and religion:

**Applicable Laws:**
• **General Law** (Roman-Dutch): Applies to most people; Marriage Registration Ordinance No. 19 of 1907
• **Kandyan Law**: Applies to Kandyan Sinhalese; allows for *niduk* (mutual consent) divorce
• **Muslim Marriage and Divorce Act (MMDA)**: Governs Muslim marriages; Quazi courts handle disputes
• **Tesawalamai**: Customary property law for Tamils in the Northern Province

**Grounds for divorce (General Law):**
• Adultery
• Malicious desertion (2+ years)
• Incurable insanity

**Child custody:**
• The **best interests of the child** is the paramount legal consideration
• Both parents may apply for custody or access rights through the District Court

**Maintenance:**
• Women and children can claim maintenance through the **Magistrates' Court**
• Courts assess income of both parties when determining maintenance amounts

⚠️ *Family law is complex and varies significantly based on your personal law. Please consult a qualified family lawyer for your specific situation.*`,

  /* ── FALLBACK ── */
  fallback: `Thank you for your question. I can provide general guidance on Sri Lankan law for this topic.

**To get the most accurate answer, I recommend:**

1. **Activate full AI mode** — Click the 🔑 API Key button and enter your Anthropic key for detailed, personalised legal responses to any question

2. **Ask about a specific area** — I have detailed knowledge on:
   • Tenant & property rights (Rent Act No. 7 of 1972)
   • Employment & wages (Shop and Office Employees Act)
   • Consumer protection (CAA Act No. 9 of 2003)
   • Criminal rights upon arrest (Constitution Article 13)
   • Family law (Kandyan, Muslim, General law)
   • Free legal aid services

3. **Free legal assistance:**
   • Legal Aid Commission: 011-2433618
   • Consumer Affairs Authority Hotline: 1977
   • Bar Association of Sri Lanka: 011-2323458

⚠️ *This is general information only. For your specific legal situation, please consult a qualified lawyer.*

Would you like me to explain any of the practice areas above in more detail?`,
};

/* ─── Keyword → Response Key Mapping ─── */
const DEMO_KEYWORDS = {
  tenant:   ['tenant', 'evict', 'landlord', 'rent', 'lease', 'renting', 'house'],
  wage:     ['wage', 'salary', 'employer', 'employ', 'fired', 'dismiss', 'labour', 'labor', 'work', 'job', 'overtime'],
  consumer: ['consumer', 'product', 'complaint', 'refund', 'defect', 'purchase', 'buy', 'seller', 'shop', 'return'],
  legalAid: ['legal aid', 'free', 'afford', 'lawyer', 'attorney', 'legal help', 'commission'],
  criminal: ['arrest', 'police', 'criminal', 'bail', 'prison', 'jail', 'detain', 'rights arrest'],
  family:   ['divorce', 'marriage', 'custody', 'child', 'maintenance', 'family', 'spouse', 'husband', 'wife'],
};

/**
 * getDemoResponse(message)
 * Returns the best matching pre-scripted response for the given user message.
 * Falls back to DEMO_RESPONSES.fallback if no keywords match.
 *
 * @param {string} message - The user's raw input text
 * @returns {string} Markdown-formatted legal response
 */
function getDemoResponse(message) {
  const lower = message.toLowerCase();

  for (const [key, keywords] of Object.entries(DEMO_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return DEMO_RESPONSES[key];
    }
  }

  return DEMO_RESPONSES.fallback;
}
