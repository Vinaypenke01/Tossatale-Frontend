import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { StoryEditor } from "@/components/tossa/StoryEditor";
import { pageHead } from "@/lib/head";
import { api } from "@/lib/api";

export const Route = createFileRoute("/writer/editor/$storyId")({
  head: () => pageHead("Edit story · tossatale studio", "Revise a draft, adjust its cover and metadata, then submit for review."),
  component: EditStory,
});

function EditStory() {
  const { storyId } = Route.useParams();

  const { data: storyData, isLoading } = useQuery({
    queryKey: ["writer-story-edit-detail", storyId],
    queryFn: async () => {
      try {
        const res = await api.get(`/writer/stories/${storyId}/`);
        return res.data?.data || res.data;
      } catch {
        const publicRes = await api.get(`/public/stories/${storyId}/`);
        return publicRes.data?.data || publicRes.data;
      }
    },
    enabled: Boolean(storyId),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-sans text-subtle font-medium">
        Loading story details...
      </div>
    );
  }

  return <StoryEditor key={storyData?.id || storyId} story={storyData} role="writer" />;
}
