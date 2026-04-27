import api from "./api";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  skills: string[];
  createdAt: number;
}

const LOCAL_JOBS_KEY = "resumeiq_jobs";

const fallbackJobs: Job[] = [
  {
    id: "sample-frontend",
    title: "Frontend Developer",
    company: "ResumeIQ Talent",
    location: "Remote",
    type: "Full-time",
    description: "Build responsive React interfaces for recruiter and candidate workflows.",
    skills: ["React", "TypeScript", "Tailwind", "Vite"],
    createdAt: Date.now() - 86400000,
  },
  {
    id: "sample-backend",
    title: "Java Backend Engineer",
    company: "ResumeIQ Talent",
    location: "Bengaluru",
    type: "Full-time",
    description: "Create Spring Boot APIs for resume parsing, analysis, and hiring dashboards.",
    skills: ["Java", "Spring Boot", "MySQL", "JWT"],
    createdAt: Date.now() - 172800000,
  },
];

function loadLocalJobs(): Job[] {
  const stored = localStorage.getItem(LOCAL_JOBS_KEY);
  if (!stored) return fallbackJobs;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallbackJobs;
  } catch {
    return fallbackJobs;
  }
}

function saveLocalJobs(jobs: Job[]) {
  localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
}

function isBackendUnavailable(error: any) {
  return !error?.response && (error?.code === "ERR_NETWORK" || error?.message === "Network Error");
}

export async function getJobs(): Promise<Job[]> {
  try {
    const res = await api.get("/jobs");
    return (res.data.data || []).map((j: any) => ({
      ...j,
      id: String(j.id),
      skills: j.skills ? j.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      createdAt: j.createdAt ? new Date(j.createdAt).getTime() : Date.now(),
    }));
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return loadLocalJobs();
  }
}

export async function saveJob(job: Omit<Job, "id" | "createdAt">): Promise<Job> {
  try {
    const res = await api.post("/jobs", {
      ...job,
      skills: job.skills.join(","),
    });
    const j = res.data.data;
    return {
      ...j,
      id: String(j.id),
      skills: j.skills ? j.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      createdAt: j.createdAt ? new Date(j.createdAt).getTime() : Date.now(),
    };
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;

    const newJob = {
      ...job,
      id: `local-${Date.now()}`,
      createdAt: Date.now(),
    };
    saveLocalJobs([newJob, ...loadLocalJobs()]);
    return newJob;
  }
}

export async function deleteJob(id: string) {
  try {
    await api.delete(`/jobs/${id}`);
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    saveLocalJobs(loadLocalJobs().filter((job) => job.id !== id));
  }
}

export function parseSkills(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
}

