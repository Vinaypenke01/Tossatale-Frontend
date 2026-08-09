import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { AppShell, StatCard } from "@/components/tossa/AppShell";
import { Button, Panel } from "@/components/tossa/kit";
import { pageHead } from "@/lib/head";
import { stories } from "@/lib/data";

export const Route = createFileRoute("/writer/analytics")({
  head: () =>
    pageHead("Story analytics · tossatale studio", "Reads, finish rates, follower growth and earnings for your work."),
  component: WriterAnalytics,
});

const months = [
  { label: "Feb", value: 42 },
  { label: "Mar", value: 55 },
  { label: "Apr", value: 48 },
  { label: "May", value: 72 },
  { label: "Jun", value: 84 },
  { label: "Jul", value: 96 },
];

const payouts = [
  { month: "July 2026", reads: "182k", amount: "₹48,200", status: "Processing" },
  { month: "June 2026", reads: "164k", amount: "₹42,900", status: "Paid" },
  { month: "May 2026", reads: "141k", amount: "₹36,400", status: "Paid" },
  { month: "April 2026", reads: "118k", amount: "₹30,150", status: "Paid" },
];

function WriterAnalytics() {
  return (
    <AppShell
      role="writer"
      title="Analytics & earnings"
      blurb="What readers finished, what they abandoned, and what it paid."
      actions={
        <Button variant="ghostOutline">
          <Download className="size-4" /> Download statement
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Reads (30d)" value="182k" delta="+11%" />
        <StatCard label="Finish rate" value="79%" delta="+3.1%" />
        <StatCard label="New followers" value="312" delta="+18%" />
        <StatCard label="Earnings (30d)" value="₹48,200" delta="+9%" />
      </div>

      <Panel className="p-6">
        <h2 className="text-xl">Reads by month</h2>
        <div className="mt-8 flex h-56 items-end gap-4">
          {months.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-3">
              <div className="w-full rounded-t-xl ink-gradient" style={{ height: `${m.value}%` }} />
              <span className="font-sans text-[0.75rem] font-bold text-subtle">{m.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="text-xl">Top stories</h2>
          <ul className="mt-5 divide-y divide-border">
            {stories.slice(0, 5).map((s) => (
              <li key={s.slug} className="flex items-center gap-4 py-3">
                <img src={s.cover} alt="" loading="lazy" className="h-11 w-14 rounded-lg object-cover" />
                <p className="min-w-0 flex-1 truncate font-sans text-[0.9375rem] font-bold text-heading">
                  {s.title}
                </p>
                <span className="shrink-0 text-[0.875rem] text-subtle">{s.views}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-6">
          <h2 className="text-xl">Payouts</h2>
          <ul className="mt-5 divide-y divide-border">
            {payouts.map((p) => (
              <li key={p.month} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-sans text-[0.9375rem] font-bold text-heading">{p.month}</p>
                  <p className="text-[0.8125rem] text-subtle">{p.reads} reads</p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[0.9375rem] font-bold text-heading">{p.amount}</p>
                  <p className="text-[0.8125rem] text-subtle">{p.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
