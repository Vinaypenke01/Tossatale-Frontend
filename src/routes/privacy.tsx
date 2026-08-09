import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/tossa/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — tossatale" },
      {
        name: "description",
        content:
          "How tossatale handles reader data: what we collect, what we never sell, and how to delete everything in one click.",
      },
      { property: "og:title", content: "Privacy policy — tossatale" },
      { property: "og:description", content: "How tossatale handles reader data." },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "What we collect",
    body: "Your email address, the stories you read, and the bookmarks and collections you create. That's the whole list. We do not buy data about you from anyone else.",
  },
  {
    title: "What we never do",
    body: "We do not sell reader data, we do not run third-party ad trackers, and we do not share your reading history with writers at an individual level. Writers see counts, never names.",
  },
  {
    title: "Cookies",
    body: "Two cookies: one keeps you signed in, one remembers your reading position. Analytics are aggregated and stored without personal identifiers.",
  },
  {
    title: "Deleting your account",
    body: "Account settings → Security → Delete account. Everything is erased within 30 days, including reading history and payment records we are not legally required to keep.",
  },
  {
    title: "Contacting us",
    body: "Write to privacy@tossatale.com. A person reads it, usually within two working days.",
  },
];

function PrivacyPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[760px] px-5 py-20">
        <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
          Legal
        </p>
        <h1 className="mt-3 text-[clamp(2.1rem,4.4vw,3.1rem)] leading-tight">Privacy policy</h1>
        <p className="mt-4 text-[0.9375rem] text-subtle">Last updated 1 July 2026</p>
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-[1.4rem]">{s.title}</h2>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-body">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
