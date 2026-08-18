import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, HelpCircle, MessageSquare, Search } from "lucide-react";
import { useState } from "react";

import { SiteLayout } from "@/components/tossa/SiteLayout";
import { Reveal } from "@/components/tossa/Reveal";
import { Button, ButtonLink, Input, Panel } from "@/components/tossa/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — tossatale" },
      {
        name: "description",
        content:
          "Find answers about Press & Partnerships, Submissions, Gift Cards, Reading memberships, and how tossatale works.",
      },
      { property: "og:title", content: "Frequently Asked Questions — tossatale" },
      {
        property: "og:description",
        content: "Find answers about Press & Partnerships, Submissions, Gift Cards, and Platform features.",
      },
    ],
  }),
  component: FaqPage,
});

type FaqCategory = "all" | "press" | "giftcards" | "submissions" | "platform";

interface FaqItem {
  question: string;
  answer: string;
  category: FaqCategory;
}

const faqItems: FaqItem[] = [
  {
    category: "press",
    question: "How do Press & Partnerships work at tossatale?",
    answer:
      "We welcome media inquiries, interviews, brand collaborations, and literary event partnerships. For press kits, interview requests with our founders or writers, or film licensing inquiries, please reach out via our contact page or email press@tossatale.com.",
  },
  {
    category: "press",
    question: "Can we feature or syndicate tossatale stories?",
    answer:
      "Yes! Selected stories and short films are available for syndication and film festival distribution. Contact our team to discuss licensing and rights management.",
  },
  {
    category: "giftcards",
    question: "How do Gift Cards work?",
    answer:
      "tossatale Gift Cards allow you to gift annual or lifetime reading passes to friends and family. Once purchased, a unique digital voucher code is emailed to the recipient, which can be redeemed instantly.",
  },
  {
    category: "giftcards",
    question: "How do I redeem a Gift Card code?",
    answer:
      "Log into your tossatale account, navigate to Account Settings > Redeem Voucher, and enter your 16-digit gift card code to unlock your reading membership immediately.",
  },
  {
    category: "submissions",
    question: "How do I submit a story or manuscript pitch?",
    answer:
      "We read every submission with care. You can submit your pitch through our Contact form under 'Pitching a story'. Keep it brief—give us a compelling reason to turn the page!",
  },
  {
    category: "submissions",
    question: "What genres and story formats do you accept?",
    answer:
      "We publish short fiction, serials, personal essays, creative non-fiction, and short film scripts. We look for authentic voices, depth, and stories that move readers.",
  },
  {
    category: "platform",
    question: "What makes tossatale different from other platforms?",
    answer:
      "tossatale is built for people who finish what they start. No clickbait, no infinite doom-scroll, no outrage algorithms. Just curated stories, original short films, and quiet reading spaces.",
  },
  {
    category: "platform",
    question: "Is tossatale free to read?",
    answer:
      "We offer a generous selection of free original stories, blogs, and short films for everyone. Readers can also support writers through membership passes to unlock full archive access.",
  },
];

function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SiteLayout>
      <header className="border-b border-border paper-gradient">
        <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
          <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
            Help Center & FAQ
          </p>
          <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05]">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-body">
            Everything you need to know about Press, Gift Cards, Story Submissions, and how tossatale works.
          </p>

          <div className="mt-8 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-subtle" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., Press, Gift Cards, Submissions)..."
              className="pl-11 h-12"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8">
        <div className="flex flex-wrap gap-2 border-b border-border pb-6">
          {[
            { key: "all", label: "All Questions" },
            { key: "press", label: "Press & Partnerships" },
            { key: "giftcards", label: "Gift Cards" },
            { key: "submissions", label: "Submissions" },
            { key: "platform", label: "Platform & Reading" },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key as FaqCategory)}
              className={cn(
                "rounded-full px-4 py-2 text-[0.875rem] font-bold transition-all",
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground shadow-paper"
                  : "bg-surface border border-border text-body hover:border-primary hover:text-primary",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-10 space-y-4 max-w-4xl">
          {filteredFaqs.length === 0 ? (
            <Panel className="p-10 text-center">
              <HelpCircle className="mx-auto size-10 text-subtle" />
              <h3 className="mt-4 text-[1.2rem] font-bold">No questions match your search</h3>
              <p className="mt-2 text-body">Try searching for different keywords or view all questions.</p>
              <Button variant="ghostOutline" size="sm" className="mt-6" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
                Reset Filters
              </Button>
            </Panel>
          ) : (
            filteredFaqs.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <Reveal key={faq.question} delay={i * 40}>
                  <Panel className="overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      className="flex w-full items-center justify-between p-6 text-left"
                    >
                      <span className="text-[1.1rem] font-bold text-heading pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-5 text-primary shrink-0 transition-transform duration-300",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-0 border-t border-divider/60 text-[0.9375rem] leading-relaxed text-body animate-in fade-in">
                        <p className="pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </Panel>
                </Reveal>
              );
            })
          )}
        </div>

        <section className="mt-20 max-w-4xl">
          <Panel className="p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 paper-gradient border-primary/20">
            <div>
              <h3 className="text-[1.3rem] font-display font-bold text-heading">
                Still have a question?
              </h3>
              <p className="mt-2 text-[0.9375rem] text-body">
                Whether it's a story pitch, a gift card inquiry, or a press request — we're here to help.
              </p>
            </div>
            <ButtonLink to="/contact" size="md" className="shrink-0">
              <MessageSquare className="size-4" /> Contact Team
            </ButtonLink>
          </Panel>
        </section>
      </div>
    </SiteLayout>
  );
}
