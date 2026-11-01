import { describe, expect, test } from "vitest";
import { decideAccess, safeNext } from "@/lib/auth/access";
import { csvCell, csvRow } from "@/lib/csv";
import { splitVersions } from "@/lib/portal/answers";
import {
  filterParams,
  parseLeadFilters,
  searchFilter,
} from "@/lib/portal/filters";
import { greeting, relativeTime, startOfToday } from "@/lib/portal/time";

describe("CSV", () => {
  test.each([
    ["plain", "plain"],
    ["with,comma", '"with,comma"'],
    ['say "hi"', '"say ""hi"""'],
    ["two\nlines", '"two\nlines"'],
    ["", ""],
    [null, ""],
    [undefined, ""],
    [0, "0"],
    [false, "false"],
  ])("%j", (value, expected) => {
    expect(csvCell(value)).toBe(expected);
  });

  test.each([
    ["=HYPERLINK(1)", "'=HYPERLINK(1)"],
    ["+233240000000", "'+233240000000"],
    ["-1+1", "'-1+1"],
    ["@SUM(A1)", "'@SUM(A1)"],
    ["\tinjected", "'\tinjected"],
  ])("defuses the formula %j", (value, expected) => {
    expect(csvCell(value)).toBe(expected);
  });

  test("a defused formula is still quoted when it needs to be", () => {
    expect(csvCell('=A1,"x"')).toBe(`"'=A1,""x"""`);
  });

  test("a row ends with CRLF", () => {
    expect(csvRow(["a", "b,c"])).toBe('a,"b,c"\r\n');
  });
});

describe("portal access", () => {
  const row = (role: "admin" | "editor" | "front_desk", aal = "aal1", is_active = true) => ({
    full_name: "A",
    role,
    is_active,
    aal,
  });

  test("no staff row means no access", () => {
    expect(decideAccess(null)).toBe("no_access");
  });

  test("disabled beats everything", () => {
    expect(decideAccess(row("admin", "aal2", false))).toBe("disabled");
  });

  test("an admin needs aal2", () => {
    expect(decideAccess(row("admin", "aal1"))).toBe("two_step");
    expect(decideAccess(row("admin", "aal2"))).toBe("ok");
  });

  test("other staff do not", () => {
    expect(decideAccess(row("editor"))).toBe("ok");
    expect(decideAccess(row("front_desk"))).toBe("ok");
  });

  test.each([
    ["/portal/leads", "/portal/leads"],
    ["/portal/leads?status=new", "/portal/leads?status=new"],
    ["/portal", "/portal"],
    ["https://evil.example", "/portal"],
    ["//evil.example", "/portal"],
    ["/portalevil", "/portal"],
    ["/portal//evil.example", "/portal"],
    [null, "/portal"],
  ])("after sign-in, %j goes to %s", (next, expected) => {
    expect(safeNext(next)).toBe(expected);
  });
});

describe("lead filters", () => {
  test("editors default to Mine, others to everyone", () => {
    expect(parseLeadFilters({}, "editor").owner).toBe("mine");
    expect(parseLeadFilters({}, "front_desk").owner).toBe("all");
    expect(parseLeadFilters({}, "admin").owner).toBe("all");
  });

  test("an explicit choice wins over the default", () => {
    expect(parseLeadFilters({ owner: "all" }, "editor").owner).toBe("all");
  });

  test("nonsense falls back", () => {
    expect(
      parseLeadFilters(
        { status: "nope", owner: "1;drop", page: "-2" },
        "admin",
      ),
    ).toMatchObject({ status: "all", owner: "all", page: 1 });
  });

  test("the filters round-trip through the URL and reset the page", () => {
    const filters = parseLeadFilters(
      { status: "new", service: "visa", owner: "mine", q: "Ama", page: "3" },
      "admin",
    );

    expect(filterParams(filters, { status: "paid" }).toString()).toBe(
      "status=paid&service=visa&owner=mine&q=Ama",
    );
  });

  test("search covers name and reference", () => {
    expect(searchFilter("Ama")).toBe('full_name.ilike."*Ama*",ref.ilike."*Ama*"');
  });

  test("a Ghana phone in any format finds the stored number", () => {
    for (const phone of ["024 000 0000", "0240000000", "+233240000000"]) {
      expect(searchFilter(phone)).toContain('whatsapp.ilike."*233240000000*"');
    }
  });

  test("the digits in a reference do not match phone numbers", () => {
    expect(searchFilter("ELC-EX-1256")).not.toContain("whatsapp");
  });

  test("part of a number still searches phones", () => {
    expect(searchFilter("0000")).toContain('whatsapp.ilike."*0000*"');
  });

  test("characters that could break the filter are removed", () => {
    expect(searchFilter('a,b(c)"d*')).toBe(
      'full_name.ilike."*a b c  d*",ref.ilike."*a b c  d*"',
    );
  });

  test("an empty search means no filter", () => {
    expect(searchFilter("  ,() ")).toBeNull();
  });
});

describe("lead answers", () => {
  const step = (step_index: number, version: number, answers: unknown) => ({
    step_index,
    step_key: "start",
    version,
    answers,
  });

  test("uses the form's labels and hides consent", () => {
    const { latest } = splitVersions("passport", [
      step(0, 1, { package: "Standard", consent: true, application_type: "Renewal" }),
    ]);

    expect(latest[0].title).toBe("Start");
    expect(latest[0].rows).toEqual([
      { label: "Package", value: "Standard" },
      { label: "This is a", value: "Renewal" },
    ]);
  });

  test("the newest version shows; older ones go to the history", () => {
    const { latest, earlier } = splitVersions("passport", [
      step(0, 1, { package: "Standard" }),
      step(0, 2, { package: "Express" }),
      step(1, 1, { surname: "Mensah" }),
    ]);

    expect(latest.map((group) => group.rows[0].value)).toEqual(["Express", "Mensah"]);
    expect(earlier).toHaveLength(1);
    expect(earlier[0]).toMatchObject({ version: 1 });
    expect(earlier[0].rows[0].value).toBe("Standard");
  });

  test("lists join, blanks are dropped, and old keys still read well", () => {
    const { latest } = splitVersions("travel", [
      step(0, 1, { needs: ["Flight", "Hotel"], empty: "", none: [], old_field: "x" }),
    ]);

    expect(latest[0].rows).toEqual([
      { label: "I need", value: "Flight, Hotel" },
      { label: "Old field", value: "x" },
    ]);
  });
});

describe("portal times", () => {
  const now = new Date("2026-11-02T12:00:00Z");

  test.each([
    ["2026-11-02T11:59:40Z", "Just now"],
    ["2026-11-02T11:15:00Z", "45 min ago"],
    ["2026-11-02T09:00:00Z", "3 h ago"],
    ["2026-11-01T10:00:00Z", "Yesterday"],
    ["2026-10-28T10:00:00Z", "5 days ago"],
  ])("%s reads %s", (value, expected) => {
    expect(relativeTime(value, now)).toBe(expected);
  });

  test("today starts at midnight in Accra", () => {
    expect(startOfToday(new Date("2026-11-02T23:59:00Z"))).toBe(
      "2026-11-02T00:00:00+00:00",
    );
  });

  test.each([
    ["2026-11-02T08:00:00Z", "Good morning"],
    ["2026-11-02T13:00:00Z", "Good afternoon"],
    ["2026-11-02T19:00:00Z", "Good evening"],
  ])("%s", (value, expected) => {
    expect(greeting(new Date(value))).toBe(expected);
  });
});
