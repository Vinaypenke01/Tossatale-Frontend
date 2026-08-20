import { Mail, Sparkles, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import heroArt from "@/assets/Hero_section_pic.jpeg";
import logo from "@/assets/tossatale_redefine_logo.jpg";
import { Button, Input } from "@/components/tossa/kit";

export function UnderConstructionScreen({ message }: { message?: string }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list!", {
      description: "We'll notify you the moment tossatale goes live.",
    });
    setEmail("");
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-950 px-5 text-center font-sans">
      {/* Background Image with Dark Blur & Overlay */}
      <img
        src={heroArt}
        alt="Background"
        width={1920}
        height={1080}
        className="absolute inset-0 size-full object-cover opacity-30 filter blur-sm scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/50" />

      {/* Main Under Construction Glass Card */}
      <div className="relative z-10 mx-auto max-w-xl rounded-3xl border border-white/10 bg-zinc-900/60 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl my-12">
        <div className="relative inline-block">
          <img
            src={logo}
            alt="tossatale"
            width={64}
            height={64}
            className="mx-auto size-16 rounded-2xl shadow-lift border border-white/10"
          />
          <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-white shadow-sm">
            <Lock className="size-3" />
          </span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-sans text-[0.75rem] font-bold tracking-wide text-amber-400 uppercase">
            <Sparkles className="size-3.5" /> Site Under Construction
          </span>
        </div>

        <h1 className="mt-5 text-[clamp(2.1rem,4.8vw,3.4rem)] leading-[1.1] font-display font-bold text-white">
          We'll be back shortly
        </h1>

        <p className="mx-auto mt-4 max-w-md text-[1rem] leading-relaxed text-zinc-300">
          {message ||
            "tossatale is currently undergoing scheduled platform upgrades to refine your storytelling experience. All page access is temporarily restricted."}
        </p>

        <form
          className="mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="under-construction-email">
            Email address
          </label>
          <Input
            id="under-construction-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for launch access"
            className="h-11 border-white/20 bg-white/10 text-white placeholder:text-zinc-400 focus:ring-primary text-[0.875rem]"
          />
          <Button variant="inkOnDark" className="h-11 shrink-0 gap-2">
            <Mail className="size-4" /> Notify Me
          </Button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-5 text-[0.8125rem] text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Platform updates in progress · Back live soon</span>
          </div>
          <a
            href="/auth"
            className="text-xs text-zinc-500 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Admin Sign In →
          </a>
        </div>
      </div>
    </div>
  );
}
