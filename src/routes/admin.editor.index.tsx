import { createFileRoute } from "@tanstack/react-router";

import { StoryEditor } from "@/components/tossa/StoryEditor";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/editor/")({
  head: () =>
    pageHead(
      "Write a story · tossatale admin",
      "Editorial desk drafting — write and publish a story straight to the tossatale library.",
    ),
  component: () => <StoryEditor role="admin" />,
});
