import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/tossa/SiteLayout";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead(
      "Terms & Conditions — tossatale",
      "These Terms & Conditions govern your access to and use of the Tossatale digital storytelling platform, stories, blogs, videos, and related features.",
    ),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[840px] px-5 py-20 lg:px-8">
        <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
          Legal & Governance
        </p>
        <h1 className="mt-3 text-[clamp(2.2rem,4.4vw,3.2rem)] font-display font-bold leading-tight text-heading">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-[0.9375rem] text-subtle">
          Last Updated: 12 August 2026
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-7 text-[1rem] leading-relaxed text-body shadow-paper">
          <p>
            Welcome to <strong>Tossatale</strong> (&ldquo;Tossatale&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Tossatale website, application, services, stories, blogs, videos, and related features (collectively, the &ldquo;Platform&rdquo;).
          </p>
          <p className="mt-3">
            By accessing or using Tossatale, creating an account, submitting content, or interacting with content on the Platform, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the Platform.
          </p>
        </div>

        <div className="mt-12 space-y-12 text-[1rem] leading-relaxed text-body">
          {/* 1. About Tossatale */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">1. About Tossatale</h2>
            <p className="mt-3">
              Tossatale is a digital storytelling and content platform that allows users to discover and read stories and blogs. The Platform may also allow approved writers to submit their original work for review and publication. Tossatale may publish its own stories, blogs, articles, and YouTube videos, while registered writers may submit their own content subject to review and approval.
            </p>
          </section>

          {/* 2. Eligibility */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">2. Eligibility</h2>
            <p className="mt-3">
              You must provide accurate information when creating an account or using features that require registration. By using the Platform, you confirm that:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>You are legally capable of entering into these Terms.</li>
              <li>The information you provide is accurate and up to date.</li>
              <li>You will use the Platform only for lawful purposes.</li>
              <li>You will not misuse, disrupt, or attempt to gain unauthorized access to the Platform.</li>
            </ul>
            <p className="mt-4 text-[0.9375rem] text-subtle">
              If you are below the applicable age of consent under Indian law, you should use the Platform only with the involvement and consent of a parent or legal guardian where required.
            </p>
          </section>

          {/* 3. User Accounts */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">3. User Accounts</h2>
            <p className="mt-3">
              Certain features require you to create or access an account. Users may sign in through supported authentication providers, including Google OAuth.
            </p>
            <p className="mt-3 font-semibold text-heading">You are responsible for:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>Maintaining the security of your account.</li>
              <li>Providing accurate account information.</li>
              <li>Not sharing access to your account with others.</li>
              <li>Immediately informing us if you believe your account has been compromised.</li>
            </ul>
            <p className="mt-4 text-[0.9375rem]">
              Tossatale reserves the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          {/* 4. User Roles */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">4. User Roles</h2>
            <p className="mt-3">Tossatale may provide different account roles, including:</p>

            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-display font-bold text-heading text-lg">User (Reader)</h3>
                <p className="mt-1 text-sm text-subtle">Users can:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
                  <li>Read stories and blogs.</li>
                  <li>Like stories and support writers.</li>
                  <li>Share stories on social platforms.</li>
                  <li>View writer profiles and author journeys.</li>
                  <li>Interact with available Platform features.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-display font-bold text-heading text-lg">Writer</h3>
                <p className="mt-1 text-sm text-subtle">Approved writers may:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
                  <li>Create stories and drafts in the Writer Studio.</li>
                  <li>Save stories as drafts and revisions.</li>
                  <li>Submit stories for editorial review.</li>
                  <li>View the status of submitted stories.</li>
                  <li>View engagement statistics for their published stories.</li>
                  <li>Participate in Story Series where enabled.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-display font-bold text-heading text-lg">Admin</h3>
                <p className="mt-1 text-sm text-subtle">Administrators may:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
                  <li>Create and publish stories, blogs, and essays.</li>
                  <li>Publish and curate YouTube short films and videos.</li>
                  <li>Review writer submissions in the Review Queue.</li>
                  <li>Approve or reject submitted stories with feedback.</li>
                  <li>Manage users and writer accounts.</li>
                  <li>Manage categories, tags, Story Series, and Platform content.</li>
                  <li>Manage writer verification badges.</li>
                  <li>Access Platform analytics and reach statistics.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Story and Content Submission */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">5. Story and Content Submission</h2>
            <p className="mt-3">
              Writers may submit original stories or other permitted content through the Platform. All submitted content may be reviewed by Tossatale before publication. A submitted story may be:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Approved and published.</li>
              <li>Rejected.</li>
              <li>Returned to the writer for changes.</li>
              <li>Edited or formatted for presentation.</li>
              <li>Removed after publication if it violates these Terms or applicable law.</li>
            </ul>
            <p className="mt-4 text-[0.9375rem] font-medium text-heading">
              Submission of content does not guarantee publication. Tossatale has sole discretion to determine whether submitted content is suitable for publication.
            </p>
          </section>

          {/* 6. Content Review and Approval */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">6. Content Review and Approval</h2>
            <p className="mt-3">
              All writer submissions are subject to administrative review. When a writer submits a story:
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-6">
              <li>The story enters a pending/review status.</li>
              <li>The administrator may review the content for quality and guidelines.</li>
              <li>The administrator may approve or reject the submission.</li>
              <li>The writer may receive an email notification regarding the decision.</li>
              <li>Approved content may become publicly available on the Platform.</li>
            </ol>
            <p className="mt-4 text-[0.9375rem] text-subtle">
              Tossatale may request changes before approving a submission.
            </p>
          </section>

          {/* 7. User-Generated Content */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">7. User-Generated Content</h2>
            <p className="mt-3">
              For purposes of these Terms, &ldquo;User Content&rdquo; includes stories, text, comments, profiles, reviews, or other material submitted or published by users or writers. You are solely responsible for the User Content you submit. You must not submit content that:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Infringes copyright, trademark, privacy, publicity, or other rights.</li>
              <li>Is plagiarized or copied without permission.</li>
              <li>Contains knowingly false or misleading information intended to harm another person.</li>
              <li>Contains threats, harassment, abuse, or hate speech.</li>
              <li>Promotes illegal activities.</li>
              <li>Contains sexually explicit or exploitative material.</li>
              <li>Exploits or endangers children or minors.</li>
              <li>Contains malicious code, malware, or harmful links.</li>
              <li>Violates applicable Indian law or other applicable laws.</li>
              <li>Impersonates another person or organization.</li>
              <li>Infringes the intellectual property rights of another person.</li>
            </ul>
            <p className="mt-4 text-[0.9375rem]">
              Tossatale may remove, reject, restrict, or disable access to content that violates these Terms.
            </p>
          </section>

          {/* 8. Ownership of Your Content */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">8. Ownership of Your Content</h2>
            <p className="mt-3">
              You retain ownership of original intellectual property that you lawfully own and submit to Tossatale.
            </p>
            <p className="mt-3">
              By submitting content for publication, you grant Tossatale a non-exclusive, worldwide, royalty-free license to host, reproduce, display, publish, distribute, format, promote, and make your submitted content available through Tossatale and its associated digital channels. This license is limited to operating, promoting, and providing the Tossatale service.
            </p>
            <p className="mt-3 font-semibold text-heading">You represent that:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>You own the content or have the necessary rights and permissions to submit it.</li>
              <li>Publication of the content does not infringe another person&apos;s rights.</li>
              <li>You have obtained any permissions required for third-party material included in your submission.</li>
            </ul>
            <p className="mt-3 text-[0.9375rem] text-subtle">
              You remain responsible for any claims arising from content you submit.
            </p>
          </section>

          {/* 9. Copyright and Intellectual Property */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">9. Copyright and Intellectual Property</h2>
            <p className="mt-3">
              The Tossatale name, branding, logo, website design, software, original Platform content, graphics, text, and other materials provided by Tossatale are owned by or licensed to Tossatale unless otherwise stated.
            </p>
            <p className="mt-3">
              You may not reproduce, copy, modify, distribute, sell, publish, scrape, or commercially exploit Tossatale&apos;s proprietary materials without prior written permission.
            </p>
            <p className="mt-3">
              If you believe content published on Tossatale infringes your copyright or other intellectual property rights, you may contact us with appropriate details so that the matter can be reviewed.
            </p>
          </section>

          {/* 10. Writer Verification Badge */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">10. Writer Verification Badge</h2>
            <p className="mt-3">
              Tossatale may provide a verification badge to selected writers. A verification badge indicates that Tossatale has verified or recognized the writer according to its internal criteria. Verification does not:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Guarantee the accuracy of a writer&apos;s content.</li>
              <li>Constitute an endorsement of every opinion expressed by the writer.</li>
              <li>Guarantee the writer&apos;s qualifications or professional status.</li>
            </ul>
            <p className="mt-3 text-[0.9375rem]">
              Tossatale may grant, refuse, suspend, or remove verification at its discretion.
            </p>
          </section>

          {/* 11. Story Series */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">11. Story Series</h2>
            <p className="mt-3">
              Tossatale may allow stories to be organized into Story Series. A Story Series may contain multiple related stories arranged in a particular reading order. Tossatale may modify the ordering, visibility, title, description, or status of a Story Series where necessary for Platform management or policy compliance.
            </p>
          </section>

          {/* 12. Likes, Shares, Views and Analytics */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">12. Likes, Shares, Views and Analytics</h2>
            <p className="mt-3">
              Tossatale may collect and display engagement information such as views, likes, shares, reading activity, story popularity, and writer statistics.
            </p>
            <p className="mt-3">
              Engagement counts may be calculated using automated systems and may not always represent unique individuals. Tossatale may use reasonable measures to detect spam, fraudulent activity, automated activity, or manipulation of engagement metrics. Tossatale may remove or adjust engagement counts where manipulation or technical errors are identified.
            </p>
          </section>

          {/* 13. Sharing Content */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">13. Sharing Content</h2>
            <p className="mt-3">
              The Platform may provide social sharing functionality. When you share a Tossatale story or other publicly available content, the shared information may be visible on the third-party platform you choose. Your use of third-party social media platforms is governed by their respective terms and privacy policies.
            </p>
          </section>

          {/* 14. Blogs and YouTube Videos */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">14. Blogs and YouTube Videos</h2>
            <p className="mt-3">
              Tossatale may publish blogs, articles, and YouTube videos through the Platform. YouTube videos may be embedded or linked from YouTube. Tossatale does not necessarily own or control third-party video content and is not responsible for changes made by third-party platforms. Third-party content remains subject to the terms and policies of the respective third-party service.
            </p>
          </section>

          {/* 15. Content Accuracy */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">15. Content Accuracy</h2>
            <p className="mt-3">
              Tossatale provides stories, blogs, opinions, and other content for informational, creative, and entertainment purposes. We do not guarantee that all content published on the Platform is accurate, complete, current, or suitable for every reader. Opinions expressed by writers belong to the respective writers and do not necessarily represent the views of Tossatale.
            </p>
          </section>

          {/* 16. Prohibited Activities */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">16. Prohibited Activities</h2>
            <p className="mt-3">You must not:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Attempt to access another user&apos;s account.</li>
              <li>Circumvent Platform security.</li>
              <li>Use bots or automated systems to manipulate engagement.</li>
              <li>Scrape or reproduce Platform content without permission.</li>
              <li>Upload malicious code.</li>
              <li>Interfere with Platform operations.</li>
              <li>Attempt unauthorized access to administrative systems.</li>
              <li>Use the Platform for unlawful activities.</li>
              <li>Abuse or harass other users or writers.</li>
              <li>Submit plagiarized or infringing content.</li>
            </ul>
          </section>

          {/* 17. Account Suspension and Termination */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">17. Account Suspension and Termination</h2>
            <p className="mt-3">
              Tossatale may suspend, restrict, or terminate an account where a user:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Violates these Terms.</li>
              <li>Submits prohibited or unlawful content.</li>
              <li>Engages in fraudulent or abusive activity.</li>
              <li>Attempts unauthorized access.</li>
              <li>Misuses the Platform.</li>
              <li>Violates applicable law.</li>
            </ul>
            <p className="mt-4 text-[0.9375rem] text-subtle">
              Where appropriate, Tossatale may provide notice and an opportunity to address the violation. Tossatale may also remove content independently of account termination.
            </p>
          </section>

          {/* 18. Platform Availability */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">18. Platform Availability</h2>
            <p className="mt-3">
              We aim to keep Tossatale available and functioning reliably. However, we do not guarantee uninterrupted or error-free access. The Platform may occasionally be unavailable because of maintenance, updates, security incidents, infrastructure issues, third-party service interruptions, or events beyond our reasonable control.
            </p>
          </section>

          {/* 19. Third-Party Services */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">19. Third-Party Services</h2>
            <p className="mt-3">
              Tossatale may use third-party services such as Google OAuth, YouTube, hosting and infrastructure providers, email delivery providers, analytics services, and content storage services. Use of third-party services may be subject to their own terms and privacy policies.
            </p>
          </section>

          {/* 20. Disclaimer */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">20. Disclaimer</h2>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, Tossatale provides the Platform and its content on an &ldquo;as available&rdquo; basis. We do not guarantee that:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>The Platform will always be available.</li>
              <li>Content will always be accurate or complete.</li>
              <li>Every submitted story will be published.</li>
              <li>Engagement statistics will always be completely accurate.</li>
              <li>The Platform will be free from all technical errors.</li>
            </ul>
            <p className="mt-4 text-[0.9375rem] text-subtle">
              Nothing in these Terms excludes any liability that cannot legally be excluded under applicable law.
            </p>
          </section>

          {/* 21. Limitation of Liability */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">21. Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, Tossatale shall not be liable for indirect, incidental, special, consequential, or unforeseeable losses arising from the use of the Platform. Nothing in these Terms limits liability where such limitation is prohibited by applicable law.
            </p>
          </section>

          {/* 22. Indemnification */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">22. Indemnification</h2>
            <p className="mt-3">
              You agree to defend, indemnify, and hold Tossatale and its authorized personnel harmless from claims, losses, liabilities, damages, and reasonable expenses arising from:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Your violation of these Terms.</li>
              <li>Your User Content.</li>
              <li>Your infringement of another person&apos;s rights.</li>
              <li>Your unlawful use of the Platform.</li>
            </ul>
          </section>

          {/* 23. Changes to These Terms */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">23. Changes to These Terms</h2>
            <p className="mt-3">
              Tossatale may update these Terms from time to time. When material changes are made, we may provide appropriate notice through the Platform or other reasonable means. Your continued use of the Platform after the updated Terms become effective constitutes acceptance of the revised Terms, to the extent permitted by law.
            </p>
          </section>

          {/* 24. Governing Law */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">24. Governing Law</h2>
            <p className="mt-3">
              These Terms shall be governed by and interpreted in accordance with the laws applicable in India. Any disputes shall be subject to the jurisdiction of the courts having appropriate jurisdiction over the matter and the location specified by Tossatale, subject to applicable law.
            </p>
          </section>

          {/* 25. Contact Us */}
          <section className="pt-2">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">25. Contact Us</h2>
            <p className="mt-3">
              For questions regarding these Terms, content complaints, copyright concerns, or other legal matters, please contact:
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5 space-y-1">
              <p className="font-bold text-heading">Tossatale</p>
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
              By using Tossatale, you acknowledge that you have read and understood these Terms &amp; Conditions and agree to be bound by them.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
