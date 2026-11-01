import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { HomeContent, type HomeData } from "@/components/site/HomeContent";
import { ImageOrPattern } from "@/components/site/ImageOrPattern";
import { embedUrl, VideoEmbed } from "@/components/site/VideoEmbed";
import {
  readinessItems,
  readinessVerdict,
  VisaChecklist,
} from "@/components/site/VisaChecklist";
import { OpeningCard, ProgrammeCard, TripCard } from "@/components/site/parts";

vi.mock("@/app/(site)/actions", () => ({ sendContactMessage: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const price = (key: string, amount: string, timeText: string | null = null) => ({
  key,
  label: key,
  amount,
  timeText,
});

const empty: HomeData = {
  services: [],
  prices: {},
  drives: [],
  testimonials: [],
  posts: [],
  scholarships: [],
  video: null,
  team: [],
  liveNote: "Weekdays, 12–2pm on TikTok LIVE",
  liveUrl: "https://example.test/live",
  hostRotation: "A different host each weekday",
  ceoHours: "CEO consultations Mon & Wed",
  bookingUrl: "https://example.test/book",
  replyPromise: null,
  whatsappHref: "https://wa.me/233537783166?text=HELLO",
  whatsappDisplay: "+233 53 778 3166",
  privacyHref: "/privacy",
};

const heading = (name: string) => screen.queryByRole("heading", { name });

describe("home sections with nothing published", () => {
  test("are hidden entirely", () => {
    render(<HomeContent data={empty} />);

    expect(heading("Your passport, without the queue stress.")).toBeNull();
    expect(heading("Trusted by KNUST colleges and associations.")).toBeNull();
    expect(heading("Learn before you spend.")).toBeNull();
    expect(screen.queryByText("Standard passport")).toBeNull();
    expect(screen.queryByText(/passport drive/)).toBeNull();
  });

  test("the fixed sections still render", () => {
    render(<HomeContent data={empty} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Making opportunities accessible." }),
    ).toBeInTheDocument();
    expect(heading("Send us a message.")).toBeInTheDocument();
  });

  test("no made-up figures appear", () => {
    const { container } = render(<HomeContent data={empty} />);

    expect(container.textContent).not.toMatch(/\d+%|\d+\+/);
  });
});

describe("home sections with content", () => {
  const data: HomeData = {
    ...empty,
    prices: {
      passport_standard: price("passport_standard", "GH¢600", "About 1 month"),
      passport_express: price("passport_express", "GH¢1,800", null),
      consultation_30: price("consultation_30", "GH¢100", "30 minutes"),
    },
    drives: [
      { id: "1", host_name: "KNUST College of Science", drive_date: null, applicants_count: 120, photo_path: null },
    ],
    testimonials: [
      { id: "1", display_name: "Ama K.", service_key: "passport", year: 2026, quote: "It was easy.", photo_path: null },
    ],
  };

  test("the floating card uses the database price", () => {
    render(<HomeContent data={data} />);

    expect(screen.getByText("Standard passport").parentElement).toHaveTextContent(
      "GH¢600",
    );
  });

  test("a drive count comes from the data", () => {
    render(<HomeContent data={data} />);

    expect(screen.getByText("1 passport drive")).toBeInTheDocument();
  });

  test("a null express time shows nothing, not a placeholder", () => {
    render(<HomeContent data={data} />);

    expect(screen.getByRole("heading", { name: "Express" }).parentElement).not.toHaveTextContent(
      "PLACEHOLDER",
    );
  });

  test("a testimonial shows with its name", () => {
    render(<HomeContent data={data} />);

    expect(
      within(screen.getByTestId("testimonials")).getByText("“It was easy.”"),
    ).toBeInTheDocument();
  });

  test("the reply promise joins the trust line only when real", () => {
    render(<HomeContent data={{ ...data, replyPromise: "within 2 working hours" }} />);

    expect(
      screen.getByText("A real person replies within 2 working hours"),
    ).toBeInTheDocument();
  });
});

describe("ImageOrPattern", () => {
  test("shows the brand pattern when there is no photo", () => {
    render(<ImageOrPattern path={null} />);

    expect(screen.getByTestId("brand-pattern")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  test("shows a real image once one exists", () => {
    render(
      <ImageOrPattern
        path="https://example.test/photo.webp"
        alt="ELC team at KNUST"
      />,
    );

    expect(screen.getByRole("img", { name: "ELC team at KNUST" })).toBeInTheDocument();
    expect(screen.queryByTestId("brand-pattern")).toBeNull();
  });
});

describe("VideoEmbed", () => {
  test.each([
    ["youtube", "https://www.youtube.com/watch?v=abc123", "https://www.youtube-nocookie.com/embed/abc123?autoplay=1"],
    ["youtube", "https://youtu.be/abc123", "https://www.youtube-nocookie.com/embed/abc123?autoplay=1"],
    ["tiktok", "https://www.tiktok.com/@elc/video/123456", "https://www.tiktok.com/embed/v2/123456"],
    ["instagram", "https://www.instagram.com/reel/abc/", "https://www.instagram.com/p/abc/embed"],
  ])("%s %s", (platform, url, expected) => {
    expect(embedUrl(platform, url)).toBe(expected);
  });

  test("a profile link has no embed", () => {
    expect(embedUrl("tiktok", "https://www.tiktok.com/@_ernestlinksconsult")).toBeNull();
  });

  const props = {
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=abc123",
    title: "Choosing a programme",
  };

  test("loads no iframe until tapped", async () => {
    const { container } = render(<VideoEmbed {...props} />);
    expect(container.querySelector("iframe")).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Play video: Choosing a programme" }),
    );

    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/abc123?autoplay=1",
    );
  });

  test("always keeps a link to the post as the fallback", () => {
    render(<VideoEmbed {...props} />);

    expect(screen.getByRole("link", { name: "Watch on YouTube →" })).toHaveAttribute(
      "href",
      props.url,
    );
  });

  test("a post it can't embed shows the link and no play button", () => {
    render(<VideoEmbed {...props} url="https://www.youtube.com/@elc" />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("link", { name: "Watch on YouTube →" })).toBeInTheDocument();
  });
});

describe("visa readiness", () => {
  test("has six items", () => {
    expect(readinessItems).toHaveLength(6);
  });

  test("the count follows the ticks", async () => {
    render(<VisaChecklist startHref="/start?service=visa" />);
    const boxes = screen.getAllByRole("checkbox");

    expect(screen.getByTestId("readiness-count")).toHaveTextContent("0 of 6");
    await userEvent.click(boxes[0]);
    await userEvent.click(boxes[1]);
    expect(screen.getByTestId("readiness-count")).toHaveTextContent("2 of 6");
    await userEvent.click(boxes[0]);
    expect(screen.getByTestId("readiness-count")).toHaveTextContent("1 of 6");
  });

  test("the call to action starts a visa form", () => {
    render(<VisaChecklist startHref="/start?service=visa" />);

    expect(screen.getByRole("link", { name: "Start your visa online" })).toHaveAttribute(
      "href",
      "/start?service=visa",
    );
  });

  test.each([
    [0, /Tick what/],
    [2, /good start/],
    [4, /Nearly there/],
    [6, /look ready/],
  ])("%i ticks", (count, message) => {
    expect(readinessVerdict(count)).toMatch(message);
  });

  test("never promises a visa", () => {
    for (let count = 0; count <= 6; count += 1) {
      expect(readinessVerdict(count)).not.toMatch(/guarantee|approved|will get/i);
    }
  });
});

describe("listing cards", () => {
  const whatsappLink = (keyword: string) => `https://wa.me/1?text=${keyword}`;

  test("a programme shows type, city and date, never a school", () => {
    render(
      <ProgrammeCard
        whatsappLink={whatsappLink}
        programme={{
          id: "1", kind: "study", country: "Malta", city: "St Julian’s", level: "MBA",
          title: "MBA", duration_text: "12 months", tuition_text: "Tuition €10,000",
          keyword: "MALTA MBA", correct_as_of: "2026-10-31",
        }}
      />,
    );

    expect(screen.getByText("Malta · St Julian’s · MBA · 12 months")).toBeInTheDocument();
    expect(screen.getByText("Correct as of 31 Oct 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: 'WhatsApp "MALTA MBA"' })).toBeInTheDocument();
  });

  test("an opening hides placeholder requirements and costs", () => {
    const { container } = render(
      <OpeningCard
        whatsappLink={whatsappLink}
        opening={{
          id: "1", country: "UAE", sector: "Hospitality", title: "Hospitality roles",
          requirements: "[PLACEHOLDER: roles]", candidate_costs: "[PLACEHOLDER: costs]",
          keyword: "DUBAI", correct_as_of: "2026-10-31",
        }}
      />,
    );

    expect(container).not.toHaveTextContent("PLACEHOLDER");
    expect(container).not.toHaveTextContent("What you pay");
  });

  test("a trip shows only the details it has", () => {
    const { container } = render(
      <TripCard
        trip={{
          id: "1", title: "Dubai", destination: "UAE", starts_on: null, ends_on: null,
          price_from_ghs: 5000, seats_left: 4, photo_path: null,
        }}
      />,
    );

    expect(container).toHaveTextContent("From GH¢5,000 · 4 seats left");
  });
});
