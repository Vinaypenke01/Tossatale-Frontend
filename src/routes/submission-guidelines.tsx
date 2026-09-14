import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/tossa/SiteLayout";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/submission-guidelines")({
  head: () =>
    pageHead(
      "Submission Guidelines — tossatale",
      "Official story and blog submission guidelines, formatting requirements, AI policy, and review criteria for tossatale.",
    ),
  component: SubmissionGuidelinesPage,
});

function SubmissionGuidelinesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[840px] px-5 py-20 lg:px-8">
        <p className="font-sans text-[0.6875rem] font-black tracking-[0.22em] text-primary uppercase">
          Writers &amp; Creators
        </p>
        <h1 className="mt-3 text-[clamp(2.2rem,4.4vw,3.2rem)] font-display font-bold leading-tight text-heading">
          Submission Guidelines
        </h1>
        <p className="mt-3 text-[0.9375rem] text-subtle">
          Last Updated: 14 September 2026
        </p>

        {/* Welcome Card */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-7 text-[1rem] leading-relaxed text-body shadow-paper">
          <p>
            Welcome to <strong>tossatale</strong>, a place for enthusiastic readers and writers. Thank you for showing interest in writing and sharing your work with us.
          </p>
          <p className="mt-3">
            Before you begin your journey with us, please make sure you understand and follow the established guidelines for submitting stories to our website. We request that you carefully go through all the relevant information regarding story submissions and their requirements.
          </p>
        </div>

        <div className="mt-12 space-y-12 text-[1rem] leading-relaxed text-body">
          {/* 1. How to Submit Short Stories */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              1. How to Submit Short Stories
            </h2>
            <p className="mt-3">
              Please refer to our{" "}
              <Link to="/terms" className="text-primary hover:underline font-semibold">
                Terms &amp; Conditions
              </Link>{" "}
              before you begin writing.
            </p>
            <p className="mt-3">
              Once you have decided to submit your story, please{" "}
              <Link to="/writer/register" className="text-primary hover:underline font-semibold">
                create a Writer Account
              </Link>{" "}
              or modify your existing account to a Writer Account. This will provide you with the appropriate interface and workspace to compose and submit your stories.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-display font-bold text-heading text-base">
                Story Quality &amp; Structure Expectations
              </h3>
              <p className="mt-2 text-sm text-subtle">
                Please do not submit a collection of unrelated sentences or thoughts and present them as a short story. A story should have a proper structure, flow, characters, and meaningful connections between its different elements. Submissions that do not meet these basic expectations may not be approved.
              </p>
            </div>
            <p className="mt-4 text-sm text-subtle">
              Stories are accepted through a Writer Account. If you have difficulty creating an account or do not wish to create one, please reach out through our{" "}
              <Link to="/contact" className="text-primary hover:underline font-semibold">
                Contact page
              </Link>
              . You can share the details of your story with us, and our editorial team will review it. If approved, we may upload it through a new Writer Account using your preferred pen name.
            </p>
          </section>

          {/* 2. Why We Do This */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              2. Why We Do This
            </h2>
            <p className="mt-3">
              We want to encourage everyone to write and share their stories with us and our readers. At the same time, we have established a few guidelines to make the submission and publication process smooth for everyone.
            </p>
            <p className="mt-3">
              Before submitting your work, you will need to provide some basic information so that we can verify your authenticity as a writer. We appreciate your cooperation in helping us maintain a trustworthy writing community.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm">
                We do not want to limit your creativity or the way you tell your story. However, your characters, scenes, and events should remain properly connected throughout the story. Make sure each character and scene has an appropriate setup and purpose so that the story feels complete, fresh, and authentic to our readers.
              </p>
            </div>
          </section>

          {/* 3. Stories in Chapters */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              3. Stories in Chapters
            </h2>
            <p className="mt-3">
              You may divide your story into chapters if the format suits your writing style. However, please observe the following rules:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Maximum 15 Chapters:</strong> A story should not exceed 15 chapters.
              </li>
              <li>
                <strong>Complete Story Submission:</strong> If you choose to write your story in chapters, please complete the entire story and submit it as one single submission. <em>Do not submit your story chapter by chapter.</em>
              </li>
            </ul>
          </section>

          {/* 4. Our Approach to AI-Generated Content */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              4. Our Approach to AI-Generated Content
            </h2>
            <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="font-semibold text-heading">
                We strongly discourage the use of AI-generated content for short stories.
              </p>
              <p className="mt-2 text-sm text-body">
                We want tossatale to be a place where readers can experience the thoughts, creativity, emotions, and imagination of real writers. Your writing does not need to be perfect. What matters to us is your originality, honesty, and the feeling behind your story.
              </p>
            </div>
            <p className="mt-4">
              You may use grammar or proofreading tools to correct spelling, grammar, or basic language errors. However, <strong>please do not use AI tools to write, rewrite, generate, or substantially modify your short story.</strong>
            </p>
            <p className="mt-3 text-sm text-subtle">
              As humans, we understand the emotions and experiences behind storytelling. Your originality and our trust in your work should always come first.
            </p>
          </section>

          {/* 5. Submission Limits and Review */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              5. Submission Limits &amp; Editorial Review
            </h2>
            <p className="mt-3">
              Please follow the submission limitations provided on the website when you log in to your Writer Account and submit your short stories.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong>Review Window:</strong> We regularly review the stories we receive. You may receive a response from us within <strong>two weeks</strong> of your submission.
              </li>
              <li>
                <strong>Review Status:</strong> If you do not receive a response within this period, it may mean that your submission was not selected. An automated response may also be sent to your registered email address where applicable.
              </li>
            </ul>
          </section>

          {/* 6. Submission Fees */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              6. Submission Fees
            </h2>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-heading font-medium">
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                Story submission is completely free.
              </p>
              <p className="mt-1 text-sm text-body">
                We do not charge any fee for submitting short stories to tossatale. If there are ever any changes to our submission process or fees in the future, we will inform you in advance through the appropriate channels. You do not need to worry about unexpected submission charges.
              </p>
            </div>
          </section>

          {/* 7. Multiple Story Submissions */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              7. Multiple Story Submissions
            </h2>
            <p className="mt-3">
              Yes, you can submit multiple stories to tossatale.
            </p>
            <p className="mt-3">
              However, if you have already submitted several stories, submitting <strong>more than five stories at the same time</strong> may make it difficult for our team to review each submission properly.
            </p>
            <p className="mt-2 text-sm text-subtle">
              We therefore recommend submitting your stories thoughtfully and allowing sufficient time for each submission to be reviewed before sending new batches.
            </p>
          </section>

          {/* 8. Write Blogs for tossatale */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              8. Write Blogs for tossatale
            </h2>
            <p className="mt-3">
              Along with short stories, you can also contribute blogs to tossatale.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5 space-y-3">
              <p className="text-sm">
                Please send your blog submission from your registered email address to:{" "}
                <a
                  href="mailto:hello@tossatale.com"
                  className="text-primary font-bold hover:underline"
                >
                  hello@tossatale.com
                </a>
              </p>
              <p className="text-sm text-subtle">
                Blogs should be submitted in <strong>PDF format</strong> and styled with the <strong>Lato</strong> font. Please include:
              </p>
              <ul className="list-disc space-y-1.5 pl-6 text-sm text-body">
                <li>A clear title or heading</li>
                <li>The complete blog content</li>
                <li>Relevant research or reference links, where applicable</li>
              </ul>
              <p className="text-xs text-subtle">
                Providing research and reference links allows us to verify the information and establish the originality and authenticity of your work.
              </p>
            </div>
            <p className="mt-4 text-xs text-subtle italic">
              Note: Blogs and short stories are reviewed under separate criteria. A short story submitted as a blog, or vice versa, may not be accepted if it does not meet the respective submission requirements.
            </p>
          </section>

          {/* 9. Grammar and Proofreading */}
          <section className="border-b border-border pb-8">
            <h2 className="text-[1.35rem] font-display font-bold text-heading">
              9. Grammar and Proofreading
            </h2>
            <p className="mt-3">
              Please check your grammar and spelling before submitting your work.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm">
              <li>
                You may use grammar-checking or proofreading tools to correct basic language errors.
              </li>
              <li>
                You may also use AI-assisted tools for proofreading or grammar corrections.
              </li>
              <li>
                However, AI tools should <strong>not</strong> be used to generate, rewrite, or modify the creative content of your short story.
              </li>
              <li>
                <strong>Your story should remain your own authentic work.</strong>
              </li>
            </ul>
          </section>

          {/* Closing Card */}
          <div className="rounded-2xl border border-primary/20 bg-surface p-6 sm:p-8 text-center shadow-paper">
            <h2 className="text-xl font-display font-bold text-heading">
              Keep Reading. Keep Writing. Keep Sharing.
            </h2>
            <p className="mt-2 text-sm text-body max-w-lg mx-auto">
              We encourage you to write, read, explore, and share your stories with our growing community of readers and writers. Most importantly, enjoy the process of writing. Your story may inspire someone, make someone think, or simply make someone feel something.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/writer/register"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-button transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Become a Writer
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-bold text-heading transition-colors hover:bg-muted"
              >
                Contact Editorial Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
