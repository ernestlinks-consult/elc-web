import { describe, expect, test } from "vitest";
import {
  renderMessageReceived,
  renderOwnerNewLead,
  renderOwnerSmsFailed,
  type OwnerNewLeadData,
} from "@/lib/notify/templates/email";
import { isGsm7, renderLeadAck, smsLimit } from "@/lib/notify/templates/sms";

const ack = { firstName: "Ama", ref: "ELC-PP-1042", ownerFirstName: "Grace" };

describe("sms.lead_ack", () => {
  test("uses the approved wording", () => {
    expect(renderLeadAck({ ...ack, replyPromise: "within 2 working hours" })).toBe(
      "Hi Ama, thanks for contacting ErnestLinks Consult. Ref ELC-PP-1042. Grace will message you on WhatsApp within 2 working hours.",
    );
  });

  test.each([
    ["missing", undefined],
    ["null", null],
    ["empty", ""],
    ["a placeholder", "[PLACEHOLDER: reply-time promise, waiting on ELC]"],
  ])("ends with soon when the promise is %s", (_label, replyPromise) => {
    expect(renderLeadAck({ ...ack, replyPromise })).toBe(
      "Hi Ama, thanks for contacting ErnestLinks Consult. Ref ELC-PP-1042. Grace will message you on WhatsApp soon.",
    );
  });

  test.each([undefined, null, ""])("uses Our team when the owner is %j", (owner) => {
    expect(renderLeadAck({ ...ack, ownerFirstName: owner })).toContain(
      "Our team will message you",
    );
  });

  test("does not double a full stop from the promise", () => {
    expect(renderLeadAck({ ...ack, replyPromise: "today." })).toMatch(/today\.$/);
    expect(renderLeadAck({ ...ack, replyPromise: "today." })).not.toMatch(/\.\.$/);
  });

  const hardCases = [
    { firstName: "A".repeat(200), replyPromise: "within 2 working hours" },
    { firstName: "Nana", replyPromise: "x".repeat(200) },
    { firstName: "Nana", ownerFirstName: "O".repeat(200) },
    { firstName: "A".repeat(200), ownerFirstName: "O".repeat(200), replyPromise: "x".repeat(200) },
    { firstName: "Ɛfua", replyPromise: "within 2 working hours" },
    { firstName: "Ọlá", replyPromise: "within 2 working hours" },
    { firstName: "Ama’s", ownerFirstName: "Kɔfi" },
    { firstName: "🙂", replyPromise: "soon 🙂" },
    { firstName: null },
    { firstName: "" },
  ];

  test.each(hardCases)("always fits one GSM-7 segment: %j", (data) => {
    const text = renderLeadAck({ ...ack, ...data });

    expect(text.length).toBeLessThanOrEqual(smsLimit);
    expect(isGsm7(text)).toBe(true);
  });

  test("the longest real reference and a normal name still fit", () => {
    const text = renderLeadAck({
      firstName: "Oheneyere",
      ref: "ELC-PP-1000000",
      ownerFirstName: "Nathaniel",
      replyPromise: "within 2 working hours",
    });

    expect(text.length).toBeLessThanOrEqual(smsLimit);
    expect(text).toContain("Hi Oheneyere,");
    expect(text).toContain("within 2 working hours");
  });

  test("an unusable name is left out rather than garbled", () => {
    expect(renderLeadAck({ ...ack, firstName: "🙂" })).toMatch(/^Hi, thanks/);
    expect(renderLeadAck({ ...ack, firstName: null })).toMatch(/^Hi, thanks/);
  });

  test("accents are simplified, not dropped", () => {
    expect(renderLeadAck({ ...ack, firstName: "Akosúa" })).toContain("Hi Akosua,");
  });
});

const lead: OwnerNewLeadData = {
  id: "11111111-1111-4111-8111-111111111111",
  ref: "ELC-PP-1042",
  serviceName: "Passports & birth certificates",
  fullName: "Ama Mensah",
  whatsapp: "+233240000000",
  bestTime: "Morning",
  ownerFirstName: "Grace",
  answers: {
    full_name: "Ama Mensah",
    whatsapp: "+233240000000",
    best_time: "Morning",
    consent: true,
    package: "Standard",
    application_type: "New passport",
    needs: ["Flight", "Hotel"],
  },
  attribution: { sourcePage: "/services/passports", utmSource: "tiktok" },
  siteUrl: "https://ernestlinksconsult.com",
};

describe("email.owner_new_lead", () => {
  const email = renderOwnerNewLead(lead);

  test("has the approved subject", () => {
    expect(email.subject).toBe(
      "New Passports & birth certificates lead: Ama Mensah (ELC-PP-1042)",
    );
  });

  test.each(["html", "text"] as const)("%s has what the owner needs", (part) => {
    expect(email[part]).toContain("ELC-PP-1042");
    expect(email[part]).toContain("Ama Mensah");
    expect(email[part]).toContain("+233240000000");
    expect(email[part]).toContain("Application type");
    expect(email[part]).toContain("New passport");
    expect(email[part]).toContain("Flight, Hotel");
    expect(email[part]).toContain("/services/passports");
    expect(email[part]).toContain("tiktok");
    expect(email[part]).toContain(
      "https://ernestlinksconsult.com/portal/leads/11111111-1111-4111-8111-111111111111",
    );
    expect(email[part]).toContain("https://wa.me/233240000000?text=");
  });

  test("prefills the WhatsApp message", () => {
    expect(decodeURIComponent(email.text)).toContain(
      "Hi Ama, this is Grace from ErnestLinks Consult, about your request ELC-PP-1042.",
    );
  });

  test("leaves out consent, and does not repeat the name as an answer", () => {
    expect(email.text).not.toContain("Consent");
    expect(email.text).not.toContain("Full name");
  });

  test("uses ELC blue, a lang, a title and table header cells", () => {
    expect(email.html).toContain("#0505C6");
    expect(email.html).toContain('<html lang="en">');
    expect(email.html).toContain("<title>");
    expect(email.html).toContain('scope="row"');
  });

  test("never includes a banned field, even if one reaches the answers", () => {
    const banned = renderOwnerNewLead({
      ...lead,
      answers: {
        ghana_card: "GHA-000000000-1",
        ghanaCardNumber: "GHA-000000000-2",
        ssnit: "C000000000001",
        voter_id: "1234567890",
        id_number: "ID-3",
        passport_number: "G0000000",
        upload_url: "https://example.test/scan.pdf",
        payment_ref: "PAY-1",
        momo_number: "0240000001",
        card_number: "4242424242424242",
        facilitator_name: "Some Agent",
      },
    });

    for (const part of [banned.html, banned.text]) {
      expect(part).not.toMatch(
        /GHA-|C0000|1234567890|ID-3|G0000000|scan\.pdf|PAY-1|0240000001|4242|Some Agent/,
      );
    }
  });

  test("escapes visitor text in the HTML", () => {
    const hostile = renderOwnerNewLead({
      ...lead,
      fullName: '<script>alert("x")</script>',
      answers: { notes: "<img src=x onerror=alert(1)>" },
    });

    expect(hostile.html).not.toContain("<script>");
    expect(hostile.html).not.toContain("<img");
    expect(hostile.html).toContain("&lt;script&gt;");
  });

  test("works with no owner and no attribution", () => {
    const plain = renderOwnerNewLead({
      ...lead,
      ownerFirstName: null,
      attribution: {},
    });

    expect(decodeURIComponent(plain.text)).toContain(
      "Hi Ama, this is ErnestLinks Consult, about your request",
    );
    expect(plain.text).not.toContain("Where they came from");
  });

  test.each(["html", "text"] as const)("%s mentions an SMS problem", (part) => {
    const flagged = renderOwnerNewLead({
      ...lead,
      smsProblem: "Their acknowledgement SMS has not gone through yet.",
    });

    expect(flagged[part]).toContain("has not gone through yet");
    expect(email[part]).not.toContain("has not gone through");
  });
});

test("email.owner_sms_failed tells the owner to message directly", () => {
  const email = renderOwnerSmsFailed({
    id: "1",
    ref: "ELC-PP-1042",
    fullName: "Ama Mensah",
    whatsapp: "+233240000000",
    siteUrl: "https://ernestlinksconsult.com",
  });

  expect(email.subject).toBe("SMS failed for Ama Mensah (ELC-PP-1042)");
  expect(email.text).toContain("Please message them directly.");
  expect(email.html).toContain("https://wa.me/233240000000");
});

describe("email.message_received", () => {
  const data = {
    fullName: "Esi Owusu",
    whatsapp: "+233240000000",
    email: "esi@example.test",
    topic: "Partnership",
    body: "Hello <b>team</b>",
  };

  test("has the sender, topic and message", () => {
    const email = renderMessageReceived(data);

    expect(email.subject).toBe("New message: Partnership from Esi Owusu");
    for (const part of [email.html, email.text]) {
      expect(part).toContain("Esi Owusu");
      expect(part).toContain("esi@example.test");
      expect(part).toContain("https://wa.me/233240000000");
    }
    expect(email.text).toContain("Hello <b>team</b>");
  });

  test("escapes the message in the HTML", () => {
    expect(renderMessageReceived(data).html).toContain("Hello &lt;b&gt;team&lt;/b&gt;");
  });

  test("leaves out a missing email", () => {
    expect(renderMessageReceived({ ...data, email: null }).text).not.toContain(
      "Email:",
    );
  });
});
