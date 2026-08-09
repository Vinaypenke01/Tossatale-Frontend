import { createFileRoute } from "@tanstack/react-router";

import { StoryEditor } from "@/components/tossa/StoryEditor";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/writer/editor/")({
  head: () => pageHead("New story · tossatale studio", "A quiet, distraction-free editor for drafting your next story."),
  component: () => <StoryEditor />,
});
