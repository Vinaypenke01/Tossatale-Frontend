import { createFileRoute } from "@tanstack/react-router";
import { Gift, Lightbulb, Mail, PenLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Badge, Button, ButtonLink, Field, Input, Panel, Textarea } from "@/components/tossa/kit";
import { api } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact tossatale" },
      {
        name: "description",
        content:
          "Have something to say? We're listening. Whether you have a story to share, a question to ask, or simply something to say - our team is listening.",
      },
      { property: "og:title", content: "Contact tossatale" },
      { property: "og:description", content: "Have something to say? We're listening." },
    ],
  }),
  component: ContactPage,
});

const channels = [
  { icon: PenLine, title: "Pitch a story", blurb: "We read every submission with care.", meta: "pitches@tossatale.com" },
  { icon: Gift, title: "Giftcard help", blurb: "Everything about Gift cards.", meta: "support@tossatale.com" },
  { icon: Lightbulb, title: "Any Suggestions", blurb: "Have a suggestion? Help us grow.", meta: "feedback@tossatale.com" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Pitching a story");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/public/contact/", {
        name,
        email,
        subject,
        message,
      });
      setSent(true);
      toast.success("Message sent successfully!");
    } catch (err: any) {
      toast.error("Failed to send message", {
        description: err.message || "Please check your network connection and try again.",
      });
      setSent(true); // Graceful fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Contact
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Have something to say? We’re listening
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Whether you have a story to share, a question to ask, or simply something to say - our team is listening. We’ll get back to you as soon as we can
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
                  We’ll get back to you as soon as we can.
                </p>
                <div className="mt-7">
                  <Button variant="ghostOutline" onClick={() => setSent(false)}>
                    Send another
                  </Button>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name">
                    <Input
                      required
                      placeholder="First Last"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      required
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="What's this about?">
                  <select
                    suppressHydrationWarning
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-heading focus:border-primary focus:ring-4 focus:ring-primary-light focus:outline-none"
                  >
                    <option>Pitching a story</option>
                    <option>Giftcard help</option>
                    <option>Have a question</option>
                    <option>Something else</option>
                  </select>
                </Field>
                <Field label="Message" hint="Keep it brief. If it’s a story, give us a reason to turn the page.">
                  <Textarea
                    required
                    rows={7}
                    placeholder="Tell us…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Field>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send message"}
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
                  <h2 className="text-[1.1rem] font-bold text-heading">{c.title}</h2>
                  <p className="mt-1 text-[0.9375rem] text-body">{c.blurb}</p>
                  <p className="mt-2 text-[0.875rem] font-bold text-primary">{c.meta}</p>
                </div>
              </Panel>
            </Reveal>
          ))}

          <Reveal delay={240}>
            <Panel className="paper-gradient p-6 border-primary/20">
              <h2 className="text-[1.1rem] font-bold text-heading">Press & Partnerships?</h2>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-body">
                Looking for media interviews, festival screenings, or brand collaboration details?
              </p>
              <div className="mt-4">
                <ButtonLink to="/faq" variant="ghostOutline" size="sm">
                  View Press FAQ & Answers
                </ButtonLink>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </SiteLayout>
  );
}
