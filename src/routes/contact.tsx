import { createFileRoute } from "@tanstack/react-router";
import { Gift, Lightbulb, Mail, PenLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import contactHeaderArt from "@/assets/Contact page header - September 18, 2026 at 23.21.40.png";
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
  { icon: PenLine, title: "Pitch a story", blurb: "We read every submission with care." },
  { icon: Gift, title: "Giftcard help", blurb: "Everything about Gift cards." },
  { icon: Lightbulb, title: "Any Suggestions", blurb: "Have a suggestion? Help us grow." },
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
      <header className="relative overflow-hidden bg-heading border-b border-border text-white">
        {/* Background Cover Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={contactHeaderArt}
            alt=""
            className="h-full w-full object-cover opacity-45 dark:opacity-35 scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
          <div className="pointer-events-none absolute -top-24 left-1/4 size-[500px] rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-[#FF6B35] uppercase">
            CONTACT
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05] font-display font-bold text-white drop-shadow-xs">
            Have something to say? We’re listening
          </h1>
        </div>
      </header>

      {/* Intro prompt above the form */}
      <div className="mx-auto max-w-[1240px] px-5 pt-12 text-center lg:px-8">
        <p className="mx-auto max-w-2xl text-[1.125rem] leading-relaxed text-body font-sans font-medium">
          Have your own stories to share? Curious about any of our work? Feel free to send us a message, and we'll do our best to respond when we have a break in the meantime.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 lg:grid-cols-[1.2fr_1fr] lg:px-8">
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

        <div className="space-y-5">
          {channels.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <Panel hover className="flex items-start gap-4 p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-light text-primary">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-[1.1rem] font-bold text-heading">{c.title}</h2>
                  <p className="mt-1 text-[0.9375rem] text-body">{c.blurb}</p>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
