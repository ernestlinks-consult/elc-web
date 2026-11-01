import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import { retryDelayMinutes } from "@/lib/notify/backoff";
import {
  selectEmailProvider,
  selectSmsProvider,
} from "@/lib/notify/providers";
import { ismartSms } from "@/lib/notify/providers/ismart";

const ismartEnv = {
  SMS_PROVIDER: "ismart",
  ISMART_API_URL: "https://sms.example.test/send",
  ISMART_API_KEY: "key-1",
  ISMART_SENDER_ID: "ELC",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("provider selection", () => {
  test.each([
    ["log", {}],
    ["ismart", ismartEnv],
  ])("SMS_PROVIDER=%s", (name, env) => {
    expect(selectSmsProvider({ ...env, SMS_PROVIDER: name }).name).toBe(name);
  });

  test.each([
    ["log", {}],
    ["inbucket", { INBUCKET_URL: "http://mail.test" }],
    ["resend", { RESEND_API_KEY: "re_test", EMAIL_FROM: "ELC <a@example.test>" }],
  ])("EMAIL_PROVIDER=%s", (name, env) => {
    expect(selectEmailProvider({ ...env, EMAIL_PROVIDER: name }).name).toBe(name);
  });

  test("an unset provider is an error, never a silent log", () => {
    expect(() => selectSmsProvider({})).toThrow("SMS_PROVIDER");
    expect(() => selectEmailProvider({})).toThrow("EMAIL_PROVIDER");
  });

  test("an unknown provider is an error", () => {
    expect(() => selectSmsProvider({ SMS_PROVIDER: "twilio" })).toThrow("twilio");
  });

  test.each(["ISMART_API_URL", "ISMART_API_KEY", "ISMART_SENDER_ID"])(
    "ismart needs %s",
    (key) => {
      expect(() => ismartSms({ ...ismartEnv, [key]: undefined })).toThrow(key);
    },
  );

  test("resend needs a key and sender", () => {
    expect(() =>
      selectEmailProvider({ EMAIL_PROVIDER: "resend", EMAIL_FROM: "a@b.test" }),
    ).toThrow("RESEND_API_KEY");
    expect(() =>
      selectEmailProvider({ EMAIL_PROVIDER: "resend", RESEND_API_KEY: "re_test" }),
    ).toThrow("EMAIL_FROM");
  });
});

describe("ismart adapter", () => {
  function stubResponse(body: string, status = 200) {
    const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  test("reads the endpoint and field names from config", async () => {
    const fetchMock = stubResponse('{"id":"abc"}');

    const result = await ismartSms({
      ...ismartEnv,
      ISMART_PARAM_KEY: "apikey",
      ISMART_PARAM_TO: "recipient",
      ISMART_PARAM_TEXT: "body",
      ISMART_PARAM_SENDER: "from",
    }).send({ to: "+233240000000", text: "Hi" });

    const [url, init] = fetchMock.mock.calls[0];
    const sentFields = new URLSearchParams(init.body);
    expect(url).toBe("https://sms.example.test/send");
    expect(Object.fromEntries(sentFields)).toEqual({
      apikey: "key-1",
      recipient: "233240000000",
      body: "Hi",
      from: "ELC",
    });
    expect(result).toEqual({ ok: true, providerId: "abc", error: null });
  });

  test("can send JSON and keep the +", async () => {
    const fetchMock = stubResponse("OK");

    await ismartSms({
      ...ismartEnv,
      ISMART_BODY_FORMAT: "json",
      ISMART_PHONE_FORMAT: "e164",
    }).send({ to: "+233240000000", text: "Hi" });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      to: "+233240000000",
    });
  });

  test("an HTTP error is a failed send", async () => {
    stubResponse("Bad key", 401);

    expect(
      await ismartSms(ismartEnv).send({ to: "+233240000000", text: "Hi" }),
    ).toEqual({ ok: false, providerId: null, error: "iSmart 401: Bad key" });
  });

  test("a 200 without the success text is a failed send", async () => {
    stubResponse("ERROR: no credit");

    const result = await ismartSms({
      ...ismartEnv,
      ISMART_SUCCESS_TEXT: "SUCCESS",
    }).send({ to: "+233240000000", text: "Hi" });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("no credit");
  });
});

describe("backoff", () => {
  test.each([
    [1, 2],
    [2, 4],
    [3, 8],
    [4, 16],
    [5, 32],
  ])("after %i failed attempts, wait %i minutes", (attempts, minutes) => {
    expect(retryDelayMinutes(attempts)).toBe(minutes);
  });
});

test("providers are only reachable from the worker, never a request handler", () => {
  const files = (dir: string): string[] =>
    readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((file) => /\.tsx?$/.test(file))
      .map((file) => join(dir, file));

  const offenders = [...files("app"), ...files("components"), ...files("lib/leads")]
    .filter((file) => /lib\/notify|from "\.\.?\/.*notify/.test(readFileSync(file, "utf8")));

  expect(offenders).toEqual([]);
});
