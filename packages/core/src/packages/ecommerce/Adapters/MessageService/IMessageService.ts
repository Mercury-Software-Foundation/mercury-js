export interface IMessageService {
  sendMessage(
    to: { mobileNumber: string; firstName: string; secure_url: string }[],
    templateId: string
  ): Promise<boolean>;
  sendEmail(
    to: {
      email: string;
      name: string;
      firstName: string;
      secure_url: string;
    }[],
    from : {
        email: string,
        name: string
    },
    domain: string,
    templateId: string
  ): Promise<boolean>;
}
