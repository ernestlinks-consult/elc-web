"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  Chip,
  ChipGroup,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  EmptyState,
  Field,
  FilterChip,
  Pagination,
  Select,
  Skeleton,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toast,
  ToastProvider,
  type ButtonVariant,
  type ToastTone,
} from "@/components/ui";

const lightVariants: ButtonVariant[] = ["primary", "secondary", "red", "ghost"];

const countries = [
  { value: "uk", label: "United Kingdom" },
  { value: "canada", label: "Canada" },
  { value: "malta", label: "Malta" },
  { value: "dubai", label: "Dubai", disabled: true },
];

const steps = [
  "Start",
  "About you",
  "Contact & address",
  "Education",
  "Family",
  "Guarantors",
  "Review",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-space-4">
      <h2 className="text-h2">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-space-3">{children}</div>;
}

function ToastDemo({
  tone,
  title,
  description,
}: {
  tone: ToastTone;
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Show {tone} toast
      </Button>
      <Toast
        open={open}
        onOpenChange={setOpen}
        tone={tone}
        title={title}
        description={description}
      />
    </>
  );
}

export function ComponentPreview() {
  const [filter, setFilter] = useState("all");

  return (
    <ToastProvider>
      <main className="container flex flex-col gap-space-7 py-space-7">
        <header className="flex flex-col gap-space-2">
          <h1 className="text-h1">Components</h1>
          <p className="text-lead text-ink-muted">
            Every component in components/ui. Development only.
          </p>
          <Link href="/dev/tokens">Design tokens</Link>
        </header>

        <Section title="Button">
          <Row>
            {lightVariants.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant} md
              </Button>
            ))}
          </Row>
          <Row>
            {lightVariants.map((variant) => (
              <Button key={variant} variant={variant} size="lg">
                {variant} lg
              </Button>
            ))}
          </Row>
          <div className="rounded-lg bg-blue p-space-4">
            <Row>
              <Button variant="on-blue">On blue</Button>
              <Button variant="outline-on-blue">Outline on blue</Button>
            </Row>
          </div>
          <Row>
            <Button href="/dev/tokens">Link button</Button>
            <Button leadingIcon="←">Leading icon</Button>
            <Button trailingIcon="→">Trailing icon</Button>
            <Button loading loadingText="Saving…">
              Save
            </Button>
          </Row>
          <Row>
            <Button disabled>Publish</Button>
            <span className="text-body-sm text-ink-muted">Tick both checks</span>
            <Button href="/dev/tokens" disabled>
              Disabled link
            </Button>
          </Row>
          <Button block>Block button</Button>
        </Section>

        <Section title="Badge">
          <Row>
            <Badge tone="red">Live</Badge>
            <Badge tone="new">New</Badge>
            <Badge tone="success">Open</Badge>
            <Badge tone="warning">Opening soon</Badge>
            <Badge tone="neutral">Closed</Badge>
            <Badge tone="blue">Bridging</Badge>
            <Badge tone="solid">Fastest</Badge>
          </Row>
        </Section>

        <Section title="Field">
          <div className="grid max-w-130 gap-space-4">
            <Field
              label="WhatsApp number"
              type="tel"
              required
              placeholder="024 000 0000"
              hint="We message you here. No calls unless you ask."
            />
            <Field
              label="Email"
              type="email"
              optional
              defaultValue="ama@"
              error="Enter a full email address, like ama@gmail.com."
            />
            <Field label="Message" multiline optional />
            <Field
              label="Message with an error"
              multiline
              error="Tell us a little more so we can help."
            />
            <Field label="Disabled field" defaultValue="Kumasi" disabled />
          </div>
        </Section>

        <Section title="Chip">
          <Row>
            <Chip name="package" label="Standard · GH¢600" defaultChecked />
            <Chip name="package" label="Express · GH¢1,800" />
            <Chip multiple label="UK" defaultChecked />
            <Chip multiple label="Malta" />
            <Chip multiple label="Unavailable" disabled />
            <Chip multiple label="Locked in" disabled defaultChecked />
          </Row>
          <Row>
            {["all", "open", "closed"].map((option) => (
              <FilterChip
                key={option}
                pressed={filter === option}
                onClick={() => setFilter(option)}
              >
                {option}
              </FilterChip>
            ))}
            <FilterChip pressed={false} disabled>
              disabled
            </FilterChip>
          </Row>
          <div className="grid max-w-130 gap-space-5">
            <ChipGroup
              legend="Which package?"
              required
              defaultValue="standard"
              hint="You can change this later."
              options={[
                { value: "standard", label: "Standard" },
                { value: "express", label: "Express" },
              ]}
            />
            <ChipGroup
              legend="Which countries?"
              multiple
              optional
              defaultValue={["uk", "canada"]}
              options={countries}
            />
            <ChipGroup
              legend="Best time to reach you"
              required
              error="Choose a time so we know when to message you."
              options={[
                { value: "morning", label: "Morning" },
                { value: "afternoon", label: "Afternoon" },
              ]}
            />
            <ChipGroup
              legend="Disabled group"
              disabled
              defaultValue="one"
              options={[
                { value: "one", label: "One" },
                { value: "two", label: "Two" },
              ]}
            />
          </div>
        </Section>

        <Section title="Card">
          <div className="flex flex-wrap gap-space-4">
            <Card
              href="/dev/tokens"
              eyebrow="Malta · BSc"
              title="Health & Social Care"
              action={'WhatsApp "MALTA CARE"'}
            >
              Tuition paid to the school.
            </Card>
            <Card
              href="/dev/tokens"
              tone="tint"
              title="Passports & birth certificates"
              action="From GH¢600 →"
            >
              New, renewal and express passports.
            </Card>
            <Card
              href="/dev/tokens"
              tone="blue"
              eyebrow="Next stage"
              title="Got an offer? Start your visa application"
              action="Visa help →"
            />
            <Card title="Card without a link" eyebrow="Static">
              Same look, not clickable.
            </Card>
          </div>
        </Section>

        <Section title="Stepper">
          <Stepper
            title="Passport"
            note="About 8 minutes in total"
            steps={steps}
            current={2}
          />
        </Section>

        <Section title="Select">
          <div className="grid max-w-130 gap-space-4">
            <Select
              label="Country"
              placeholder="Choose a country"
              hint="Pick the one you most want to study in."
              options={countries}
            />
            <Select
              label="Country with a value"
              optional
              defaultValue="malta"
              options={countries}
            />
            <Select
              label="Country with an error"
              required
              placeholder="Choose a country"
              error="Choose a country to continue."
              options={countries}
            />
            <Select
              label="Disabled select"
              disabled
              placeholder="Not available"
              options={countries}
            />
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="passport">
            <TabsList aria-label="Services">
              <TabsTrigger value="passport">Passport</TabsTrigger>
              <TabsTrigger value="visa">Visa</TabsTrigger>
              <TabsTrigger value="travel" disabled>
                Travel
              </TabsTrigger>
            </TabsList>
            <TabsContent value="passport">Passport details.</TabsContent>
            <TabsContent value="visa">Visa details.</TabsContent>
            <TabsContent value="travel">Travel details.</TabsContent>
          </Tabs>
        </Section>

        <Section title="Accordion">
          <Accordion type="single" collapsible defaultValue="first">
            <AccordionItem value="first">
              <AccordionTrigger>How long does a passport take?</AccordionTrigger>
              <AccordionContent>
                Standard takes about one month.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="second">
              <AccordionTrigger>Can I start online?</AccordionTrigger>
              <AccordionContent>Yes. No call needed.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="third" disabled>
              <AccordionTrigger>Disabled question</AccordionTrigger>
              <AccordionContent>Not available.</AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="multiple" headingLevel={2}>
            <AccordionItem value="level">
              <AccordionTrigger>Multiple, with headingLevel 2</AccordionTrigger>
              <AccordionContent>Triggers render as h2 here.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="Dialog">
          <Row>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Open dialog</Button>
              </DialogTrigger>
              <DialogContent
                title="Finish later?"
                description="We have your details and will message you."
              >
                <Row>
                  <DialogClose asChild>
                    <Button>Keep going</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="ghost">Finish later</Button>
                  </DialogClose>
                </Row>
              </DialogContent>
            </Dialog>
          </Row>
        </Section>

        <Section title="Toast">
          <Row>
            <ToastDemo
              tone="neutral"
              title="Link copied"
              description="Paste it into WhatsApp."
            />
            <ToastDemo
              tone="success"
              title="Saved"
              description="We have your details."
            />
            <ToastDemo
              tone="error"
              title="Couldn't save"
              description="Check your connection and try again."
            />
          </Row>
        </Section>

        <Section title="Table">
          <div className="max-w-80 rounded-lg border border-line p-space-4">
            <Table caption="Recent leads">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Service</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Received</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Sample lead one</TableCell>
                  <TableCell>Passport</TableCell>
                  <TableCell>
                    <Badge tone="new">New</Badge>
                  </TableCell>
                  <TableCell>31 Oct 2026</TableCell>
                </TableRow>
                <TableRow selected>
                  <TableCell>Sample lead two (selected)</TableCell>
                  <TableCell>Visa</TableCell>
                  <TableCell>
                    <Badge tone="warning">In review</Badge>
                  </TableCell>
                  <TableCell>30 Oct 2026</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Section>

        <Section title="Pagination">
          <Pagination
            page={1}
            totalPages={3}
            hrefForPage={(page) => `?page=${page}`}
            aria-label="Pagination, first page"
          />
          <Pagination
            page={5}
            totalPages={12}
            hrefForPage={(page) => `?page=${page}`}
            aria-label="Pagination, middle page"
          />
          <Pagination
            page={12}
            totalPages={12}
            hrefForPage={(page) => `?page=${page}`}
            aria-label="Pagination, last page"
          />
        </Section>

        <Section title="EmptyState">
          <EmptyState
            message="No open scholarships right now. Get alerts on WhatsApp."
            action={<Button href="/dev/tokens">Get alerts</Button>}
          />
        </Section>

        <Section title="Skeleton">
          <div className="flex max-w-80 flex-col gap-space-3">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-space-5 w-3/4" />
            <Skeleton className="h-space-4" />
          </div>
        </Section>
      </main>
    </ToastProvider>
  );
}
