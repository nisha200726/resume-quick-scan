import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/app/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Briefcase, Users, TrendingUp, Download, MapPin, Clock, Trash2, Loader2 } from "lucide-react";
import { getJobs, saveJob, deleteJob, parseSkills, type Job } from "@/lib/jobs";
import api from "@/lib/api";

interface CandidateItem {
  id: string;
  name: string;
  role: string;
  score: number;
  skills: string[];
  status: string;
}

const stats = [
  { label: "Open roles", value: "0", icon: Briefcase },
  { label: "Applicants", value: "0", icon: Users },
  { label: "Avg match", value: "73%", icon: TrendingUp },
];

const fallbackCandidates: CandidateItem[] = [
  {
    id: "sample-1",
    name: "Aarav Sharma",
    role: "Frontend Developer",
    score: 88,
    skills: ["React", "TypeScript", "Tailwind"],
    status: "Strong",
  },
  {
    id: "sample-2",
    name: "Nisha Patel",
    role: "Java Backend Engineer",
    score: 81,
    skills: ["Java", "Spring Boot", "MySQL"],
    status: "Shortlist",
  },
  {
    id: "sample-3",
    name: "Riya Mehta",
    role: "Data Analyst",
    score: 69,
    skills: ["Python", "SQL", "Power BI"],
    status: "Consider",
  },
];

function isBackendUnavailable(error: any) {
  return !error?.response && (error?.code === "ERR_NETWORK" || error?.message === "Network Error");
}

export default function Recruiter() {
  const [q, setQ] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    skills: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const jobsRes = await getJobs();
      setJobs(jobsRes);

      const candRes = await api.get("/candidates");
      const cands = (candRes.data.data || []).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        role: c.role,
        score: c.score || 0,
        skills: c.skills ? c.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        status: c.status || "Consider",
      }));
      setCandidates(cands);
    } catch (error) {
      if (isBackendUnavailable(error)) {
        const jobsRes = await getJobs();
        setJobs(jobsRes);
        setCandidates(fallbackCandidates);
      } else {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () =>
    setForm({ title: "", company: "", location: "", type: "Full-time", description: "", skills: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const company = form.company.trim();
    const description = form.description.trim();
    if (!title || !company || !description) {
      toast({ title: "Missing info", description: "Title, company and description are required.", variant: "destructive" });
      return;
    }
    if (title.length > 120 || company.length > 120 || description.length > 5000) {
      toast({ title: "Too long", description: "Please shorten the fields.", variant: "destructive" });
      return;
    }
    try {
      const job = await saveJob({
        title,
        company,
        location: form.location.trim(),
        type: form.type,
        description,
        skills: parseSkills(form.skills),
      });
      setJobs((prev) => [job, ...prev]);
      toast({ title: "Job posted", description: `${job.title} is now live.` });
      resetForm();
      setOpen(false);
    } catch (error) {
      if (!isBackendUnavailable(error)) {
        toast({ title: "Error", description: "Failed to post job", variant: "destructive" });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (error) {
      if (!isBackendUnavailable(error)) {
        toast({ title: "Error", description: "Failed to delete job", variant: "destructive" });
      }
    }
  };

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.skills.join(" ").toLowerCase().includes(q.toLowerCase())
  );

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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-accent hover:opacity-90 shadow-glow">
                <Plus className="mr-2 h-4 w-4" /> Post a job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Post a new job</DialogTitle>
                <DialogDescription>Candidates will be matched against this description in real time.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="title">Job title *</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Frontend Engineer" maxLength={120} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." maxLength={120} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Bengaluru" maxLength={120} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Employment type</Label>
                  <select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Required skills (comma-separated)</Label>
                  <Input id="skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Tailwind" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Job description *</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Responsibilities, requirements, nice-to-haves..." rows={6} maxLength={5000} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-accent hover:opacity-90">Publish job</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-8">
          {stats.map((s, i) => {
            const value = s.label === "Open roles" ? String(jobs.length || s.value) : s.label === "Applicants" ? String(candidates.length || s.value) : s.value;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <s.icon className="h-4 w-4 text-primary-glow" />
                </div>
                <p className="font-display text-3xl font-bold mt-2">{value}</p>
              </motion.div>
            );
          })}
        </div>

        {jobs.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold">Your posted jobs</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {jobs.map((j, i) => (
                <motion.div key={j.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{j.title}</p>
                      <p className="text-sm text-muted-foreground">{j.company}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(j.id)} aria-label="Delete job">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{j.type}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(j.createdAt).toLocaleDateString()}</span>
                  </div>
                  {j.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.skills.slice(0, 8).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-sm text-foreground/80 line-clamp-3 whitespace-pre-line">{j.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or skill" className="pl-9 h-11" />
          </div>
          <Button variant="outline" className="h-11"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>

        {loading && (
          <div className="mt-6 flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
          </div>
        )}

        {!loading && (
          <div className="mt-6 rounded-2xl border border-border bg-gradient-card overflow-hidden shadow-soft">
            <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/40">
              <div className="col-span-4">Candidate</div>
              <div className="col-span-4 hidden md:block">Skills</div>
              <div className="col-span-2">Match</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-12 items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-accent grid place-items-center text-white font-semibold">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                </div>
                <div className="col-span-4 hidden md:flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
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
            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No candidates found. Try a different search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

