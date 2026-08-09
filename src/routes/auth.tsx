import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import heroArt from "@/assets/Hero_section_pic.jpeg";
import logo from "@/assets/tossatale_redefine_logo.jpg";
import { Button, Field, Input } from "@/components/tossa/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — tossatale" },
      {
        name: "description",
        content:
          "Sign in to tossatale to keep your place in every story, save bookmarks and follow the writers you read most.",
      },
      { property: "og:title", content: "Sign in — tossatale" },
      { property: "og:description", content: "Keep your place in every story." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(mode === "signin" ? "Signed in successfully!" : "Account created successfully!", {
      description: "Welcome back to tossatale. Your profile and role options are live in the top header navbar.",
    });
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-14">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="tossatale" width={40} height={40} className="size-10 rounded-xl" />
          <span className="font-display text-[1.35rem] font-bold text-heading">tossatale</span>
        </Link>

        <div className="mt-14 max-w-sm">
          <h1 className="text-[clamp(1.9rem,3.4vw,2.5rem)] leading-tight">
            {mode === "signin" ? "Welcome back." : "Make a reading home."}
          </h1>
          <p className="mt-3 text-[1rem] text-body">
            {mode === "signin"
              ? "Your bookmarks, series progress and shelves are exactly where you left them."
              : "Free to read. Members fund the writers they love."}
          </p>

          <div className="mt-8 flex rounded-full border border-border bg-surface p-1">
            {(
              [
                ["signin", "Sign in"],
                ["signup", "Create account"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={cn(
                  "flex-1 rounded-full py-2 font-sans text-[0.875rem] font-bold transition-colors",
                  mode === key ? "bg-primary text-primary-foreground" : "text-body hover:text-primary",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field label="Your name">
                <Input placeholder="Meera Raghavan" />
              </Field>
            )}
            <Field label="Email">
              <Input type="email" placeholder="you@example.com" defaultValue="meera.raghavan@tossatale.com" />
            </Field>
            <Field label="Password" hint={mode === "signup" ? "At least 8 characters." : undefined}>
              <Input type="password" placeholder="••••••••" defaultValue="password123" />
            </Field>
            <Button type="submit" size="lg" className="w-full">
              {mode === "signin" ? "Sign in" : "Create my account"}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-[0.8125rem] text-subtle">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-5 grid gap-2">
            <Button variant="ghostOutline">Continue with Google</Button>
            {/* <Button variant="ghostOutline">Continue with Apple</Button> */}
          </div>

          <p className="mt-8 text-[0.8125rem] text-subtle">
            By continuing you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroArt} alt="" width={1920} height={1080} className="size-full object-cover" />
        <span className="absolute inset-0 bg-primary-hover/35" />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <p className="max-w-md font-display text-[1.9rem] leading-snug text-white italic">
            “I came for one story and stayed for four years.”
          </p>
          <p className="mt-4 text-[0.9375rem] text-white/75">Member since 2022 · Kolkata</p>
        </div>
      </div>
    </div>
  );
}
