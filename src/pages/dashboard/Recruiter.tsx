import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/app/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Briefcase, Users, TrendingUp, Download } from "lucide-react";

const candidates = [
  { name: "Aisha Khan", role: "Senior Frontend Engineer", score: 94, skills: ["React", "TypeScript", "Tailwind"], status: "Top match" },
  { name: "Marcus Chen", role: "Senior Frontend Engineer", score: 88, skills: ["React", "Next.js", "GraphQL"], status: "Strong" },
  { name: "Priya Patel", role: "Senior Frontend Engineer", score: 81, skills: ["Vue", "TypeScript", "CSS"], status: "Strong" },
  { name: "Diego Alvarez", role: "Senior Frontend Engineer", score: 72, skills: ["React", "Redux"], status: "Consider" },
  { name: "Sara Nilsson", role: "Senior Frontend Engineer", score: 64, skills: ["JavaScript", "HTML"], status: "Consider" },
  { name: "Ken Tanaka", role: "Senior Frontend Engineer", score: 51, skills: ["jQuery", "PHP"], status: "Low match" },
];

const stats = [
  { label: "Open roles", value: "12", icon: Briefcase },
  { label: "Applicants", value: "248", icon: Users },
  { label: "Avg match", value: "73%", icon: TrendingUp },
];

export default function Recruiter() {
  const [q, setQ] = useState("");
  const filtered = candidates.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.skills.join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-primary-glow font-medium">Recruiter Dashboard</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">Ranked candidates</h1>
            <p className="mt-3 text-muted-foreground">Auto-ranked by match score against your job description.</p>
          </div>
          <Button className="bg-gradient-accent hover:opacity-90 shadow-glow">
            <Plus className="mr-2 h-4 w-4" /> Post a job
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-primary-glow" />
              </div>
              <p className="font-display text-3xl font-bold mt-2">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or skill" className="pl-9 h-11" />
          </div>
          <Button variant="outline" className="h-11"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-gradient-card overflow-hidden shadow-soft">
          <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/40">
            <div className="col-span-4">Candidate</div>
            <div className="col-span-4 hidden md:block">Skills</div>
            <div className="col-span-2">Match</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {filtered.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="grid grid-cols-12 items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-accent grid place-items-center text-white font-semibold">
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                </div>
              </div>
              <div className="col-span-4 hidden md:flex flex-wrap gap-1.5">
                {c.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">{s}</span>
                ))}
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden max-w-[120px]">
                    <div
                      className={`h-full rounded-full ${c.score >= 80 ? "bg-gradient-accent" : c.score >= 65 ? "bg-primary-glow" : "bg-warning"}`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{c.score}</span>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  c.score >= 85 ? "bg-success/10 text-success" :
                  c.score >= 70 ? "bg-accent text-accent-foreground" :
                  "bg-warning/10 text-warning"
                }`}>{c.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
