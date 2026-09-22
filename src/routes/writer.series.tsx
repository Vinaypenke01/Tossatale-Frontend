import { createFileRoute } from "@tanstack/react-router";
import { SeriesStudio } from "@/components/tossa/SeriesStudio";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/writer/series")({
  head: () => pageHead("My Series & Chapters · tossatale", "Manage your serialized stories, plan chapter sequences, and write episodic installments."),
  component: WriterSeriesRoute,
});

function WriterSeriesRoute() {
  return <SeriesStudio role="writer" />;
}
