import { createFileRoute } from "@tanstack/react-router";

import { StoryEditor } from "@/components/tossa/StoryEditor";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/editor/")({
  head: () =>
    pageHead(
      "Write a story · tossatale admin",
      "Write, manage, and publish stories directly.",
    ),
  component: () => <StoryEditor role="admin" />,
});
