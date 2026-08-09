import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import heroArt from "@/assets/Hero_section_pic.jpeg";
import logo from "@/assets/tossatale_redefine_logo.jpg";
import { Button, ButtonLink, Input } from "@/components/tossa/kit";

export const Route = createFileRoute("/coming-soon")({
  head: () => ({
    meta: [
      { title: "Coming soon — tossatale Audio" },
      {
        name: "description",
        content:
          "tossatale Audio arrives this winter: every story read aloud by its writer. Join the waiting list.",
      },
      { property: "og:title", content: "Coming soon — tossatale Audio" },
      { property: "og:description", content: "Every story read aloud by its writer. This winter." },
    ],
  }),
  component: ComingSoon,
});

function ComingSoon() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 text-center">
      <img
        src={heroArt}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute inset-0 bg-primary-hover/55" />
      <div className="relative max-w-xl py-20">
        <img
          src={logo}
          alt="tossatale"
          width={56}
          height={56}
          className="mx-auto size-14 rounded-2xl shadow-lift"
        />
        <p className="mt-8 text-[0.6875rem] font-black tracking-[0.24em] text-white/70 uppercase">
          Coming this winter
        </p>
        <h1 className="mt-4 text-[clamp(2.3rem,5.4vw,3.8rem)] leading-[1.05] text-white">
          Tossatale Audio
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[1.0625rem] leading-relaxed text-white/85">
          Every story, read aloud by the person who wrote it. Same library, same quiet — now for the
          commute, the kitchen, the walk.
        </p>
        <form
          className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="sr-only" htmlFor="waitlist">
            Email address
          </label>
          <Input
            id="waitlist"
            type="email"
            placeholder="you@example.com"
            className="border-white/25 bg-white/12 text-white placeholder:text-white/60"
          />
          <Button variant="inkOnDark" className="shrink-0">
            <Mail className="size-4" /> Join the list
          </Button>
        </form>
        <div className="mt-8">
          <ButtonLink to="/" variant="inkOnDark" size="sm">
            Back to reading
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
