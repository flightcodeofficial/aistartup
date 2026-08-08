import { ProjectHero } from "@/components/dashboard/ProjectHero";
import { StepSearch } from "@/components/dashboard/StepSearch";
import { WeekOverviewGrid } from "@/components/dashboard/WeekOverviewGrid";
import { FavoritesAndNotes } from "@/components/dashboard/FavoritesAndNotes";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-8 sm:py-10">
      <ProjectHero />
      <StepSearch />
      <WeekOverviewGrid />
      <FavoritesAndNotes />
    </div>
  );
}
