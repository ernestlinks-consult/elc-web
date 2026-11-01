export type SendResult = {
  ok: boolean;
  providerId: string | null;
  error: string | null;
};

export type SmsMessage = { to: string; text: string };

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SmsProvider = {
  name: string;
  send(message: SmsMessage): Promise<SendResult>;
};

export type EmailProvider = {
  name: string;
  send(message: EmailMessage): Promise<SendResult>;
};

export type NotifyEnv = Record<string, string | undefined>;

export const sent = (providerId: string | null): SendResult => ({
  ok: true,
  providerId,
  error: null,
});

export const notSent = (error: string): SendResult => ({
  ok: false,
  providerId: null,
  error,
});
