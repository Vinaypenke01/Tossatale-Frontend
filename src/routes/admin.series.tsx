import { createFileRoute } from "@tanstack/react-router";
import { SeriesStudio } from "@/components/tossa/SeriesStudio";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/series")({
  head: () => pageHead("Admin Series Studio · tossatale", "Create, manage and publish serialized chapter stories across the platform."),
  component: AdminSeriesRoute,
});

function AdminSeriesRoute() {
  return <SeriesStudio role="admin" />;
}
