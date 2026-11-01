// Shapes shared by the server actions and the client forms.

export type Attribution = {
  source_page?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type StepValues = Record<string, unknown>;

export type StepPayload = {
  service: string;
  stepIndex: number;
  values: StepValues;
  attribution: Attribution;
  /** The honeypot. People never see it, so anything here is a bot. */
  website?: string;
  sessionId?: string;
};

export type ThankYouData = {
  ref: string;
  ownerFirstName: string | null;
  replyPromise: string | null;
  nextSteps: string[];
};

export type StepResult =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "finished"; ref: string | null; thankYou?: ThankYouData | null }
  | { status: "invalid"; errors: Record<string, string>; values: StepValues }
  | { status: "error"; message: string; values: StepValues };

export type SimpleFormResult =
  | { status: "ok" }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "error"; message: string };

export const saveFailedMessage =
  "Couldn’t save. Check your connection and try again.";
