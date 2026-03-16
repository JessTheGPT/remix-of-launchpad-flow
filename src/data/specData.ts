// Elite 9-Agent Launch Squad - Complete Production Specification Data

export interface AgentTool {
  name: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  persona: string;
  goal: string;
  mission: string;
  outputs: string[];
  flag?: string;
  tools: AgentTool[];
  rules: string[];
  constraints: string[];
  hitl?: boolean;
  terminationRules?: string[];
  decisionMatrix?: { condition: string; stack: string; reason: string }[];
  mandatoryStack?: string[];
  qualityGates?: string[];
  codeExample?: string;
  outputTemplate?: string;
}

export interface StateField {
  name: string;
  type: string;
  description: string;
  example?: string;
}

export interface StateGroup {
  name: string;
  fields: StateField[];
}

export interface ErrorHandler {
  type: string;
  trigger: string;
  action: string;
  icon: string;
  loopTarget?: string;
  critical?: boolean;
}

export interface RepoItem {
  name: string;
  type: 'folder' | 'file';
  children?: RepoItem[];
  preview?: string;
  generatedBy?: string;
}

export interface FailureMode {
  failure: string;
  recovery: string;
  icon: string;
}

export interface FinalOutput {
  agent: string;
  outputFiles: string[];
  validationFlag: string;
}

export const agents: Agent[] = [
  {
    id: 'A1',
    name: 'Market Strategist',
    role: 'Market Research & Validation',
    persona: 'Dror Poleg (ex-a16z, startup killer)',
    goal: 'Validate or kill the idea **before any code is written**',
    mission: 'Validate market opportunity and competitive landscape before any code is written',
    outputs: ['00_VISION/MARKET_VALIDATION.md'],
    flag: 'market_validated',
    tools: [
      { name: 'search', description: 'Google Search API (top 10 results + snippets)' },
      { name: 'scrape', description: 'Scrape URL to clean Markdown' },
      { name: 'similarweb', description: 'Return visits, bounce rate, time-on-site for a domain' },
      { name: 'crunchbase', description: 'Return funding rounds, revenue (if public), team size' },
      { name: 'getlatka', description: 'Return exact MRR/ARR if available' },
      { name: 'reddit_search', description: 'Search Reddit (top posts, past year)' },
      { name: 'x_keyword_search', description: 'Search X/Twitter (from_date: 2024-01-01)' }
    ],
    rules: [
      'Cross-check every claim with at least 2 sources',
      'If sources conflict, default to lower number and flag for review',
      'TAM/SAM/SOM must be quantified with sources',
      'No assumptions without evidence'
    ],
    constraints: [
      'Cannot proceed without founder profile',
      'Must cite all sources',
      'Rejection resets entire pipeline'
    ],
    terminationRules: [
      'If TAM < $1B, set market_validated = False and terminate',
      'If no clear 10× advantage, set market_validated = False and terminate'
    ],
    outputTemplate: `# MARKET VALIDATION — FINAL VERDICT
Idea: {{state["raw_idea"]}}

## 1. TAM / SAM / SOM (2025–2030)
- Total Addressable Market: $X.XB ([Source](#))
- Serviceable Available Market: $X.XB
- Serviceable Obtainable Market (Year 3): $XM

## 2. Top 5 Competitors
| Rank | Name | MRR | Funding | Monthly Visits | Biggest Weakness | Source |
|------|------|-----|---------|----------------|------------------|--------|
| 1 | Otter.ai | $12M | $63M | 9.2M | Robotic emails | [GetLatka](#) |

## 3. Pricing Benchmarks
- Average: $XX/user/mo
- Willingness to Pay Ceiling: $XX–$XX/user/mo ([Source](#))

## 4. Distribution Channels (Week 1)
1. Zoom App Marketplace (10M+ users)
2. Google Workspace Marketplace

## 5. Regulatory Risk (0–10): X
## 6. Founder–Market Fit (0–10): X
## 7. 10× Better Comparison (Mermaid diagram)

**FINAL VERDICT:** VALIDATED — PROCEED TO VISIONARY`
  },
  {
    id: 'A2',
    name: 'Visionary PM',
    role: 'Product Vision & Scope Definition',
    persona: 'Shishir Mehrotra + April Underwood',
    goal: 'Lock scope to **6 features max**. No exceptions.',
    mission: 'Transform validated market insights into actionable product specs with locked scope',
    outputs: ['00_VISION/VISION.md', '00_VISION/SCOPE.md', '00_VISION/ACCEPTANCE.md', '00_VISION/BACKLOG.md'],
    flag: 'scope_locked',
    hitl: true,
    tools: [
      { name: 'document_generator', description: 'Generate structured Markdown documents' },
      { name: 'priority_ranker', description: 'Rank features by impact/effort' },
      { name: 'story_mapper', description: 'Create user story maps' }
    ],
    rules: [
      'MVP scope must be achievable in 2-week sprint',
      'Max 6 features in SCOPE.md',
      'No feature > 11 days effort (flag for backlog)',
      'Acceptance criteria must be binary (Given/When/Then)'
    ],
    constraints: [
      'Requires market_validated = true',
      'HITL approval mandatory',
      'Scope changes go to backlog after lock'
    ],
    outputTemplate: `# SCOPE — LOCKED — NO ADDITIONS WITHOUT FOUNDER UNLOCK
We ship exactly these 6 things and nothing else:
1. One-click join from Google Calendar/Zoom invite
2. 99.9% accurate transcript in <15s post-call
3. Action items with assignee + due date (98%+ accuracy)
4. 3-paragraph follow-up email in user's voice
5. ≤2-word edits → Send via Gmail/Outlook
6. Admin dashboard + Lemon Squeezy billing

SCOPE LOCKED — NO CHANGES WITHOUT EXPLICIT FOUNDER COMMAND`
  },
  {
    id: 'A3',
    name: 'Systems Architect',
    role: 'Technical Architecture Design',
    persona: 'Lead Vercel Architect',
    goal: 'Define the **entire tech stack** and **fail fast** if constraints aren\'t met',
    mission: 'Design scalable, secure system architecture aligned with product vision',
    outputs: ['01_ARCHITECTURE/ARCHITECTURE.md', '01_ARCHITECTURE/ERD.mmd', '01_ARCHITECTURE/API_CONTRACTS.openapi.yaml'],
    flag: 'architecture_approved',
    tools: [
      { name: 'diagram_generator', description: 'Generate Mermaid ERD and flow diagrams' },
      { name: 'openapi_builder', description: 'Generate OpenAPI 3.1 specifications' },
      { name: 'tech_stack_advisor', description: 'Recommend stack based on constraints' }
    ],
    rules: [
      'Must support 10x initial load estimate',
      'All endpoints documented in OpenAPI 3.1',
      'Database schema must be normalized (3NF)',
      'Security considerations in every component'
    ],
    constraints: [
      'Requires scope_locked = true',
      'No proprietary lock-in without approval',
      'API contracts conflict → loop back to A2'
    ],
    decisionMatrix: [
      { condition: '<10k users, no HIPAA', stack: 'Neon Serverless + Vercel', reason: 'Cheapest + instant scaling' },
      { condition: '>10k users or HIPAA', stack: 'Supabase Pro + Stripe', reason: 'RLS + compliance' }
    ],
    mandatoryStack: [
      'Next.js 15 App Router',
      'React 19 + Server Components',
      'tRPC v11',
      'Prisma 5 + Prisma Accelerate',
      'Postgres (Neon/Supabase)',
      'Clerk Auth',
      'Lemon Squeezy Billing',
      'Resend Email',
      'Upstash Redis',
      'Trigger.dev (background jobs)',
      'Playwright E2E'
    ]
  },
  {
    id: 'A4',
    name: 'UI Specialist',
    role: 'Interface Design & Prototyping',
    persona: 'Linear Design Lead',
    goal: 'Ship a **single, high-fidelity app/page.tsx** with waitlist functionality',
    mission: 'Create intuitive, accessible UI components and design system',
    outputs: ['02_CODE/app/page.tsx'],
    tools: [
      { name: 'component_generator', description: 'Generate React + Tailwind components' },
      { name: 'accessibility_checker', description: 'Validate WCAG 2.1 AA compliance' },
      { name: 'design_tokenizer', description: 'Generate design tokens from specs' }
    ],
    rules: [
      'WCAG 2.1 AA compliance required',
      'Mobile-first responsive design',
      'Use Tailwind CSS + Framer Motion + Lucide + shadcn/ui',
      'Production-ready, no mocks, no TODOs'
    ],
    constraints: [
      'Requires architecture_approved = true',
      'Must use approved tech stack',
      'No third-party UI libraries without review'
    ],
    codeExample: `"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-foreground to-primary">
          Never write meeting notes again
        </h1>
        <form className="mt-12 max-w-md mx-auto flex gap-2">
          <Input type="email" placeholder="you@company.com" className="h-12" />
          <Button type="submit" size="lg" className="h-12 gap-2">
            Join Waitlist <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}`
  },
  {
    id: 'A5',
    name: 'Frontend Engineer',
    role: 'Frontend Implementation',
    persona: 'Ex-Cal.com/Vercel',
    goal: 'Implement **every line of code** in SCOPE.md with **zero technical debt**',
    mission: 'Build performant, tested frontend following UI specifications',
    outputs: ['02_CODE/ (frontend + tests)'],
    tools: [
      { name: 'code_generator', description: 'Generate TypeScript React components' },
      { name: 'test_runner', description: 'Run Playwright E2E tests' },
      { name: 'bundle_analyzer', description: 'Analyze bundle size and tree-shaking' }
    ],
    rules: [
      'Next.js App Router only',
      'All data fetching via Server Actions or tRPC',
      'Every mutation wrapped in catchAsync',
      'Skeleton loaders for all async UI',
      'Sonner toasts for mutations'
    ],
    constraints: [
      'Must match UI specs exactly',
      'No direct API calls (use services)',
      'All state management documented'
    ],
    qualityGates: [
      'TypeScript strict: true',
      'ESLint/Prettier clean',
      'Playwright suite <12s',
      'Lighthouse ≥98 (mobile), 100 (desktop)',
      'Bundle <180kb gzipped'
    ]
  },
  {
    id: 'A6',
    name: 'Backend Engineer',
    role: 'Backend & Infrastructure',
    persona: 'Ex-Stripe/Prisma',
    goal: '**Zero N+1 queries**, **zero raw SQL**, **zero unhandled errors**',
    mission: 'Implement secure, scalable backend services and data layer',
    outputs: ['02_CODE/ (backend + jobs + tests)'],
    tools: [
      { name: 'api_generator', description: 'Generate tRPC routers and procedures' },
      { name: 'migration_runner', description: 'Run Prisma migrations' },
      { name: 'job_scheduler', description: 'Schedule Trigger.dev background jobs' }
    ],
    rules: [
      'Prisma only (no raw SQL)',
      'Every endpoint uses findUniqueOrThrow',
      'Centralized error handling with AppError class',
      'Trigger.dev for background jobs'
    ],
    constraints: [
      'Requires architecture_approved = true',
      'Database migrations must be reversible',
      'No raw SQL without parameterization'
    ],
    codeExample: `export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}`
  },
  {
    id: 'A7',
    name: 'Security Auditor',
    role: 'Security Review & Hardening',
    persona: 'SOC2 Lead',
    goal: '**Block deployment** if any vulnerability exists',
    mission: 'Identify vulnerabilities and ensure security best practices',
    outputs: ['03_REVIEW_LOGS/security_audit.md'],
    flag: 'security_verified',
    tools: [
      { name: 'static_analysis_scanner', description: 'Run SAST on codebase' },
      { name: 'dependency_checker', description: 'Check for vulnerable dependencies' },
      { name: 'sql_injection_tester', description: 'Test for SQL injection vulnerabilities' }
    ],
    rules: [
      'OWASP Top 10 must be addressed',
      'No critical/high vulnerabilities allowed',
      'All secrets must use vault/env',
      'CSP headers configured'
    ],
    constraints: [
      'Blocks deployment if security_verified = false',
      'Can halt pipeline for critical issues',
      'Must sign off on all third-party deps'
    ],
    codeExample: `-- Row-Level Security Policy
CREATE POLICY "Users access only their data"
ON meetings FOR SELECT 
USING (auth.uid() = user_id);

-- Required Auth Configuration:
-- Clerk Auth with:
-- - Email + Google + Microsoft + Passkeys
-- - MFA enforced
-- - HTTP-only + SameSite=strict session tokens`
  },
  {
    id: 'A8',
    name: 'Growth Lead',
    role: 'Growth & Monetization',
    persona: 'Ex-Notion Growth',
    goal: '**500+ waitlist emails** before launch',
    mission: 'Implement growth loops, waitlist, and payment infrastructure',
    outputs: ['growth/WAITLIST_STRATEGY.md', 'growth/SOCIAL_ASSETS.json', 'pricing/checkout'],
    tools: [
      { name: 'analytics_integrator', description: 'Set up event tracking' },
      { name: 'payment_processor', description: 'Configure Lemon Squeezy checkout' },
      { name: 'email_automator', description: 'Set up Resend email sequences' }
    ],
    rules: [
      'Analytics on all key events',
      'A/B test framework ready',
      'Payment flow PCI compliant',
      'Unsubscribe in all emails'
    ],
    constraints: [
      'Requires security_verified = true',
      'Payment provider must be approved',
      'GDPR consent flows mandatory'
    ],
    outputTemplate: `// growth/SOCIAL_ASSETS.json
{
  "tweets": [
    {
      "copy": "We just hit 1,000 waitlist signups for Notato.ai! Join the revolution: [URL]",
      "image": "social-card.png"
    }
  ],
  "pricing_tiers": [
    { "name": "Free", "price": 0 },
    { "name": "Pro", "price": 59 },
    { "name": "Team", "price": 99 }
  ]
}`
  },
  {
    id: 'A9',
    name: 'SRE/Ops/Legal',
    role: 'Deployment, Operations & Compliance',
    persona: 'Ex-Netflix SRE',
    goal: '**Zero downtime**, **zero legal risk**',
    mission: 'Ship to production with full operational readiness and legal compliance',
    outputs: ['OPS/DEPLOYMENT.md', '.github/workflows/ci.yml', 'LEGAL/TOS.md', 'LEGAL/PRIVACY.md', 'Production URL'],
    flag: 'deployment_ready',
    hitl: true,
    tools: [
      { name: 'ci_pipeline_builder', description: 'Generate GitHub Actions workflows' },
      { name: 'infra_provisioner', description: 'Provision Vercel + Railway infrastructure' },
      { name: 'legal_doc_generator', description: 'Generate TOS/Privacy via Termly' }
    ],
    rules: [
      'Zero-downtime deployment required',
      'Rollback procedure documented',
      'All legal docs reviewed',
      'Monitoring dashboards configured (Sentry + Logfire + OpenTelemetry)'
    ],
    constraints: [
      'All previous flags must be true',
      'HITL final approval required',
      'Cannot deploy without legal sign-off'
    ],
    codeExample: `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm prisma generate
      - run: pnpm test
      - run: pnpm playwright test
      - run: pnpm build`
  }
];

export const stateGroups: StateGroup[] = [
  {
    name: 'Core Data',
    fields: [
      { name: 'raw_idea', type: 'str', description: 'Original founder input describing the product idea', example: '"AI meeting notetaker that auto-sends follow-up emails"' },
      { name: 'founder_profile', type: 'Dict[str, str]', description: 'Background, skills, constraints of founder', example: '{"experience": "ex-Gong RevOps", "skills": ["Go", "React"]}' },
      { name: 'vision_docs', type: 'Dict[str, str]', description: 'Keys: "MARKET_VALIDATION", "SCOPE", "VISION", "BACKLOG"', example: '{"SCOPE": "# SCOPE..."}' },
      { name: 'architecture_docs', type: 'Dict[str, str]', description: 'Keys: "ARCHITECTURE", "ERD", "API_CONTRACTS"', example: '{"ERD": "erDiagram..."}' },
      { name: 'code_base', type: 'Dict[str, str]', description: 'Keys: file paths, values: file content', example: '{"app/page.tsx": "export default..."}' },
      { name: 'review_logs', type: 'Dict[str, List[str]]', description: 'Keys: agent IDs, values: list of review notes', example: '{"A1": ["TAM verified", "3 competitors found"]}' }
    ]
  },
  {
    name: 'Progress',
    fields: [
      { name: 'current_agent', type: 'Literal["A1"..."A9"]', description: 'Currently active agent', example: '"A3"' },
      { name: 'agent_status', type: 'Dict[str, Literal["pending", "active", "completed", "failed"]]', description: 'Status of each agent', example: '{"A1": "completed", "A2": "completed", "A3": "active"}' },
      { name: 'backlog', type: 'List[str]', description: 'Deferred items and scope creep captures', example: '["Feature: Slack integration (post-$50k MRR)"]' }
    ]
  },
  {
    name: 'Flags',
    fields: [
      { name: 'human_approved', type: 'bool', description: 'Latest HITL checkpoint passed', example: 'true' },
      { name: 'market_validated', type: 'bool', description: 'A1 validated market opportunity', example: 'true' },
      { name: 'scope_locked', type: 'bool', description: 'A2 scope approved, no changes allowed', example: 'true' },
      { name: 'architecture_approved', type: 'bool', description: 'A3 architecture signed off', example: 'true' },
      { name: 'security_verified', type: 'bool', description: 'A7 security audit passed', example: 'false' },
      { name: 'deployment_ready', type: 'bool', description: 'A9 final approval for launch', example: 'false' }
    ]
  },
  {
    name: 'Errors',
    fields: [
      { name: 'last_error', type: 'Optional[Dict[str, str]]', description: 'Most recent error with context', example: '{"agent": "A3", "error": "Prisma schema conflict", "timestamp": "ISO"}' },
      { name: 'retry_count', type: 'int', description: 'Number of retries for current operation', example: '0' }
    ]
  }
];

export const errorHandlers: ErrorHandler[] = [
  {
    type: 'Contract Mismatch',
    trigger: 'API response doesn\'t match OpenAPI spec',
    action: 'Loop back to A3 (Architect) for contract revision',
    icon: 'refresh-cw',
    loopTarget: 'A3'
  },
  {
    type: 'Scope Creep',
    trigger: 'New feature request after scope_locked',
    action: 'Capture to backlog if >11 days effort, continue current sprint',
    icon: 'git-branch',
    loopTarget: 'backlog'
  },
  {
    type: 'API Backoff',
    trigger: 'Rate limit or temporary API failure',
    action: 'Exponential backoff (1s, 2s, 4s, 8s, 16s) with max 5 retries',
    icon: 'clock',
    loopTarget: 'retry'
  },
  {
    type: 'Security Halt',
    trigger: 'Critical vulnerability detected by A7',
    action: 'Immediate pipeline halt, require manual fix',
    icon: 'shield-alert',
    loopTarget: 'HALT',
    critical: true
  },
  {
    type: 'Test Failure',
    trigger: 'Test coverage < 80% or failing tests',
    action: 'Revert to last green commit, retry',
    icon: 'x-circle',
    loopTarget: 'A5/A6'
  }
];

export const failureModes: FailureMode[] = [
  { failure: 'A1 kills the idea', recovery: 'Terminate graph; output KILLED.md', icon: 'skull' },
  { failure: 'A7 blocks deployment', recovery: 'Loop back to A5/A6 for fixes', icon: 'shield-x' },
  { failure: 'A9 CI/CD fails', recovery: 'Revert to last green commit', icon: 'git-branch' },
  { failure: 'HITL rejects scope', recovery: 'Terminate graph; output REJECTED.md', icon: 'x-octagon' }
];

export const finalOutputs: FinalOutput[] = [
  { agent: 'A1', outputFiles: ['00_VISION/MARKET_VALIDATION.md'], validationFlag: 'market_validated' },
  { agent: 'A2', outputFiles: ['00_VISION/SCOPE.md', 'VISION.md', 'ACCEPTANCE.md', 'BACKLOG.md'], validationFlag: 'scope_locked' },
  { agent: 'A3', outputFiles: ['01_ARCHITECTURE/API_CONTRACTS.yaml'], validationFlag: 'architecture_approved' },
  { agent: 'A4', outputFiles: ['02_CODE/app/page.tsx'], validationFlag: 'N/A' },
  { agent: 'A5/A6', outputFiles: ['02_CODE/ (full codebase)'], validationFlag: 'code_review_passed' },
  { agent: 'A7', outputFiles: ['03_REVIEW_LOGS/security_audit.md'], validationFlag: 'security_verified' },
  { agent: 'A8', outputFiles: ['growth/WAITLIST_STRATEGY.md'], validationFlag: 'growth_ready' },
  { agent: 'A9', outputFiles: ['Production URL'], validationFlag: 'deployment_ready' }
];

export const repoTree: RepoItem[] = [
  {
    name: '00_VISION',
    type: 'folder',
    children: [
      { name: 'MARKET_VALIDATION.md', type: 'file', generatedBy: 'A1', preview: `# MARKET VALIDATION — FINAL VERDICT
Idea: AI meeting notetaker that auto-sends follow-up emails

## 1. TAM / SAM / SOM (2025–2030)
- Total Addressable Market: $4.2B ([Grand View Research](#))
- Serviceable Available Market: $890M
- Serviceable Obtainable Market (Year 3): $12M

## 2. Top 5 Competitors
| Rank | Name | MRR | Funding | Monthly Visits |
|------|------|-----|---------|----------------|
| 1 | Otter.ai | $12M | $63M | 9.2M |
| 2 | Fireflies.ai | $8M | $19M | 3.1M |

**FINAL VERDICT:** VALIDATED — PROCEED TO VISIONARY` },
      { name: 'SCOPE.md', type: 'file', generatedBy: 'A2', preview: `# SCOPE — LOCKED — NO ADDITIONS WITHOUT FOUNDER UNLOCK
We ship exactly these 6 things and nothing else:
1. One-click join from Google Calendar/Zoom invite
2. 99.9% accurate transcript in <15s post-call
3. Action items with assignee + due date (98%+ accuracy)
4. 3-paragraph follow-up email in user's voice
5. ≤2-word edits → Send via Gmail/Outlook
6. Admin dashboard + Lemon Squeezy billing

SCOPE LOCKED — NO CHANGES WITHOUT EXPLICIT FOUNDER COMMAND` },
      { name: 'VISION.md', type: 'file', generatedBy: 'A2', preview: `# Product Vision

## Problem Statement
Founders waste 100+ hours on repetitive launch tasks.

## Solution
AI-powered launch automation with 9 specialized agents.

## Target User
Solo founders and small teams launching B2B SaaS.` },
      { name: 'ACCEPTANCE.md', type: 'file', generatedBy: 'A2', preview: `# Acceptance Criteria

## Feature 1: One-Click Join
GIVEN a user with connected calendar
WHEN they click the Notato button in a meeting invite
THEN Notato bot joins the call within 3 seconds

## Feature 2: Transcript Accuracy
GIVEN a completed meeting recording
WHEN transcript is generated
THEN accuracy is ≥99.9% as measured by WER` },
      { name: 'BACKLOG.md', type: 'file', generatedBy: 'A2', preview: `# Product Backlog

| ID | Feature | Priority | Status | Effort |
|----|---------|----------|--------|--------|
| B1 | Slack integration | P2 | Deferred | 14d |
| B2 | Custom email templates | P3 | Backlog | 5d |
| B3 | Multi-language support | P2 | Post-$50k MRR | 21d |

## Forbidden Pre-$50k MRR
- Native mobile apps
- Enterprise SSO
- Self-hosted option` }
    ]
  },
  {
    name: '01_ARCHITECTURE',
    type: 'folder',
    children: [
      { name: 'ARCHITECTURE.md', type: 'file', generatedBy: 'A3', preview: `# System Architecture

## Tech Stack (Mandatory)
- Next.js 15 App Router
- React 19 + Server Components
- tRPC v11
- Prisma 5 + Prisma Accelerate
- Postgres (Neon Serverless)
- Clerk Auth
- Lemon Squeezy Billing
- Resend Email
- Upstash Redis
- Trigger.dev (background jobs)

## Decision: <10k users, no HIPAA
→ Neon Serverless + Vercel (cheapest + instant scaling)` },
      { name: 'ERD.mmd', type: 'file', generatedBy: 'A3', preview: `erDiagram
    USER ||--o{ MEETING : owns
    USER ||--o{ SUBSCRIPTION : has
    MEETING ||--|{ TRANSCRIPT : contains
    MEETING ||--o{ ACTION_ITEM : generates
    ACTION_ITEM }o--|| USER : assigned_to
    SUBSCRIPTION ||--|| PLAN : references` },
      { name: 'API_CONTRACTS.openapi.yaml', type: 'file', generatedBy: 'A3', preview: `openapi: "3.1.0"
info:
  title: Notato API
  version: "1.0.0"
paths:
  /api/meetings:
    get:
      summary: List user meetings
      security:
        - ClerkAuth: []
      responses:
        200:
          description: Array of meetings
  /api/meetings/{id}/transcript:
    get:
      summary: Get meeting transcript
      parameters:
        - name: id
          in: path
          required: true` }
    ]
  },
  {
    name: '02_CODE',
    type: 'folder',
    children: [
      { name: 'app', type: 'folder', children: [
        { name: 'page.tsx', type: 'file', generatedBy: 'A4', preview: `"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-6xl font-bold">
          Never write meeting notes again
        </h1>
        <form className="mt-12 max-w-md mx-auto flex gap-2">
          <Input type="email" placeholder="you@company.com" />
          <Button type="submit" className="gap-2">
            Join Waitlist <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}` }
      ]},
      { name: 'components', type: 'folder', children: [
        { name: 'ui', type: 'folder', children: [] }
      ]},
      { name: 'lib', type: 'folder', children: [
        { name: 'errors.ts', type: 'file', generatedBy: 'A6', preview: `export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}` }
      ]},
      { name: 'tests', type: 'folder', generatedBy: 'A5', children: [] }
    ]
  },
  {
    name: '03_REVIEW_LOGS',
    type: 'folder',
    children: [
      { name: 'status.json', type: 'file', preview: `{
  "pipeline_status": "running",
  "current_agent": "A7",
  "completed": ["A1", "A2", "A3", "A4", "A5", "A6"],
  "flags": {
    "market_validated": true,
    "scope_locked": true,
    "architecture_approved": true,
    "security_verified": false,
    "deployment_ready": false
  }
}` },
      { name: 'security_audit.md', type: 'file', generatedBy: 'A7', preview: `# Security Audit Report

## Summary
✅ No critical vulnerabilities
⚠️ 2 medium issues resolved

## OWASP Top 10 Checklist
- [x] A01:2021 Broken Access Control → RLS enforced
- [x] A02:2021 Cryptographic Failures → TLS 1.3
- [x] A03:2021 Injection → Prisma parameterized
- [x] A07:2021 Auth Failures → Clerk MFA

## RLS Policies Verified
CREATE POLICY "Users access only their data"
ON meetings FOR SELECT USING (auth.uid() = user_id);` }
    ]
  },
  {
    name: 'growth',
    type: 'folder',
    children: [
      { name: 'WAITLIST_STRATEGY.md', type: 'file', generatedBy: 'A8', preview: `# Waitlist Strategy

## Target: 500+ signups before launch

## Channels
1. Product Hunt (launch day)
2. Reddit r/SaaS, r/startups
3. Twitter DMs to meeting-heavy founders
4. LinkedIn posts

## Viral Mechanics
- "Invite 3 → 3 months free"
- Early access tiers (VIP at 100 referrals)

## Pricing (3 Tiers)
- Free: 5 meetings/mo
- Pro: $59/mo (unlimited)
- Team: $99/mo (5 seats)` },
      { name: 'SOCIAL_ASSETS.json', type: 'file', generatedBy: 'A8', preview: `{
  "og_image": "/assets/og-card.png",
  "twitter_card": "summary_large_image",
  "tagline": "Ship in days, not months",
  "tweets": [
    {
      "copy": "We just hit 1,000 waitlist signups! 🚀",
      "image": "milestone-1k.png"
    }
  ]
}` }
    ]
  },
  {
    name: 'OPS',
    type: 'folder',
    children: [
      { name: 'DEPLOYMENT.md', type: 'file', generatedBy: 'A9', preview: `# Deployment Runbook

## Hosting
- Frontend: Vercel
- Backend: Railway
- Database: Neon

## Pre-flight Checklist
- [ ] All tests passing (Playwright <12s)
- [ ] Security audit complete
- [ ] Rollback tested
- [ ] Legal docs reviewed

## Deploy Command
\`\`\`bash
pnpm deploy:prod
\`\`\`

## Monitoring
- Sentry (errors)
- Logfire (logs)
- OpenTelemetry (traces)` }
    ]
  },
  {
    name: 'LEGAL',
    type: 'folder',
    children: [
      { name: 'TOS.md', type: 'file', generatedBy: 'A9', preview: `# Terms of Service
Last updated: 2024

## 1. Acceptance of Terms
By accessing or using Notato...

## 2. Service Description
Notato provides AI-powered meeting transcription...

## 3. User Accounts
You must provide accurate information...

Generated via Termly + Stripe Atlas` },
      { name: 'PRIVACY.md', type: 'file', generatedBy: 'A9', preview: `# Privacy Policy

## Data We Collect
- Email address (required)
- Meeting recordings (with consent)
- Usage analytics (anonymized)

## How We Use It
- Service delivery
- Product improvement
- Communication (with opt-out)

## GDPR Compliance
- Delete endpoint wipes all data in <24h
- Data export available on request` }
    ]
  },
  {
    name: '.github',
    type: 'folder',
    children: [
      { name: 'workflows', type: 'folder', children: [
        { name: 'ci.yml', type: 'file', generatedBy: 'A9', preview: `name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm prisma generate
      - run: pnpm test
      - run: pnpm playwright test
      - run: pnpm build` }
      ]}
    ]
  }
];

export const langGraphCode = `from langgraph.graph import StateGraph, END
from typing import Literal

# Define the state machine
graph = StateGraph(StartupState)

# Add agent nodes
graph.add_node("A1_market_strategist", market_strategist)
graph.add_node("A2_visionary_pm", visionary_pm)
graph.add_node("A3_systems_architect", systems_architect)
graph.add_node("A4_ui_specialist", ui_specialist)
graph.add_node("A5_frontend_engineer", frontend_engineer)
graph.add_node("A6_backend_engineer", backend_engineer)
graph.add_node("A7_security_auditor", security_auditor)
graph.add_node("A8_growth_lead", growth_lead)
graph.add_node("A9_sre_ops_legal", sre_ops_legal)

# HITL checkpoint function
def hitl_checkpoint(state: StartupState) -> Literal["approved", "rejected"]:
    return "approved" if state["human_approved"] else "rejected"

# Conditional edges for HITL checkpoints
graph.add_conditional_edges(
    "A1_market_strategist",
    hitl_checkpoint,
    {"approved": "A2_visionary_pm", "rejected": END}
)

graph.add_conditional_edges(
    "A2_visionary_pm", 
    hitl_checkpoint,
    {"approved": "A3_systems_architect", "rejected": END}
)

# Linear edges for non-HITL agents
graph.add_edge("A3_systems_architect", "A4_ui_specialist")
graph.add_edge("A4_ui_specialist", "A5_frontend_engineer")
graph.add_edge("A5_frontend_engineer", "A6_backend_engineer")
graph.add_edge("A6_backend_engineer", "A7_security_auditor")
graph.add_edge("A7_security_auditor", "A8_growth_lead")

# Security loop-back
graph.add_conditional_edges(
    "A8_growth_lead",
    lambda s: "A9" if s["security_verified"] else "A7",
    {"A9": "A9_sre_ops_legal", "A7": "A7_security_auditor"}
)

# Final HITL checkpoint
graph.add_conditional_edges(
    "A9_sre_ops_legal",
    hitl_checkpoint,
    {"approved": END, "rejected": END}
)

# Set entry point
graph.set_entry_point("A1_market_strategist")

# Compile the graph
app = graph.compile()`;

export const stateSchemaCode = `from typing import TypedDict, Dict, List, Optional, Literal

class StartupState(TypedDict):
    # Core Data
    raw_idea: str
    founder_profile: Dict[str, str]  # {"experience": "...", "skills": [...]}
    vision_docs: Dict[str, str]      # Keys: MARKET_VALIDATION, SCOPE, VISION, BACKLOG
    architecture_docs: Dict[str, str] # Keys: ARCHITECTURE, ERD, API_CONTRACTS
    code_base: Dict[str, str]         # Keys: file paths, values: content
    review_logs: Dict[str, List[str]] # Keys: agent IDs, values: notes

    # Progress Tracking
    current_agent: Literal["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"]
    agent_status: Dict[str, Literal["pending", "active", "completed", "failed"]]
    backlog: List[str]

    # Validation & Approval Flags
    human_approved: bool
    market_validated: bool
    scope_locked: bool
    architecture_approved: bool
    security_verified: bool
    deployment_ready: bool

    # Error Handling
    last_error: Optional[Dict[str, str]]  # {"agent": "A3", "error": "...", "timestamp": "ISO"}
    retry_count: int`;

export const executionFlowCode = `# 1. Initialize state
state = {
    "raw_idea": "AI meeting notetaker that auto-sends follow-up emails",
    "founder_profile": {"experience": "ex-Gong RevOps", "skills": ["Go", "React"]},
    "current_agent": "A1",
    "agent_status": {f"A{i}": "pending" for i in range(1, 10)},
    "human_approved": False,
    "market_validated": False,
    "scope_locked": False,
    "architecture_approved": False,
    "security_verified": False,
    "deployment_ready": False,
    "last_error": None,
    "retry_count": 0,
    "backlog": [],
    # ... initialize other fields
}

# 2. Run the graph
result = app.invoke(state)

# 3. Monitor progress
print(f"Current Agent: {result['current_agent']}")
print(f"Agent Status: {result['agent_status']}")
if result['last_error']:
    print(f"Error: {result['last_error']}")`;

export const specJson = {
  name: "Elite 9-Agent Launch Squad",
  version: "1.0.0",
  description: "LangGraph-powered autonomous pipeline for launching SaaS products",
  agents: agents.map(a => ({
    id: a.id,
    name: a.name,
    role: a.role,
    persona: a.persona,
    goal: a.goal,
    outputs: a.outputs,
    flag: a.flag,
    hitl: a.hitl,
    tools: a.tools,
    rules: a.rules,
    constraints: a.constraints,
    terminationRules: a.terminationRules,
    decisionMatrix: a.decisionMatrix,
    mandatoryStack: a.mandatoryStack,
    qualityGates: a.qualityGates
  })),
  state_schema: stateGroups,
  error_handlers: errorHandlers,
  failure_modes: failureModes,
  final_outputs: finalOutputs,
  hitl_checkpoints: ["A1", "A2", "A9"]
};
