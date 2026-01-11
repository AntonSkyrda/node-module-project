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
};
