// One source of truth for the plans shown on the home page and /pricing.
// Paid plans only (owner rule): no free plan, no free trial.
// Every feature listed here must match what the code actually does.
export const PRO_FEATURES = [
  'Speak (or type) a command in your web browser',
  'AI drafts the email and sends it from your connected Outlook',
  'Book Outlook meetings by voice',
  'Create follow-up tasks by voice',
  'Draft proposal documents',
  'History of every command in your dashboard',
];

export const PLANS = [
  {
    name: 'Pro',
    price: 49,
    period: '/month',
    priceId: 'price_1TdNAuIcky2cOtqj5Yz6Xu82',
    description: 'For a sales rep who wants to update the busywork by voice.',
    features: PRO_FEATURES,
    cta: 'Get Pro',
    checkout: true,
  },
  {
    name: 'Enterprise',
    price: 999,
    period: '/month',
    priceId: null,
    description: 'For a team that wants help getting set up.',
    features: [
      'Everything in Pro',
      'We help set up your team',
      'Set up and billed by email with us',
    ],
    cta: 'Email us',
    checkout: false,
  },
];

export const TIP_AMOUNTS = [5, 10, 25];
export const SUPPORT_EMAIL = 'support@voiceexecai.com';
export const BUSINESS_LINE = 'Richard Ryan LLC, 555 5th Avenue #1910, Des Moines, Iowa 50309';
