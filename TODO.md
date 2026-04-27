# TODO: Java Spring Boot Backend + MySQL Integration

## Phase 1: Backend Setup
- [x] Create TODO.md
- [x] Create backend/ directory with Maven structure
- [x] Create pom.xml with Spring Boot, JPA, MySQL, JWT, Lombok deps
- [x] Create application.properties with DB config
- [x] Create main application class
- [x] Create JPA Entities (User, Job, Resume, Analysis, Candidate)
- [x] Create Repositories
- [x] Create DTOs
- [x] Create JWT Config (SecurityConfig, JwtUtil, JwtFilter)
- [x] Create Services (User, Job, Resume, Analysis, Candidate)
- [x] Create Controllers (Auth, Job, Resume, Analysis, Candidate, Admin)

## Phase 2: Frontend Integration
- [x] Create src/lib/api.ts (Axios instance)
- [x] Create src/lib/auth.tsx (Auth context)
- [x] Update src/lib/jobs.ts (Replace localStorage with API)
- [x] Update src/pages/dashboard/Login.tsx (Real auth)
- [x] Update src/pages/dashboard/Candidate.tsx (Backend upload + analyze)
- [x] Update src/pages/dashboard/Recruiter.tsx (Backend jobs + candidates)
- [x] Update src/pages/dashboard/Admin.tsx (Backend stats)
- [x] Update src/App.tsx (Auth provider + protected routes)

## Phase 3: Testing
- [ ] Create MySQL database
- [ ] Start backend
- [ ] Start frontend
- [ ] Test all flows

