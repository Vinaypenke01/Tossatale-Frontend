import { createFileRoute } from "@tanstack/react-router";

import { StoryEditor } from "@/components/tossa/StoryEditor";
import { pageHead } from "@/lib/head";
import { storyBySlug } from "@/lib/data";

export const Route = createFileRoute("/writer/editor/$storyId")({
  head: () => pageHead("Edit story · tossatale studio", "Revise a draft, adjust its cover and metadata, then submit for review."),
  component: EditStory,
});

function EditStory() {
  const { storyId } = Route.useParams();
  const story = storyBySlug(storyId);
  return <StoryEditor story={story} />;
}
