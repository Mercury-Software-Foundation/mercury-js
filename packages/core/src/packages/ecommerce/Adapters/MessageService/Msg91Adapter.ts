import { IMessageService } from './IMessageService';

export class Msg91Adapter implements IMessageService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    to: { mobileNumber: string; firstName: string; secure_url: string }[],
    templateId: string
  ): Promise<boolean> {
    const options = {
      method: 'POST',
      headers: {
        authkey: this.apiKey,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        recipients: to.map((recipient) => ({
          mobiles: recipient.mobileNumber,
          firstName: recipient.firstName,
          secure_url: recipient.secure_url,
        })),
      }),
    };

    try {
      const response = await fetch(
        'https://control.msg91.com/api/v5/flow',
        options
      );
      const data = await response.json();
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  async sendEmail(
    to: {
      email: string;
      name: string;
      firstName: string;
      secure_url: string;
    }[],
    from: { email: string; name: string },
    domain: string,
    templateId: string
  ): Promise<boolean> {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authkey: this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        recipients: to.map((recipient) => ({
          to: [{ name: recipient.firstName, email: recipient.email }],
          variables: {
            firstName: recipient.firstName,
            secure_url: recipient.secure_url,
          },
        })),
        from: {
          name: from.name,
          email: from.email,
        },
        domain: domain,
        template_id: templateId,
      }),
    };

    try {
      const response = await fetch(
        'https://control.msg91.com/api/v5/email/send',
        options
      );
      const data = await response.json();
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }
}
