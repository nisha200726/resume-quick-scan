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

export async function getJobs(): Promise<Job[]> {
  const res = await api.get("/jobs");
  return (res.data.data || []).map((j: any) => ({
    ...j,
    id: String(j.id),
    skills: j.skills ? j.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    createdAt: j.createdAt ? new Date(j.createdAt).getTime() : Date.now(),
  }));
}

export async function saveJob(job: Omit<Job, "id" | "createdAt">): Promise<Job> {
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
}

export async function deleteJob(id: string) {
  await api.delete(`/jobs/${id}`);
}

export function parseSkills(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
}

