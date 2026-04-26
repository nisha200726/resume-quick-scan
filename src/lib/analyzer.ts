// Lightweight client-side resume vs JD keyword analyzer
const STOPWORDS = new Set(`a an and or but if then so of in on at to for from with by as is are was were be been being have has had do does did will would shall should may might must can could the this that these those it its we you they them our your their not no nor any all some such only own same than too very into through during before after above below up down out off over under again further once here there when where why how about against between because while not also more most other some only into we i me my mine us your you he she his her him etc using based use used per via etc include including required preferred ability years experience work working role job position company team responsibilities requirements qualifications candidate candidates apply applying applicant must should good strong excellent solid proven hands-on hands knowledge understanding familiar familiarity plus bonus nice have having looking seeking want need needed ideal great well`.split(/\s+/));

// Expanded skill dictionary with multi-word skills
const SKILL_DICT = [
  // Languages
  'javascript','typescript','python','java','c++','c#','.net','php','ruby','go','golang','rust','swift','kotlin','scala','r','matlab','bash','shell','sql','html','css','sass','scss',
  // Frontend
  'react','nextjs','next.js','vue','vuejs','angular','svelte','redux','zustand','tailwind','bootstrap','material ui','mui','chakra','styled components','webpack','vite','remix','astro','jquery',
  // Backend
  'node','nodejs','express','nestjs','spring','spring boot','django','flask','fastapi','laravel','rails','asp.net','gin','fiber','symfony','graphql','rest','rest api','grpc','websocket','microservices','soap',
  // Databases
  'mysql','postgres','postgresql','mongodb','redis','sqlite','dynamodb','cassandra','elasticsearch','firebase','supabase','prisma','sequelize','typeorm','mongoose',
  // DevOps / Cloud
  'aws','azure','gcp','google cloud','docker','kubernetes','terraform','ansible','jenkins','github actions','gitlab ci','circleci','ci/cd','linux','nginx','apache','helm','prometheus','grafana','datadog','splunk','cloudformation','serverless','lambda',
  // Mobile
  'android','ios','flutter','react native','xamarin','ionic',
  // Data / AI
  'machine learning','deep learning','nlp','computer vision','tensorflow','pytorch','keras','scikit-learn','pandas','numpy','spark','hadoop','airflow','kafka','rabbitmq','etl','data analysis','data science','data engineering','power bi','powerbi','tableau','looker','excel','statistics',
  // Testing
  'jest','mocha','cypress','playwright','selenium','vitest','junit','pytest','tdd','bdd','unit testing','integration testing','e2e',
  // Tools / Practices
  'git','github','gitlab','bitbucket','jira','confluence','figma','sketch','adobe xd','photoshop','illustrator','agile','scrum','kanban','waterfall',
  // Security
  'oauth','jwt','saml','encryption','penetration testing','owasp','siem','cybersecurity','iam',
  // Soft skills
  'communication','leadership','teamwork','problem solving','collaboration','mentoring','stakeholder management','project management','product management','presentation',
  // Marketing / business
  'seo','sem','google analytics','content marketing','copywriting','email marketing',
];

// Curated learning resources for the most common skills
const LEARN_LINKS: Record<string, string> = {
  react: 'https://react.dev/learn',
  typescript: 'https://www.typescriptlang.org/docs/handbook/intro.html',
  javascript: 'https://javascript.info/',
  python: 'https://docs.python.org/3/tutorial/',
  java: 'https://dev.java/learn/',
  'next.js': 'https://nextjs.org/learn',
  nextjs: 'https://nextjs.org/learn',
  nodejs: 'https://nodejs.org/en/learn',
  node: 'https://nodejs.org/en/learn',
  sql: 'https://sqlbolt.com/',
  postgresql: 'https://www.postgresqltutorial.com/',
  mongodb: 'https://learn.mongodb.com/',
  docker: 'https://docs.docker.com/get-started/',
  kubernetes: 'https://kubernetes.io/docs/tutorials/',
  aws: 'https://aws.amazon.com/training/',
  azure: 'https://learn.microsoft.com/azure/',
  gcp: 'https://cloud.google.com/training',
  graphql: 'https://graphql.org/learn/',
  tailwind: 'https://tailwindcss.com/docs',
  git: 'https://learngitbranching.js.org/',
  'ci/cd': 'https://docs.github.com/actions',
  'machine learning': 'https://www.coursera.org/learn/machine-learning',
  tensorflow: 'https://www.tensorflow.org/tutorials',
  pytorch: 'https://pytorch.org/tutorials/',
  'data analysis': 'https://www.kaggle.com/learn',
  pandas: 'https://pandas.pydata.org/docs/getting_started/',
  figma: 'https://help.figma.com/',
  agile: 'https://www.atlassian.com/agile',
  scrum: 'https://www.scrum.org/resources',
  jest: 'https://jestjs.io/docs/getting-started',
  cypress: 'https://docs.cypress.io/guides/getting-started/installing-cypress',
  go: 'https://go.dev/learn/',
  golang: 'https://go.dev/learn/',
  rust: 'https://doc.rust-lang.org/book/',
  flutter: 'https://docs.flutter.dev/',
  'react native': 'https://reactnative.dev/docs/getting-started',
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ').replace(/\s+/g, ' ');
}

function tokens(text: string) {
  return normalize(text).split(' ').filter(w => w && w.length > 2 && !STOPWORDS.has(w));
}

function extractSkills(text: string): Set<string> {
  const norm = ' ' + normalize(text) + ' ';
  const found = new Set<string>();
  SKILL_DICT.forEach(skill => {
    if (norm.includes(' ' + skill + ' ')) found.add(skill);
  });
  return found;
}

// Fallback: pull notable JD-only keywords (capitalised tokens, multi-occurrence) the resume doesn't mention
function extractFallbackGaps(jdText: string, resumeText: string): string[] {
  const rTok = new Set(tokens(resumeText));
  const counts = new Map<string, number>();
  for (const t of tokens(jdText)) {
    if (t.length < 4) continue;
    if (rTok.has(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

export interface SuggestedSkill {
  name: string;
  resource?: string;
}

export interface AnalysisResult {
  matchPercent: number;
  rankScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestedSkills: SuggestedSkill[];
  jdSkills: string[];
  resumeSkills: string[];
  keywordOverlap: number;
  feedback: string[];
}

export function analyze(resumeText: string, jdText: string): AnalysisResult {
  const rSkills = extractSkills(resumeText);
  const jSkills = extractSkills(jdText);

  const matched = [...jSkills].filter(s => rSkills.has(s));
  let missing = [...jSkills].filter(s => !rSkills.has(s));

  // If the JD has no recognized skills (or very few missing), fall back to keyword gaps
  if (missing.length < 3) {
    const fallback = extractFallbackGaps(jdText, resumeText);
    for (const f of fallback) {
      if (!missing.includes(f) && !rSkills.has(f)) missing.push(f);
    }
  }

  // Keyword overlap (broader)
  const rTok = new Set(tokens(resumeText));
  const jTok = tokens(jdText);
  const overlap = jTok.filter(t => rTok.has(t)).length;
  const keywordOverlap = jTok.length ? Math.round((overlap / jTok.length) * 100) : 0;

  const skillMatch = jSkills.size ? (matched.length / jSkills.size) * 100 : keywordOverlap;
  const matchPercent = Math.round(skillMatch * 0.7 + keywordOverlap * 0.3);

  const rankScore = Math.min(100, Math.round(matchPercent * 0.85 + Math.min(rSkills.size, 20) * 0.75));

  const suggested: SuggestedSkill[] = missing.slice(0, 8).map(name => ({
    name,
    resource: LEARN_LINKS[name],
  }));

  const feedback: string[] = [];
  if (matchPercent >= 80) feedback.push('Excellent match — your profile aligns strongly with this role.');
  else if (matchPercent >= 60) feedback.push('Good match. Address the missing skills to strengthen your application.');
  else if (matchPercent >= 40) feedback.push('Moderate match. Consider tailoring your resume to highlight relevant experience.');
  else feedback.push('Low match. Significant skill gaps detected — focus on the suggested skills below.');

  if (missing.length > 0) feedback.push(`Add experience or projects related to: ${missing.slice(0, 3).join(', ')}.`);
  if (rSkills.size < 5) feedback.push('Your resume mentions few recognizable technical skills. Be specific about tools used.');
  if (suggested.some(s => s.resource)) feedback.push('Click any suggested skill below to open a free learning resource.');

  return {
    matchPercent,
    rankScore,
    matchedSkills: matched,
    missingSkills: missing,
    suggestedSkills: suggested,
    jdSkills: [...jSkills],
    resumeSkills: [...rSkills],
    keywordOverlap,
    feedback,
  };
}

async function extractPdf(file: File): Promise<string> {
  // Dynamic import keeps initial bundle small
  const pdfjs: any = await import('pdfjs-dist/build/pdf.mjs');
  // Use a CDN worker to avoid bundler config
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(' ') + '\n';
  }
  return text;
}

async function extractDocx(file: File): Promise<string> {
  const mammoth: any = await import('mammoth/mammoth.browser');
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value || '';
}

export async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  try {
    if (ext === 'txt' || ext === 'md') return await file.text();
    if (ext === 'pdf') return await extractPdf(file);
    if (ext === 'docx') return await extractDocx(file);
    if (ext === 'doc') {
      // Legacy .doc isn't reliably parseable in-browser; fall through to best-effort text
    }
  } catch (err) {
    console.error('File parse failed, falling back to raw text:', err);
  }
  // Best-effort fallback: strip non-printable bytes
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if ((c >= 32 && c < 127) || c === 10 || c === 13) str += String.fromCharCode(c);
    else str += ' ';
  }
  return str;
}
