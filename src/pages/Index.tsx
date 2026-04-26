import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/app/Navbar";
import { ArrowRight, Zap, Target, BarChart3, FileSearch, Upload, Sparkles } from "lucide-react";

const features = [
  { icon: Zap, title: "Real-time analysis", desc: "Drop your resume and JD. Results appear instantly — no waiting, no reload." },
  { icon: Target, title: "Skill gap insights", desc: "See exactly which skills you're missing and what to learn next." },
  { icon: BarChart3, title: "Candidate ranking", desc: "Recruiters get auto-ranked applicants with transparent match scores." },
  { icon: FileSearch, title: "Dual upload system", desc: "Compare resume against any hiring poster, JD, or skills brief." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container relative pt-20 pb-28 md:pt-28 md:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-primary-glow" />
              Real-time AI-powered screening
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              Hire smarter.<br />
              <span className="text-gradient">Match faster.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              ResumeIQ analyzes resumes against job descriptions in real time — surfacing match scores,
              skill gaps, and ranked candidates the moment files are uploaded.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/candidate">
                <Button size="lg" className="bg-gradient-accent hover:opacity-90 shadow-glow text-base h-12 px-6">
                  <Upload className="mr-2 h-4 w-4" /> Upload & Analyze Now
                </Button>
              </Link>
              <Link to="/recruiter">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                  For recruiters <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "<1s", l: "Analysis time" },
                { n: "94%", l: "Match accuracy" },
                { n: "10k+", l: "Resumes scored" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl md:text-3xl font-bold">{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container pb-28">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-gradient-card p-6 hover:shadow-elegant transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-accent grid place-items-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 shadow-elegant">
          <div className="absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative max-w-2xl text-primary-foreground">
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Ready to see your match score?
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">
              Upload your resume and a job description. Get an instant ranking, skill gap analysis, and personalized feedback.
            </p>
            <Link to="/candidate" className="inline-block mt-8">
              <Button size="lg" variant="secondary" className="h-12 px-6 text-base">
                Start free analysis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ResumeIQ · Built for modern hiring teams
        </div>
      </footer>
    </div>
  );
}
