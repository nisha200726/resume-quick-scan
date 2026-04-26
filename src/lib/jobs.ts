export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // Full-time, Part-time, Contract, Internship
  description: string;
  skills: string[]; // parsed from comma-separated input
  createdAt: number;
}

const KEY = 'rss.jobs.v1';

export function getJobs(): Job[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveJob(job: Omit<Job, 'id' | 'createdAt'>): Job {
  const newJob: Job = {
    ...job,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const all = [newJob, ...getJobs()];
  localStorage.setItem(KEY, JSON.stringify(all));
  return newJob;
}

export function deleteJob(id: string) {
  const all = getJobs().filter(j => j.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function parseSkills(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 30);
}