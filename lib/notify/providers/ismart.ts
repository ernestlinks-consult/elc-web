import {
  notSent,
  sent,
  type NotifyEnv,
  type SmsProvider,
} from "../types.ts";

// UNVERIFIED. We do not have iSmart's API documentation yet, so nothing here has
// been tested against the real service. Everything specific to iSmart is read from
// configuration and kept in this one file. Check every value and how success is
// reported against their docs before turning this on, with a test SMS first.

function required(env: NotifyEnv, key: string) {
  const value = env[key];
  if (!value) throw new Error(`${key} is not set.`);
  return value;
}

export function ismartSms(env: NotifyEnv): SmsProvider {
  const apiUrl = required(env, "ISMART_API_URL");
  const apiKey = required(env, "ISMART_API_KEY");
  const senderId = required(env, "ISMART_SENDER_ID");
  const keyParam = env.ISMART_PARAM_KEY ?? "key";
  const toParam = env.ISMART_PARAM_TO ?? "to";
  const textParam = env.ISMART_PARAM_TEXT ?? "message";
  const senderParam = env.ISMART_PARAM_SENDER ?? "sender_id";
  const idField = env.ISMART_RESPONSE_ID_FIELD ?? "id";
  const sendAsJson = env.ISMART_BODY_FORMAT === "json";
  const keepPlus = env.ISMART_PHONE_FORMAT === "e164";

  return {
    name: "ismart",
    async send({ to, text }) {
      const fields = {
        [keyParam]: apiKey,
        [toParam]: keepPlus ? to : to.replace(/^\+/, ""),
        [textParam]: text,
        [senderParam]: senderId,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": sendAsJson
            ? "application/json"
            : "application/x-www-form-urlencoded",
        },
        body: sendAsJson
          ? JSON.stringify(fields)
          : new URLSearchParams(fields).toString(),
      });
      const body = await response.text();

      if (!response.ok) {
        return notSent(`iSmart ${response.status}: ${body.slice(0, 300)}`);
      }

      // An API may answer 200 with an error in the body. Until the docs confirm
      // the format, an optional marker must appear for a send to count.
      const marker = env.ISMART_SUCCESS_TEXT;
      if (marker && !body.includes(marker)) {
        return notSent(`iSmart refused: ${body.slice(0, 300)}`);
      }

      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        return sent(parsed[idField] ? String(parsed[idField]) : null);
      } catch {
        return sent(null);
      }
    },
  };
}
