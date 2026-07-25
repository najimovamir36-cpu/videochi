import { StatCard } from "@/components/dashboard/stat-card";
import { Stagger } from "@/components/motion/stagger";
import type { DashboardStat } from "@/types/media";

/** Responsive KPI row. */
export function StatsGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <Stagger stagger={0.07} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </Stagger>
  );
}
