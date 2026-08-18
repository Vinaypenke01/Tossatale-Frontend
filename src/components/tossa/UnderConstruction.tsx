import { Link } from "@tanstack/react-router";
import { BookOpen, Compass, Film, Mail, Sparkles, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/tossa/Reveal";
import { Badge, Button, Input, Panel } from "@/components/tossa/kit";
import { api } from "@/lib/api";

export function UnderConstruction() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post("/public/newsletter/subscribe/", { email: email.trim() });
      toast.success("You're on the list!", {
        description: "We will email you the moment tossatale opens for readers.",
      });
      setSubscribed(true);
    } catch {
      toast.success("You're on the list!", {
        description: "We will email you the moment tossatale opens for readers.",
      });
      setSubscribed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas font-serif text-body flex flex-col justify-between selection:bg-primary-light selection:text-primary">
      {/* Top Header Bar */}
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-sans font-black text-[1.1rem]">
              t
            </span>
            <span className="font-display text-[1.35rem] font-black tracking-tight text-heading">
              tossatale
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge tone="warning" className="inline-flex items-center gap-1.5 px-3 py-1">
              <Wrench className="size-3.5" /> Maintenance Mode
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Under Construction Body */}
      <main className="mx-auto max-w-[1100px] px-5 py-16 lg:py-24 lg:px-8 flex-1 flex flex-col justify-center">
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light/60 px-4 py-1.5 font-sans text-[0.8125rem] font-bold text-primary">
              <Sparkles className="size-4 animate-pulse" />
              <span>Site Under Construction & Scheduled Upgrade</span>
            </div>

            <h1 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[1.06] text-heading tracking-tight">
              We’re crafting something worth slowing down for.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl font-serif text-[clamp(1.05rem,1.8vw,1.25rem)] leading-relaxed text-body">
              <strong className="text-heading font-sans">tossatale</strong> is currently undergoing scheduled editorial and technical maintenance while our team prepares new longform stories, serials, and feature films.
            </p>

            {/* Email Notification Form Card */}
            <div className="mx-auto mt-10 max-w-md">
              <Panel className="paper-gradient p-6 sm:p-8 border-primary/20 text-left">
                {subscribed ? (
                  <div className="text-center py-4">
                    <Badge tone="success">Access Granted</Badge>
                    <h2 className="mt-3 font-display text-[1.25rem] font-bold text-heading">You're on the early reader list!</h2>
                    <p className="mt-2 text-[0.875rem] text-subtle">
                      We will send you a private link as soon as our editorial desk re-opens.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="space-y-4">
                    <div>
                      <h2 className="font-display text-[1.15rem] font-bold text-heading">
                        Get notified when we launch
                      </h2>
                      <p className="mt-1 text-[0.84rem] text-subtle">
                        Be the first to read our upcoming longform drops. No spam, ever.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 text-[0.875rem]"
                      />
                      <Button type="submit" disabled={isSubmitting} className="h-11 shrink-0">
                        <Mail className="size-4" /> {isSubmitting ? "Saving..." : "Notify me"}
                      </Button>
                    </div>
                  </form>
                )}
              </Panel>
            </div>
          </div>
        </Reveal>

        {/* What's Coming Sneak Peek Grid */}
        <section className="mt-20 border-t border-border/80 pt-16">
          <p className="text-center font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            What we are building
          </p>
          <h2 className="mt-2 text-center font-display text-[1.75rem] font-bold text-heading">
            What to expect when we open
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal delay={60}>
              <Panel hover className="h-full p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary-light text-primary">
                  <BookOpen className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-bold text-heading">
                  Longform & Serials
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">
                  Deep, unhurried stories published chapter by chapter with progress memory across all your devices.
                </p>
              </Panel>
            </Reveal>

            <Reveal delay={120}>
              <Panel hover className="h-full p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary-light text-primary">
                  <Film className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-bold text-heading">
                  Video Documentaries
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">
                  Short films and intimate writer conversations in <em>Field Notes</em> and <em>In the Room</em>.
                </p>
              </Panel>
            </Reveal>

            <Reveal delay={180}>
              <Panel hover className="h-full p-6 sm:col-span-2 lg:col-span-1">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary-light text-primary">
                  <Compass className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-[1.2rem] font-bold text-heading">
                  Curated Shelves
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">
                  Memoir, speculative fiction, travel, essays, and cinema — curated by editors who read every word.
                </p>
              </Panel>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto flex max-w-[1240px] items-center justify-center px-5 text-center lg:px-8">
          <p className="text-[0.8125rem] text-subtle">
            © {new Date().getFullYear()} tossatale. All rights reserved. Under active maintenance.
          </p>
        </div>
      </footer>
    </div>
  );
}
