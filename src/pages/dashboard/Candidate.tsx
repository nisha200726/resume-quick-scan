import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/app/Navbar";
import { UploadCard } from "@/components/app/UploadCard";
import { MatchRing } from "@/components/app/MatchRing";
import { Button } from "@/components/ui/button";
import { analyze, AnalysisResult, readFileAsText } from "@/lib/analyzer";
import { Loader2, CheckCircle2, AlertCircle, Lightbulb, Download, TrendingUp } from "lucide-react";

export default function Candidate() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJd] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!resume || !jd) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setResult(null);
      const [r, j] = await Promise.all([readFileAsText(resume), readFileAsText(jd)]);
      // Small delay so animation feels intentional
      await new Promise(res => setTimeout(res, 700));
      if (cancelled) return;
      setResult(analyze(r, j));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [resume, jd]);

  const downloadReport = () => {
    if (!result) return;
    const txt = `RESUMEIQ ANALYSIS REPORT
========================

Match Score: ${result.matchPercent}%
Ranking Score: ${result.rankScore}/100
Keyword Overlap: ${result.keywordOverlap}%

Matched Skills (${result.matchedSkills.length}):
${result.matchedSkills.map(s => '  ✓ ' + s).join('\n') || '  (none)'}

Missing Skills (${result.missingSkills.length}):
${result.missingSkills.map(s => '  ✗ ' + s).join('\n') || '  (none)'}

Suggested Skills to Learn:
${result.suggestedSkills.map(s => '  → ' + s).join('\n') || '  (none)'}

Feedback:
${result.feedback.map(f => '  • ' + f).join('\n')}
`;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "resumeiq-report.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 md:py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-primary-glow font-medium">Candidate Dashboard</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">Real-time resume analysis</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Upload your resume and the job description. Results appear instantly — no page reload, no waiting.
          </p>
        </motion.div>

        {/* DUAL UPLOAD */}
        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <UploadCard
            label="Drop your resume"
            hint="Drag & drop or click to upload"
            file={resume}
            onFile={setResume}
            accent="blue"
          />
          <UploadCard
            label="Drop the job description"
            hint="Or hiring poster / required skills file"
            file={jd}
            onFile={setJd}
            accent="cyan"
          />
        </div>

        {/* STATE: empty */}
        {!resume || !jd ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center"
          >
            <div className="inline-flex h-12 w-12 rounded-full bg-accent items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="font-display font-semibold text-lg">Upload both files to begin</p>
            <p className="text-sm text-muted-foreground mt-1">
              {!resume && !jd && "We need your resume and a job description."}
              {resume && !jd && "Resume ready — now add a job description."}
              {!resume && jd && "JD ready — now add your resume."}
            </p>
          </motion.div>
        ) : null}

        {/* LOADING */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-12 rounded-2xl border border-border bg-gradient-card p-10 text-center"
            >
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary-glow" />
              <p className="mt-4 font-display font-semibold">Analyzing your match…</p>
              <p className="text-sm text-muted-foreground mt-1">Extracting skills, computing overlap, ranking candidates</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-12 space-y-6"
            >
              {/* TOP CARDS */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="md:col-span-1 rounded-2xl border border-border bg-gradient-card p-6 flex flex-col items-center shadow-soft">
                  <MatchRing value={result.matchPercent} label="Match" />
                  <p className="mt-4 text-sm text-muted-foreground text-center">Resume vs job description</p>
                </div>

                <div className="md:col-span-2 grid sm:grid-cols-2 gap-5">
                  <StatCard label="Ranking score" value={`${result.rankScore}/100`} hint="Across detected skills" tone="primary" />
                  <StatCard label="Keyword overlap" value={`${result.keywordOverlap}%`} hint="JD term coverage" tone="cyan" />
                  <StatCard label="Skills matched" value={`${result.matchedSkills.length}`} hint={`of ${result.jdSkills.length} required`} tone="success" />
                  <StatCard label="Skill gaps" value={`${result.missingSkills.length}`} hint="To improve match" tone="warning" />
                </div>
              </div>

              {/* SKILLS */}
              <div className="grid md:grid-cols-2 gap-5">
                <SkillPanel
                  title="Matched skills"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  tone="success"
                  skills={result.matchedSkills}
                  empty="No direct skill matches detected"
                />
                <SkillPanel
                  title="Missing skills"
                  icon={<AlertCircle className="h-4 w-4" />}
                  tone="warning"
                  skills={result.missingSkills}
                  empty="No gaps — great fit!"
                />
              </div>

              {/* JD SKILL BARS */}
              <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
                <h3 className="font-display font-semibold text-lg mb-4">Required skills coverage</h3>
                <div className="space-y-3">
                  {result.jdSkills.length === 0 && <p className="text-sm text-muted-foreground">No specific skills detected in the job description.</p>}
                  {result.jdSkills.slice(0, 10).map((s) => {
                    const matched = result.matchedSkills.includes(s);
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium capitalize">{s}</span>
                          <span className={matched ? "text-success" : "text-warning"}>
                            {matched ? "Matched" : "Missing"}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: matched ? "100%" : "20%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${matched ? "bg-gradient-accent" : "bg-warning/60"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FEEDBACK */}
              <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-primary-glow" />
                  <h3 className="font-display font-semibold text-lg">Personalized feedback</h3>
                </div>
                <ul className="space-y-2">
                  {result.feedback.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                      <span className="text-primary-glow">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {result.suggestedSkills.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-border">
                    <p className="text-sm font-medium mb-2">Suggested skills to learn next:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedSkills.map(s => (
                        <span key={s} className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium capitalize">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={downloadReport} className="bg-gradient-accent hover:opacity-90 shadow-glow">
                  <Download className="mr-2 h-4 w-4" /> Download report
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: "primary" | "cyan" | "success" | "warning" }) {
  const ring = {
    primary: "from-primary/10 to-primary-glow/10",
    cyan: "from-sky-500/10 to-cyan-400/10",
    success: "from-emerald-500/10 to-emerald-300/10",
    warning: "from-amber-500/10 to-orange-400/10",
  }[tone];
  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${ring} p-5 shadow-soft`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

function SkillPanel({ title, icon, tone, skills, empty }: { title: string; icon: React.ReactNode; tone: "success" | "warning"; skills: string[]; empty: string }) {
  const colors = tone === "success"
    ? "bg-success/10 text-success border-success/20"
    : "bg-warning/10 text-warning border-warning/20";
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colors}`}>
          {icon} {skills.length}
        </span>
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <span key={s} className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${colors}`}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
