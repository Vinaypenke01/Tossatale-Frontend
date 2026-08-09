import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/tossa/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & conditions — tossatale" },
      {
        name: "description",
        content:
          "The terms of using tossatale: reader accounts, writer rights and ownership, memberships and acceptable use.",
      },
      { property: "og:title", content: "Terms & conditions — tossatale" },
      { property: "og:description", content: "The terms of using tossatale." },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "Your account",
    body: "One account per person. Keep your password to yourself. You can close the account whenever you like, and nothing you wrote becomes ours by default.",
  },
  {
    title: "Who owns the writing",
    body: "Writers do. Publishing on tossatale grants us a non-exclusive licence to display and promote the work. Writers may republish elsewhere after 30 days and may withdraw a piece at any time.",
  },
  {
    title: "Memberships and payment",
    body: "Memberships renew monthly or yearly until cancelled. Cancel any time and keep access until the period ends. 70% of member revenue is distributed to writers by read-time.",
  },
  {
    title: "Acceptable use",
    body: "No harassment, no plagiarism, no scraping, no AI-generated submissions passed off as your own writing. Editors remove work that breaks these rules and explain why.",
  },
  {
    title: "Changes",
    body: "We'll email you at least 14 days before any material change to these terms takes effect.",
  },
];

function TermsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[760px] px-5 py-20">
        <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
          Legal
        </p>
        <h1 className="mt-3 text-[clamp(2.1rem,4.4vw,3.1rem)] leading-tight">Terms & conditions</h1>
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
