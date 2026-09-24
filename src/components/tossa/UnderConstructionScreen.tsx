import { Instagram, Youtube, Linkedin, Facebook } from "lucide-react";

import heroArt from "@/assets/Hero_section_pic.jpeg";
import officialLogo from "@/assets/official_tossatale_logo.png";
import { XIcon } from "@/components/tossa/kit";

export function UnderConstructionScreen({ message }: { message?: string }) {
  const socialLinks = [
    { label: "Instagram", href: "https://instagram.com/tossatale", icon: Instagram },
    { label: "YouTube", href: "https://youtube.com/@tossatale", icon: Youtube },
    { label: "X", href: "https://x.com/tossatale", icon: XIcon },
    { label: "LinkedIn", href: "https://linkedin.com/company/tossatale", icon: Linkedin },
    { label: "Facebook", href: "https://facebook.com/tossatale", icon: Facebook },
  ];

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-black px-5 text-center font-sans selection:bg-primary-light selection:text-primary">
      {/* Background Image with Dark Blur & Overlay */}
      <img
        src={heroArt}
        alt="Background"
        width={1920}
        height={1080}
        className="absolute inset-0 size-full object-cover opacity-25 filter blur-md scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60" />

      {/* Main Under Construction Card - Shadow effect without corner border lines */}
      <div className="relative z-10 mx-auto max-w-2xl w-full rounded-3xl bg-zinc-900/90 p-8 sm:p-12 md:p-14 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl my-12 border-none">
        {/* Full tossatale wordmark logo */}
        <div className="flex justify-center">
          <img
            src={officialLogo}
            alt="tossatale"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>

        {/* Heading in single line */}
        <h1 className="mt-8 text-2xl sm:text-4xl md:text-[2.6rem] leading-tight font-display font-bold text-white whitespace-nowrap">
          We'll be back shortly
        </h1>

        {/* Updated Maintenance Description */}
        <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-zinc-300">
          {message && !message.includes("undergo scheduled maintenance")
            ? message
            : "We are currently making a few improvements behind the scenes to make your experience better. Please check back soon."}
        </p>

        {/* Social Media Section with reduced spacing to divider */}
        <div className="mt-3.5 pt-3.5 border-t border-white/10 flex flex-col items-center justify-center">
          <p className="font-sans text-[0.875rem] sm:text-[0.9375rem] font-bold text-zinc-200">
            In the meantime, follow us for more updates.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3.5 sm:gap-4 flex-wrap">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="grid size-11 place-items-center rounded-full bg-white/5 text-zinc-300 hover:text-white hover:bg-white/15 transition-all duration-200 hover:scale-105"
                >
                  <Icon className="size-4.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
