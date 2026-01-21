import { IEmailData } from '../mailer/interfaces/email-data.interface';

export const EMAIL_TEMPLATES: Record<string, IEmailData> = {
  ACTIVATION: {
    subject: 'Activate Account',
    template: 'activate',
  },

  RESET_PASSWORD: {
    subject: 'Reset Password',
    template: 'recovery',
  },

  MANAGER_LISTING_BLOCKED: {
    subject: 'Listing was blocked after 3 failed checks',
    template: 'manager-listing-blocked',
  },
};
