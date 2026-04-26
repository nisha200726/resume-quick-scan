import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Download, Map, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestedSkill } from "@/lib/analyzer";
import { buildRoadmap, Duration, Roadmap as RoadmapType } from "@/lib/roadmap";

export function Roadmap({ skills }: { skills: SuggestedSkill[] }) {
  const [duration, setDuration] = useState<Duration>("2w");
  const roadmap = useMemo(() => buildRoadmap(skills, duration), [skills, duration]);

  if (skills.length === 0) return null;

  const download = () => {
    const lines: string[] = [];
    lines.push(`RESUMEIQ LEARNING ROADMAP — ${duration === "2w" ? "2-Week Sprint" : "4-Week Plan"}`);
    lines.push("=".repeat(60));
    lines.push(`Total: ${roadmap.totalHours}h  ·  ~${roadmap.hoursPerWeek}h/week`);
    lines.push("");
    roadmap.weeks.forEach(w => {
      lines.push(`WEEK ${w.week} — ${w.theme}  (${w.totalHours}h)`);
      lines.push(`Focus: ${w.skills.join(", ")}`);
      lines.push("-".repeat(60));
      w.tasks.forEach((t, i) => {
        lines.push(`  ${i + 1}. [${t.hours}h] ${t.title}`);
        lines.push(`     ${t.detail}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `learning-roadmap-${duration}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center shadow-glow shrink-0">
            <Map className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              Personalized learning roadmap
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-3 w-3" /> Auto-generated
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ordered plan covering your top {Math.min(skills.length, duration === "2w" ? 3 : 5)} skill gaps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-background">
            {(["2w", "4w"] as Duration[]).map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  duration === d
                    ? "bg-gradient-accent text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d === "2w" ? "2 weeks" : "4 weeks"}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={download}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Plan
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryStat icon={<Calendar className="h-3.5 w-3.5" />} label="Duration" value={duration === "2w" ? "2 weeks" : "4 weeks"} />
        <SummaryStat icon={<Clock className="h-3.5 w-3.5" />} label="Total effort" value={`${roadmap.totalHours}h`} />
        <SummaryStat icon={<Sparkles className="h-3.5 w-3.5" />} label="Per week" value={`~${roadmap.hoursPerWeek}h`} />
      </div>

      {/* Weeks timeline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={duration}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {roadmap.weeks.map((w, i) => (
            <div key={w.week} className="relative pl-10">
              {/* Connector line */}
              {i < roadmap.weeks.length - 1 && (
                <div className="absolute left-[15px] top-9 bottom-[-16px] w-px bg-border" />
              )}
              {/* Week badge */}
              <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-gradient-accent text-white grid place-items-center font-display font-bold text-sm shadow-glow">
                {w.week}
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-display font-semibold">Week {w.week} · {w.theme}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Focus: {w.skills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent text-accent-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {w.totalHours}h
                  </span>
                </div>

                <ol className="space-y-2.5">
                  {w.tasks.map((t, ti) => (
                    <motion.li
                      key={ti}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ti * 0.04 }}
                      className="flex gap-3 group"
                    >
                      <div className="flex flex-col items-center pt-0.5">
                        <div className="h-5 w-5 rounded-md border-2 border-border group-hover:border-primary-glow transition shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{t.title}</p>
                          <span className="text-[11px] text-muted-foreground shrink-0 font-medium">{t.hours}h</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.detail}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] uppercase tracking-wider">
        {icon} {label}
      </div>
      <p className="font-display text-lg font-bold mt-1">{value}</p>
    </div>
  );
}
