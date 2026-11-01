import { sent, type EmailProvider, type SmsProvider } from "../types.ts";

// Local development: nothing leaves the machine. Messages appear in the Edge
// Function's log (docker logs supabase_edge_runtime_elc-web).

export const logSms: SmsProvider = {
  name: "log",
  send({ to, text }) {
    console.log(`[notify:sms] to=${to} text=${text}`);
    return Promise.resolve(sent(`log-${crypto.randomUUID()}`));
  },
};

export const logEmail: EmailProvider = {
  name: "log",
  send({ to, subject, text }) {
    console.log(`[notify:email] to=${to} subject=${subject}\n${text}`);
    return Promise.resolve(sent(`log-${crypto.randomUUID()}`));
  },
};
