import { SuggestedSkill } from "./analyzer";

export type Duration = "2w" | "4w";

export interface RoadmapTask {
  title: string;
  detail: string;
  hours: number;
}

export interface RoadmapWeek {
  week: number;
  theme: string;
  skills: string[];
  tasks: RoadmapTask[];
  totalHours: number;
}

export interface Roadmap {
  duration: Duration;
  totalHours: number;
  hoursPerWeek: number;
  weeks: RoadmapWeek[];
}

// Per-skill effort weight (relative difficulty / breadth)
const SKILL_WEIGHT: Record<string, number> = {
  react: 3, typescript: 2, javascript: 2, python: 3, java: 3,
  'next.js': 2, nextjs: 2, node: 2, nodejs: 2, sql: 2, postgresql: 2,
  mongodb: 2, docker: 3, kubernetes: 4, aws: 4, azure: 4, gcp: 4,
  graphql: 2, tailwind: 1, git: 1, 'ci/cd': 2, 'machine learning': 5,
  tensorflow: 4, pytorch: 4, 'data analysis': 3, pandas: 2, figma: 1,
  agile: 1, scrum: 1, jest: 1, cypress: 2, go: 3, golang: 3, rust: 4,
  flutter: 3, 'react native': 3,
};

// Templated learning steps for a skill
function tasksFor(skill: string, hoursAvailable: number): RoadmapTask[] {
  const cap = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());
  const name = cap(skill);

  // Distribute hours across 4 canonical phases
  const split = (frac: number) => Math.max(1, Math.round(hoursAvailable * frac));

  return [
    {
      title: `Foundations of ${name}`,
      detail: `Read official docs intro, watch a 1–2h overview, and note core concepts in your own words.`,
      hours: split(0.2),
    },
    {
      title: `Hands-on ${name} tutorial`,
      detail: `Complete a guided beginner tutorial end-to-end. Type every example yourself — don't copy-paste.`,
      hours: split(0.3),
    },
    {
      title: `Mini project with ${name}`,
      detail: `Build a small project (todo, dashboard widget, script) that uses ${name} as the core technology.`,
      hours: split(0.35),
    },
    {
      title: `Add ${name} to your resume`,
      detail: `Push the project to GitHub, write a 2-line description, and list ${name} under your skills.`,
      hours: split(0.15),
    },
  ];
}

function weightFor(skill: string): number {
  return SKILL_WEIGHT[skill.toLowerCase()] ?? 2;
}

export function buildRoadmap(skills: SuggestedSkill[], duration: Duration): Roadmap {
  const numWeeks = duration === "2w" ? 2 : 4;
  const hoursPerWeek = duration === "2w" ? 12 : 8; // more intense for 2w sprint
  const totalHours = numWeeks * hoursPerWeek;

  // Trim or use what we have
  const picks = skills.slice(0, duration === "2w" ? 3 : 5);
  if (picks.length === 0) {
    return { duration, totalHours, hoursPerWeek, weeks: [] };
  }

  // Order by weight ascending (easier wins first to build momentum)
  const ordered = [...picks].sort((a, b) => weightFor(a.name) - weightFor(b.name));

  // Allocate hours per skill proportional to weight
  const totalWeight = ordered.reduce((s, x) => s + weightFor(x.name), 0);
  const skillHours = new Map<string, number>();
  ordered.forEach(s => {
    skillHours.set(s.name, Math.max(4, Math.round((weightFor(s.name) / totalWeight) * totalHours)));
  });

  // Build a flat list of tasks across all skills
  type Item = { skill: string; task: RoadmapTask };
  const queue: Item[] = [];
  ordered.forEach(s => {
    tasksFor(s.name, skillHours.get(s.name)!).forEach(task => {
      queue.push({ skill: s.name, task });
    });
  });

  // Pack tasks into weeks by hour budget
  const weeks: RoadmapWeek[] = Array.from({ length: numWeeks }, (_, i) => ({
    week: i + 1,
    theme: "",
    skills: [],
    tasks: [],
    totalHours: 0,
  }));

  let wi = 0;
  for (const item of queue) {
    while (wi < numWeeks - 1 && weeks[wi].totalHours + item.task.hours > hoursPerWeek + 1) {
      wi++;
    }
    weeks[wi].tasks.push(item.task);
    weeks[wi].totalHours += item.task.hours;
    if (!weeks[wi].skills.includes(item.skill)) weeks[wi].skills.push(item.skill);
  }

  // Themes
  const themes = duration === "2w"
    ? ["Foundations & first wins", "Build, ship, and showcase"]
    : ["Foundations", "Hands-on practice", "Project building", "Polish & showcase"];
  weeks.forEach((w, i) => { w.theme = themes[i] || `Week ${i + 1}`; });

  return { duration, totalHours, hoursPerWeek, weeks };
}
