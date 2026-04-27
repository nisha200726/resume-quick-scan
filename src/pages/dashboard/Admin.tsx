import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/app/Navbar";
import { Users, Briefcase, FileText, Activity, Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const usage = [
  { day: "Mon", analyses: 42, signups: 8 },
  { day: "Tue", analyses: 58, signups: 12 },
  { day: "Wed", analyses: 73, signups: 9 },
  { day: "Thu", analyses: 91, signups: 15 },
  { day: "Fri", analyses: 110, signups: 21 },
  { day: "Sat", analyses: 64, signups: 6 },
  { day: "Sun", analyses: 49, signups: 4 },
];

const roles = [
  { role: "Frontend", count: 38 },
  { role: "Backend", count: 31 },
  { role: "Data", count: 22 },
  { role: "Design", count: 14 },
  { role: "PM", count: 11 },
];

export default function Admin() {
  const [stats, setStats] = useState([
    { label: "Total users", value: "0", icon: Users, delta: "+0%" },
    { label: "Active jobs", value: "0", icon: Briefcase, delta: "+0%" },
    { label: "Resumes processed", value: "0", icon: FileText, delta: "+0%" },
    { label: "Total analyses", value: "0", icon: Activity, delta: "stable" },
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      const data = res.data.data;
      setStats([
        { label: "Total users", value: String(data.totalUsers || 0), icon: Users, delta: "+12%" },
        { label: "Active jobs", value: String(data.activeJobs || 0), icon: Briefcase, delta: "+4%" },
        { label: "Resumes processed", value: String(data.resumesProcessed || 0), icon: FileText, delta: "+28%" },
        { label: "Total analyses", value: String(data.totalAnalyses || 0), icon: Activity, delta: "stable" },
      ]);
    } catch {
      toast({ title: "Error", description: "Failed to load admin stats", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 md:py-14">
        <p className="text-sm text-primary-glow font-medium">Admin Panel</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">System overview</h1>

        {loading && (
          <div className="mt-8 flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
          </div>
        )}

        {!loading && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <s.icon className="h-4 w-4 text-primary-glow" />
                  </div>
                  <p className="font-display text-3xl font-bold mt-2">{s.value}</p>
                  <p className="text-xs text-success mt-1">{s.delta}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-5 mt-8">
              <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
                <h3 className="font-display font-semibold text-lg mb-4">Activity (last 7 days)</h3>
                <div className="h-72">
                  <ResponsiveContainer>
                    <AreaChart data={usage}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent-blue))" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(var(--accent-blue))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                      <Area type="monotone" dataKey="analyses" stroke="hsl(var(--accent-blue))" strokeWidth={2.5} fill="url(#g1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
                <h3 className="font-display font-semibold text-lg mb-4">Top role categories</h3>
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={roles}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="role" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                      <Bar dataKey="count" fill="hsl(var(--accent-blue))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

