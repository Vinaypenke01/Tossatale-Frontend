import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/tossa/SiteLayout";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead(
      "Privacy Policy — tossatale",
      "How Tossatale collects, protects, processes, and respects reader and writer data across our storytelling platform.",
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[840px] px-5 py-20 lg:px-8">
        <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
          Legal & Privacy
        </p>
        <h1 className="mt-3 text-[clamp(2.2rem,4.4vw,3.2rem)] font-display font-bold leading-tight text-heading">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[0.9375rem] text-subtle">
          Last Updated: 12 August 2026
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-7 text-[1rem] leading-relaxed text-body shadow-paper">
          <p>
            Welcome to <strong>Tossatale</strong> (&ldquo;Tossatale&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). This Privacy Policy explains how we collect, use, store, protect, and share information when you access or use our digital storytelling platform, website, applications, stories, blogs, videos, and related services (collectively, the &ldquo;Platform&rdquo;).
          </p>
          <p className="mt-3">
            By using Tossatale, you acknowledge and agree to the collection and use of your information in accordance with this Privacy Policy. If you do not agree with this policy, please discontinue use of the Platform.
          </p>
        </div>

        <div className="mt-12 space-y-12 text-[1rem] leading-relaxed text-body">
          {/* 1. Information We Collect */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">1. Information We Collect</h2>
            <p className="mt-3">We collect information in the following categories:</p>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-display font-bold text-heading text-base">A. Information You Provide Directly</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-6 text-sm">
                  <li><strong>Account Details:</strong> Full name, email address, password, and profile photo when registering.</li>
                  <li><strong>Writer Information:</strong> Biography, portfolio links, social media handles, and profile preferences.</li>
                  <li><strong>Content Submissions:</strong> Stories, essays, articles, series chapters, and review notes.</li>
                  <li><strong>Communications:</strong> Messages, feedback, or support inquiries sent to our editorial team.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-display font-bold text-heading text-base">B. Information Collected via Third-Party Authentication</h3>
                <p className="mt-1 text-sm text-subtle">
                  When you authenticate through Google Sign-In (OAuth), Google shares your name, verified email address, profile photo URL, and authentication token. We do not receive or store your Google password.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-display font-bold text-heading text-base">C. Automatic Usage & Engagement Data</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-6 text-sm">
                  <li><strong>Reading Activity:</strong> Stories viewed, estimated read times, likes, bookmarks, and shares.</li>
                  <li><strong>Technical Logs:</strong> Device type, browser user-agent, operating system, and IP address for security and anti-fraud verification.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">2. How We Use Your Information</h2>
            <p className="mt-3">We use collected information solely for legitimate operational purposes:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To provide, operate, and maintain the Tossatale digital storytelling platform.</li>
              <li>To authenticate readers, writers, and administrators securely.</li>
              <li>To review, curate, format, and publish approved stories and series.</li>
              <li>To calculate aggregate engagement metrics (views, likes, bookmarks, reads) without exposing individual reader identities.</li>
              <li>To deliver administrative notifications, verification codes (OTP), editorial review feedback, and platform updates.</li>
              <li>To detect, prevent, and mitigate spam, automated bot activity, fraud, and security vulnerabilities.</li>
            </ul>
          </section>

          {/* 3. What We Never Do (Data Selling & Advertising) */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">3. What We Never Do</h2>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-heading font-medium">
              <ul className="list-disc space-y-2 pl-6">
                <li>We <strong>never sell, rent, or trade</strong> your personal information or reading history to third parties or data brokers.</li>
                <li>We do not run invasive third-party cross-site advertising trackers.</li>
                <li>We never share individual reading logs with writers. Writers receive aggregated view counts and engagement numbers, never individual reader names.</li>
              </ul>
            </div>
          </section>

          {/* 4. Information Sharing & Third-Party Service Providers */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">4. Information Sharing &amp; Service Providers</h2>
            <p className="mt-3">
              We may share necessary data with trusted third-party service providers bound by strict confidentiality and data protection obligations:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Google OAuth:</strong> For secure one-click user sign-in and account verification.</li>
              <li><strong>Email Delivery (Resend API / SMTP):</strong> For transmitting password reset codes (OTP), security notices, and editorial status updates.</li>
              <li><strong>Hosting &amp; Cloud Infrastructure:</strong> For hosting databases, media files, and server infrastructure.</li>
              <li><strong>YouTube:</strong> For embedding and streaming short films and video documentaries.</li>
              <li><strong>Legal Compliance:</strong> When required by applicable Indian law, court order, or governmental authority.</li>
            </ul>
          </section>

          {/* 5. Cookies & Local Storage */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">5. Cookies &amp; Local Storage</h2>
            <p className="mt-3">
              Tossatale uses essential cookies and local storage tokens exclusively for functional purposes:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Authentication Tokens:</strong> Secure JWT / session cookies to maintain your logged-in state.</li>
              <li><strong>Theme Preference:</strong> To remember your Light / Dark mode display settings.</li>
              <li><strong>Reading State:</strong> To preserve your place in serialized longform chapters and bookmarks.</li>
            </ul>
          </section>

          {/* 6. Data Security & Retention */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">6. Data Security &amp; Retention</h2>
            <p className="mt-3">
              We implement industry-standard administrative, technical, and physical security measures, including HTTPS encryption, hashed passwords (PBKDF2/Argon2), and role-based access controls to safeguard your data.
            </p>
            <p className="mt-3">
              We retain your information only as long as necessary to provide platform services or comply with legal obligations.
            </p>
          </section>

          {/* 7. Your Rights & Account Deletion */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">7. Your Rights &amp; Choices</h2>
            <p className="mt-3">You have complete control over your personal information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Access &amp; Update:</strong> Edit your profile details, bio, photo, and social links at any time in your Studio Settings.</li>
              <li><strong>Password Management:</strong> Reset your password securely via OTP verification.</li>
              <li><strong>Account Deletion:</strong> You may request the permanent deletion of your account and personal records by contacting our support team.</li>
            </ul>
          </section>

          {/* 8. Children's Privacy */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">8. Children&apos;s Privacy</h2>
            <p className="mt-3">
              Tossatale is not directed to children under the age of consent under applicable Indian law without parental involvement. We do not knowingly collect personal data from minors without parental consent.
            </p>
          </section>

          {/* 9. Governing Law */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">9. Governing Law</h2>
            <p className="mt-3">
              This Privacy Policy is governed by and construed in accordance with the laws of India, including the Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act, 2000.
            </p>
          </section>

          {/* 10. Contact Us */}
          <section className="pt-2">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">10. Contact Us &amp; Grievance Officer</h2>
            <p className="mt-3">
              If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5 space-y-1">
              <p className="font-bold text-heading">Tossatale Privacy &amp; Legal</p>
              <p className="text-sm">
                Email:{" "}
                <a href="mailto:hello@tossatale.com" className="text-primary font-bold hover:underline">
                  hello@tossatale.com
                </a>
              </p>
              <p className="text-sm">
                Website:{" "}
                <a href="https://www.tossatale.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  https://www.tossatale.com
                </a>
              </p>
            </div>
            <p className="mt-8 text-center text-xs text-subtle font-medium">
              By using Tossatale, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
