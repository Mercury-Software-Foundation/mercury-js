import { IMessageService } from './IMessageService';
import axios from 'axios';

export class Msg91Adapter implements IMessageService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    to: { mobileNumber: string; [x: string]: any; }[],
    templateId: string
  ): Promise<{ success: boolean; message: string }> {
    const options = {
      headers: {
        authkey: this.apiKey,
        accept: 'application/json',
        'content-type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/flow',
        {
          template_id: templateId,
          recipients: to.map((recipient) => ({
            mobiles: recipient.mobileNumber,
            firstName: recipient.firstName,
            secure_url: recipient.secure_url,
          })),
        },
        options
      );
    } catch (error: any) {
      console.error(error);
      return { success: false, message: error?.response?.data?.message || 'Failed to send message' };
    }

    return { success: true, message: 'Sent Successfully!!' };
  }

  async sendEmail(
    to: {
      email: string;
      name: string;
      [x: string]: any;
    }[],
    from: { email?: string; name?: string },
    domain: string,
    templateId: string
  ): Promise<{ success: boolean; message: string }> {
    const options = {
      headers: {
        accept: 'application/json',
        authkey: this.apiKey,
        'content-type': 'application/json',
      },
    };

    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/email/send',
        {
          recipients: to.map((recipient) => ({
            to: [{ name: recipient.firstName, email: recipient.email }],
            variables: {
              firstName: recipient.firstName,
              secure_url: recipient.secure_url,
              otp: recipient?.otp,
              order_id: recipient?.order_id
            },
          })),
          from: {
            name: from.name,
            email: from.email,
          },
          domain: domain,
          template_id: templateId,
        },
        options
      );
    } catch (error: any) {
      console.error(error);
      return { success: false, message: error?.response?.data?.message || 'Failed to send email' };
    }

    return { success: true, message: 'Sent Successfully!!' };
  }
}
