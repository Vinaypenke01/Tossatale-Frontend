import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, PenLine } from "lucide-react";
import { useState } from "react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Badge, Button, Field, Input, Panel, Textarea } from "@/components/tossa/kit";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact tossatale" },
      {
        name: "description",
        content:
          "Pitch a story, ask about membership or reach the tossatale editors. We reply to everything within two working days.",
      },
      { property: "og:title", content: "Contact tossatale" },
      { property: "og:description", content: "Pitch a story or reach the tossatale editors." },
    ],
  }),
  component: ContactPage,
});

const channels = [
  { icon: PenLine, title: "Pitch a story", blurb: "Submissions read every Tuesday.", meta: "pitches@tossatale.com" },
  { icon: Mail, title: "Membership help", blurb: "Billing, access, gift memberships.", meta: "members@tossatale.com" },
  { icon: MessageCircle, title: "Press & partnerships", blurb: "Interviews, licensing, events.", meta: "press@tossatale.com" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Contact
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Write to us. We write back.
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Four editors read this inbox. Expect a reply within two working days — sooner if it's a
            pitch we can't put down.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <Reveal>
          <Panel className="p-8 lg:p-10">
            {sent ? (
              <div className="py-10 text-center">
                <Badge tone="success">Message sent</Badge>
                <h2 className="mt-5 text-[1.6rem]">Thank you — it's in the right inbox.</h2>
                <p className="mt-3 text-[1rem] text-body">
                  You'll hear from an editor within two working days.
                </p>
                <div className="mt-7">
                  <Button variant="ghostOutline" onClick={() => setSent(false)}>
                    Send another
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name">
                    <Input required placeholder="Meera Raghavan" />
                  </Field>
                  <Field label="Email">
                    <Input required type="email" placeholder="you@example.com" />
                  </Field>
                </div>
                <Field label="What's this about?">
                  <select className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-heading focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none">
                    <option>Pitching a story</option>
                    <option>Membership question</option>
                    <option>Press or partnership</option>
                    <option>Something else</option>
                  </select>
                </Field>
                <Field label="Message" hint="A paragraph is plenty. If it's a pitch, tell us the ending.">
                  <Textarea required rows={7} placeholder="Tell us…" />
                </Field>
                <Button type="submit" size="lg">
                  Send message
                </Button>
              </form>
            )}
          </Panel>
        </Reveal>

        <div className="space-y-6">
          {channels.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <Panel hover className="flex items-start gap-4 p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-light text-primary">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-[1.1rem]">{c.title}</h2>
                  <p className="mt-1 text-[0.9375rem] text-body">{c.blurb}</p>
                  <p className="mt-2 text-[0.875rem] font-bold text-primary">{c.meta}</p>
                </div>
              </Panel>
            </Reveal>
          ))}
          <Panel className="paper-gradient p-6">
            <h2 className="text-[1.1rem]">The studio</h2>
            <p className="mt-2 text-[0.9375rem] text-body">
              2nd floor, Ganga House
              <br />
              Bhelupur, Varanasi 221010
              <br />
              India
            </p>
            <p className="mt-3 text-[0.875rem] text-subtle">Mon–Fri, 10:00–18:00 IST</p>
          </Panel>
        </div>
      </div>
    </SiteLayout>
  );
}
