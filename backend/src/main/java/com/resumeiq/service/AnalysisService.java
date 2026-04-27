package com.resumeiq.service;

import com.resumeiq.dto.AnalysisRequest;
import com.resumeiq.dto.AnalysisResponse;
import com.resumeiq.model.Analysis;
import com.resumeiq.model.Job;
import com.resumeiq.model.Resume;
import com.resumeiq.repository.AnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisRepository analysisRepository;

    private static final Set<String> STOPWORDS = new HashSet<>(Arrays.asList(
        "a","an","and","or","but","if","then","so","of","in","on","at","to","for","from","with","by","as","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","shall","should","may","might","must","can","could","the","this","that","these","those","it","its","we","you","they","them","our","your","their","not","no","nor","any","all","some","such","only","own","same","than","too","very","into","through","during","before","after","above","below","up","down","out","off","over","under","again","further","once","here","there","when","where","why","how","about","against","between","because","while","also","more","most","other","into","i","me","my","mine","us","he","she","his","her","him","etc","using","based","use","used","per","via","include","including","required","preferred","ability","years","experience","work","working","role","job","position","company","team","responsibilities","requirements","qualifications","candidate","candidates","apply","applying","applicant","must","should","good","strong","excellent","solid","proven","hands-on","hands","knowledge","understanding","familiar","familiarity","plus","bonus","nice","have","having","looking","seeking","want","need","needed","ideal","great","well"
    ));

    private static final List<String> SKILL_DICT = Arrays.asList(
        "javascript","typescript","python","java","c++","c#",".net","php","ruby","go","golang","rust","swift","kotlin","scala","r","matlab","bash","shell","sql","html","css","sass","scss",
        "react","nextjs","next.js","vue","vuejs","angular","svelte","redux","zustand","tailwind","bootstrap","material ui","mui","chakra","styled components","webpack","vite","remix","astro","jquery",
        "node","nodejs","express","nestjs","spring","spring boot","django","flask","fastapi","laravel","rails","asp.net","gin","fiber","symfony","graphql","rest","rest api","grpc","websocket","microservices","soap",
        "mysql","postgres","postgresql","mongodb","redis","sqlite","dynamodb","cassandra","elasticsearch","firebase","supabase","prisma","sequelize","typeorm","mongoose",
        "aws","azure","gcp","google cloud","docker","kubernetes","terraform","ansible","jenkins","github actions","gitlab ci","circleci","ci/cd","linux","nginx","apache","helm","prometheus","grafana","datadog","splunk","cloudformation","serverless","lambda",
        "android","ios","flutter","react native","xamarin","ionic",
        "machine learning","deep learning","nlp","computer vision","tensorflow","pytorch","keras","scikit-learn","pandas","numpy","spark","hadoop","airflow","kafka","rabbitmq","etl","data analysis","data science","data engineering","power bi","powerbi","tableau","looker","excel","statistics",
        "jest","mocha","cypress","playwright","selenium","vitest","junit","pytest","tdd","bdd","unit testing","integration testing","e2e",
        "git","github","gitlab","bitbucket","jira","confluence","figma","sketch","adobe xd","photoshop","illustrator","agile","scrum","kanban","waterfall",
        "oauth","jwt","saml","encryption","penetration testing","owasp","siem","cybersecurity","iam",
        "communication","leadership","teamwork","problem solving","collaboration","mentoring","stakeholder management","project management","product management","presentation",
        "seo","sem","google analytics","content marketing","copywriting","email marketing"
    );

    private static final Map<String, String> SYNONYMS = new LinkedHashMap<>();
    static {
        String[][] syns = {
            {"react.js","react"},{"reactjs","react"},{"react js","react"},
            {"react-native","react native"},{"reactnative","react native"},
            {"node.js","nodejs"},{"node js","node"},
            {"next.js","nextjs"},{"next js","nextjs"},
            {"nuxt.js","vuejs"},{"nuxtjs","vuejs"},
            {"vue.js","vuejs"},{"vue js","vuejs"},{"vue","vuejs"},
            {"angular.js","angular"},{"angularjs","angular"},
            {"js","javascript"},{"ecmascript","javascript"},{"es6","javascript"},{"es2015","javascript"},
            {"ts","typescript"},
            {"springboot","spring boot"},{"spring-boot","spring boot"},
            {"asp net","asp.net"},{"aspnet","asp.net"},{"dotnet",".net"},{"dot net",".net"},
            {"rest apis","rest api"},{"restful","rest api"},{"restful api","rest api"},{"restful apis","rest api"},
            {"postgres sql","postgresql"},{"postgre","postgresql"},{"pg","postgresql"},
            {"mongo","mongodb"},{"mongo db","mongodb"},
            {"ms sql","sql"},{"mssql","sql"},{"tsql","sql"},{"t-sql","sql"},{"plsql","sql"},{"pl/sql","sql"},
            {"amazon web services","aws"},{"aws cloud","aws"},
            {"google cloud platform","gcp"},{"google cloud","gcp"},
            {"microsoft azure","azure"},
            {"k8s","kubernetes"},{"kube","kubernetes"},
            {"github-actions","github actions"},{"gh actions","github actions"},
            {"gitlab-ci","gitlab ci"},{"gitlabci","gitlab ci"},
            {"cicd","ci/cd"},{"ci cd","ci/cd"},{"continuous integration","ci/cd"},{"continuous delivery","ci/cd"},
            {"ml","machine learning"},{"dl","deep learning"},
            {"natural language processing","nlp"},
            {"cv","computer vision"},
            {"tensor flow","tensorflow"},
            {"sci-kit learn","scikit-learn"},{"sklearn","scikit-learn"},{"scikit learn","scikit-learn"},
            {"power-bi","power bi"},{"power bi desktop","power bi"},
            {"c sharp","c#"},{"csharp","c#"},
            {"cpp","c++"},{"c plus plus","c++"},
            {"go lang","golang"},{"go-lang","golang"},
            {"tailwindcss","tailwind"},{"tailwind css","tailwind"},
            {"material-ui","material ui"},{"materialui","material ui"},
            {"github enterprise","github"},
            {"atlassian jira","jira"},
            {"test driven development","tdd"},
            {"behavior driven development","bdd"},
            {"end to end testing","e2e"},{"end-to-end","e2e"}
        };
        // Sort by length descending for proper replacement
        Arrays.sort(syns, (a, b) -> Integer.compare(b[0].length(), a[0].length()));
        for (String[] s : syns) {
            SYNONYMS.put(s[0], s[1]);
        }
    }

    private static final Map<String, String> LEARN_LINKS = new HashMap<>();
    static {
        LEARN_LINKS.put("react", "https://react.dev/learn");
        LEARN_LINKS.put("typescript", "https://www.typescriptlang.org/docs/handbook/intro.html");
        LEARN_LINKS.put("javascript", "https://javascript.info/");
        LEARN_LINKS.put("python", "https://docs.python.org/3/tutorial/");
        LEARN_LINKS.put("java", "https://dev.java/learn/");
        LEARN_LINKS.put("next.js", "https://nextjs.org/learn");
        LEARN_LINKS.put("nextjs", "https://nextjs.org/learn");
        LEARN_LINKS.put("nodejs", "https://nodejs.org/en/learn");
        LEARN_LINKS.put("node", "https://nodejs.org/en/learn");
        LEARN_LINKS.put("sql", "https://sqlbolt.com/");
        LEARN_LINKS.put("postgresql", "https://www.postgresqltutorial.com/");
        LEARN_LINKS.put("mongodb", "https://learn.mongodb.com/");
        LEARN_LINKS.put("docker", "https://docs.docker.com/get-started/");
        LEARN_LINKS.put("kubernetes", "https://kubernetes.io/docs/tutorials/");
        LEARN_LINKS.put("aws", "https://aws.amazon.com/training/");
        LEARN_LINKS.put("azure", "https://learn.microsoft.com/azure/");
        LEARN_LINKS.put("gcp", "https://cloud.google.com/training");
        LEARN_LINKS.put("graphql", "https://graphql.org/learn/");
        LEARN_LINKS.put("tailwind", "https://tailwindcss.com/docs");
        LEARN_LINKS.put("git", "https://learngitbranching.js.org/");
        LEARN_LINKS.put("ci/cd", "https://docs.github.com/actions");
        LEARN_LINKS.put("machine learning", "https://www.coursera.org/learn/machine-learning");
        LEARN_LINKS.put("tensorflow", "https://www.tensorflow.org/tutorials");
        LEARN_LINKS.put("pytorch", "https://pytorch.org/tutorials/");
        LEARN_LINKS.put("data analysis", "https://www.kaggle.com/learn");
        LEARN_LINKS.put("pandas", "https://pandas.pydata.org/docs/getting_started/");
        LEARN_LINKS.put("figma", "https://help.figma.com/");
        LEARN_LINKS.put("agile", "https://www.atlassian.com/agile");
        LEARN_LINKS.put("scrum", "https://www.scrum.org/resources");
        LEARN_LINKS.put("jest", "https://jestjs.io/docs/getting-started");
        LEARN_LINKS.put("cypress", "https://docs.cypress.io/guides/getting-started/installing-cypress");
        LEARN_LINKS.put("go", "https://go.dev/learn/");
        LEARN_LINKS.put("golang", "https://go.dev/learn/");
        LEARN_LINKS.put("rust", "https://doc.rust-lang.org/book/");
        LEARN_LINKS.put("flutter", "https://docs.flutter.dev/");
        LEARN_LINKS.put("react native", "https://reactnative.dev/docs/getting-started");
    }

    public AnalysisResponse analyze(AnalysisRequest request) {
        String resumeText = request.getResumeText() != null ? request.getResumeText() : "";
        String jdText = request.getJdText() != null ? request.getJdText() : "";

        Set<String> rSkills = extractSkills(resumeText);
        Set<String> jSkills = extractSkills(jdText);

        Set<String> rTokSet = new HashSet<>(tokens(resumeText));
        List<String> jTok = tokens(jdText);

        List<String> jdKeywords = extractJdKeywords(jdText);
        Set<String> requiredTerms = new HashSet<>();
        requiredTerms.addAll(jSkills);
        requiredTerms.addAll(jdKeywords);

        List<String> matchedAll = requiredTerms.stream()
                .filter(t -> rSkills.contains(t) || rTokSet.contains(t))
                .collect(Collectors.toList());
        List<String> missingAll = requiredTerms.stream()
                .filter(t -> !rSkills.contains(t) && !rTokSet.contains(t))
                .collect(Collectors.toList());

        List<String> matched = jSkills.stream().filter(rSkills::contains).collect(Collectors.toList());
        List<String> missing = jSkills.stream().filter(s -> !rSkills.contains(s)).collect(Collectors.toList());

        long overlap = jTok.stream().filter(rTokSet::contains).count();
        int keywordOverlap = jTok.isEmpty() ? 0 : (int) Math.round((overlap * 100.0) / jTok.size());

        int termCoverage = requiredTerms.isEmpty() ? 0 : (int) Math.round((matchedAll.size() * 100.0) / requiredTerms.size());
        int skillMatch = jSkills.isEmpty() ? termCoverage : (int) Math.round((matched.size() * 100.0) / jSkills.size());

        int matchPercent = Math.max(0, Math.min(100, (int) Math.round(skillMatch * 0.45 + termCoverage * 0.35 + keywordOverlap * 0.2)));
        int rankScore = Math.min(100, (int) Math.round(matchPercent * 0.8 + Math.min(rSkills.size(), 20) * 1.0));

        List<AnalysisResponse.SuggestedSkill> suggested = missing.stream()
                .limit(8)
                .map(name -> AnalysisResponse.SuggestedSkill.builder()
                        .name(name)
                        .resource(LEARN_LINKS.get(name))
                        .build())
                .collect(Collectors.toList());

        List<String> feedback = new ArrayList<>();
        if (matchPercent >= 80) feedback.add("Excellent match — your profile aligns strongly with this role.");
        else if (matchPercent >= 60) feedback.add("Good match. Address the missing skills to strengthen your application.");
        else if (matchPercent >= 40) feedback.add("Moderate match. Consider tailoring your resume to highlight relevant experience.");
        else feedback.add("Low match. Significant skill gaps detected — focus on the suggested skills below.");

        if (!missing.isEmpty()) feedback.add("Add experience or projects related to: " + String.join(", ", missing.stream().limit(3).collect(Collectors.toList())) + ".");
        if (rSkills.size() < 5) feedback.add("Your resume mentions few recognizable technical skills. Be specific about tools used.");
        if (suggested.stream().anyMatch(s -> s.getResource() != null)) feedback.add("Click any suggested skill below to open a free learning resource.");
        if (jSkills.isEmpty()) feedback.add("No standard skills were detected in the JD — match score is based on overall keyword coverage.");

        return AnalysisResponse.builder()
                .matchPercent(matchPercent)
                .rankScore(rankScore)
                .keywordOverlap(keywordOverlap)
                .matchedSkills(matched)
                .missingSkills(missing)
                .suggestedSkills(suggested)
                .jdSkills(new ArrayList<>(jSkills))
                .resumeSkills(new ArrayList<>(rSkills))
                .feedback(feedback)
                .build();
    }

    public Analysis saveAnalysis(Analysis analysis) {
        return analysisRepository.save(analysis);
    }

    public List<Analysis> getUserAnalyses(Long userId) {
        return analysisRepository.findByResumeUserId(userId);
    }

    private String normalize(String text) {
        return text.toLowerCase().replaceAll("[^a-z0-9+#./\\s-]", " ").replaceAll("\\s+", " ").trim();
    }

    private String applySynonyms(String normalized) {
        String out = " " + normalized + " ";
        for (Map.Entry<String, String> entry : SYNONYMS.entrySet()) {
            String regex = "(?<=[^a-z0-9+#./-])" + Pattern.quote(entry.getKey()) + "(?=[^a-z0-9+#./-])";
            out = out.replaceAll(regex, entry.getValue());
        }
        return out.trim().replaceAll("\\s+", " ");
    }

    private List<String> tokens(String text) {
        String normalized = applySynonyms(normalize(text));
        return Arrays.stream(normalized.split(" "))
                .filter(w -> w.length() > 2 && !STOPWORDS.contains(w))
                .collect(Collectors.toList());
    }

    private Set<String> extractSkills(String text) {
        String norm = " " + applySynonyms(normalize(text)) + " ";
        Set<String> found = new LinkedHashSet<>();
        for (String skill : SKILL_DICT) {
            if (norm.contains(" " + skill + " ")) {
                found.add(skill);
            }
        }
        return found;
    }

    private List<String> extractJdKeywords(String jdText) {
        Map<String, Integer> counts = new HashMap<>();
        for (String t : tokens(jdText)) {
            if (t.length() < 4) continue;
            counts.merge(t, 1, Integer::sum);
        }
        return counts.entrySet().stream()
                .sorted((a, b) -> {
                    int cmp = Integer.compare(b.getValue(), a.getValue());
                    return cmp != 0 ? cmp : Integer.compare(b.getKey().length(), a.getKey().length());
                })
                .limit(15)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}

