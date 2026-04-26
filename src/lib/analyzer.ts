// Lightweight client-side resume vs JD keyword analyzer
const STOPWORDS = new Set(`a an and or but if then so of in on at to for from with by as is are was were be been being have has had do does did will would shall should may might must can could the this that these those it its we you they them our your their not no nor any all some such only own same than too very into through during before after above below up down out off over under again further once here there when where why how about against between because while not also more most other some only into we i me my mine us your you he she his her him etc using based use used per via etc include including required preferred ability years experience work working`.split(/\s+/));

const SKILL_DICT = [
  'javascript','typescript','react','nextjs','node','nodejs','express','java','spring','python','django','flask','fastapi','sql','mysql','postgres','postgresql','mongodb','redis','docker','kubernetes','aws','azure','gcp','terraform','linux','git','ci/cd','jenkins','graphql','rest','api','html','css','tailwind','sass','figma','agile','scrum','jira','tdd','testing','jest','cypress','selenium','machine learning','ml','ai','tensorflow','pytorch','nlp','data analysis','pandas','numpy','excel','powerbi','tableau','communication','leadership','teamwork','problem solving','c++','c#','.net','php','laravel','ruby','rails','go','golang','rust','swift','kotlin','android','ios','flutter','react native','firebase','supabase','microservices','kafka','rabbitmq','elasticsearch','figma','photoshop','seo','marketing','analytics','product management'
];

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
    const pat = ' ' + skill + ' ';
    if (norm.includes(pat)) found.add(skill);
  });
  return found;
}

export interface AnalysisResult {
  matchPercent: number;
  rankScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestedSkills: string[];
  jdSkills: string[];
  resumeSkills: string[];
  keywordOverlap: number;
  feedback: string[];
}

export function analyze(resumeText: string, jdText: string): AnalysisResult {
  const rSkills = extractSkills(resumeText);
  const jSkills = extractSkills(jdText);

  const matched = [...jSkills].filter(s => rSkills.has(s));
  const missing = [...jSkills].filter(s => !rSkills.has(s));

  // Keyword overlap (broader)
  const rTok = new Set(tokens(resumeText));
  const jTok = tokens(jdText);
  const overlap = jTok.filter(t => rTok.has(t)).length;
  const keywordOverlap = jTok.length ? Math.round((overlap / jTok.length) * 100) : 0;

  const skillMatch = jSkills.size ? (matched.length / jSkills.size) * 100 : keywordOverlap;
  const matchPercent = Math.round(skillMatch * 0.7 + keywordOverlap * 0.3);

  const rankScore = Math.min(100, Math.round(matchPercent * 0.85 + Math.min(rSkills.size, 20) * 0.75));

  const suggested = missing.slice(0, 6);

  const feedback: string[] = [];
  if (matchPercent >= 80) feedback.push('Excellent match — your profile aligns strongly with this role.');
  else if (matchPercent >= 60) feedback.push('Good match. Address the missing skills to strengthen your application.');
  else if (matchPercent >= 40) feedback.push('Moderate match. Consider tailoring your resume to highlight relevant experience.');
  else feedback.push('Low match. Significant skill gaps detected — focus on the suggested skills below.');

  if (missing.length > 0) feedback.push(`Add experience or projects related to: ${missing.slice(0,3).join(', ')}.`);
  if (rSkills.size < 5) feedback.push('Your resume mentions few recognizable technical skills. Be specific about tools used.');

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

export async function readFileAsText(file: File): Promise<string> {
  // For PDF/DOC we can't truly parse without libs — read as text best-effort
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'txt' || ext === 'md') return file.text();
  // Best-effort: try as text, strip non-printable
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
