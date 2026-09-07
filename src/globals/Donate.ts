import type { GlobalConfig } from 'payload'

/**
 * Single source of truth for payment details. Rendered on /donate, on every
 * project page, and linked from the header button — so an IBAN only ever has
 * to be corrected in one place.
 */
export const Donate: GlobalConfig = {
  slug: 'donate',
  label: 'Donation details',
  admin: {
    group: 'Pages',
    description: 'Payment links and bank details shown wherever we ask for money.',
  },
  access: { read: () => true },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'methods',
      type: 'array',
      labels: { singular: 'Method', plural: 'Payment methods' },
      admin: { description: 'Monobank jar, PayPal, card link, crypto — anything with a URL.' },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'url', type: 'text', required: true },
        { name: 'description', type: 'text', localized: true },
      ],
    },
    {
      type: 'collapsible',
      label: 'Bank transfer',
      fields: [
        { name: 'recipient', type: 'text', localized: true },
        { name: 'iban', type: 'text' },
        { name: 'taxId', type: 'text', label: 'EDRPOU / tax ID' },
        {
          name: 'paymentPurpose',
          type: 'text',
          localized: true,
          admin: { description: 'What donors should write in the payment reference.' },
        },
      ],
    },
  ],
}
