import { motion } from "framer-motion";

export function MatchRing({ value, label = "Match" }: { value: number; label?: string }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 75 ? "hsl(var(--success))" : value >= 50 ? "hsl(var(--accent-blue))" : "hsl(var(--warning))";
  return (
    <div className="relative h-44 w-44">
      <svg className="-rotate-90 h-full w-full" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} stroke="hsl(var(--muted))" strokeWidth="14" fill="none" />
        <motion.circle
          cx="80" cy="80" r={r}
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-4xl font-bold"
        >
          {value}%
        </motion.span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
      </div>
    </div>
  );
}
