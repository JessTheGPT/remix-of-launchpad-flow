export interface StartupAgent {
  id: string;
  name: string;
  role: string;
  phase: string;
  phaseIndex: number;
  icon: string;
  color: string;
  description: string;
  documents: string[];
}

export const PHASES = [
  { id: 'intake', label: 'Intake', description: 'Define the vision' },
  { id: 'strategy', label: 'Strategy', description: 'Business & tech analysis' },
  { id: 'execution', label: 'Execution', description: 'Design, build & research' },
  { id: 'synthesis', label: 'Synthesis', description: 'Review & decide' },
  { id: 'launch', label: 'Launch Ready', description: 'Ship it' },
] as const;

export const STARTUP_AGENTS: StartupAgent[] = [
  {
    id: 'chief_of_staff',
    name: 'Chief of Staff',
    role: 'Strategic Operator',
    phase: 'intake',
    phaseIndex: 0,
    icon: '⚡',
    color: 'hsl(192 82% 52%)',
    description: 'Conducts intake interviews, synthesizes information, and orchestrates the team.',
    documents: ['Startup Brief'],
  },
  {
    id: 'tech_lead',
    name: 'Tech Lead',
    role: 'System Architect',
    phase: 'strategy',
    phaseIndex: 1,
    icon: '🔧',
    color: 'hsl(142 72% 46%)',
    description: 'Evaluates technical feasibility and designs system architecture.',
    documents: ['Technical Architecture'],
  },
  {
    id: 'business_exec',
    name: 'Business Executive',
    role: 'Strategy Lead',
    phase: 'strategy',
    phaseIndex: 1,
    icon: '📊',
    color: 'hsl(38 92% 56%)',
    description: 'Builds business models, go-to-market strategy, and financial projections.',
    documents: ['Business Strategy'],
  },
  {
    id: 'designer',
    name: 'Lead Designer',
    role: 'UX Strategist',
    phase: 'execution',
    phaseIndex: 2,
    icon: '🎨',
    color: 'hsl(280 72% 60%)',
    description: 'Creates user experience strategies, personas, and design systems.',
    documents: ['Design & UX Strategy'],
  },
  {
    id: 'developer',
    name: 'Lead Developer',
    role: 'Full-Stack Engineer',
    phase: 'execution',
    phaseIndex: 2,
    icon: '💻',
    color: 'hsl(192 82% 52%)',
    description: 'Creates implementation plans, sprint breakdowns, and technical specs.',
    documents: ['Implementation Plan'],
  },
  {
    id: 'competitive_research',
    name: 'Research Analyst',
    role: 'Market Intelligence',
    phase: 'execution',
    phaseIndex: 2,
    icon: '🔍',
    color: 'hsl(0 72% 56%)',
    description: 'Conducts competitive analysis and market intelligence research.',
    documents: ['Competitive Intelligence'],
  },
  {
    id: 'chief_of_staff_synthesis',
    name: 'Chief of Staff',
    role: 'Synthesis & Review',
    phase: 'synthesis',
    phaseIndex: 3,
    icon: '⚡',
    color: 'hsl(192 82% 52%)',
    description: 'Synthesizes all team outputs into actionable recommendations.',
    documents: ['Executive Synthesis'],
  },
];

export function getAgentsByPhase(phase: string): StartupAgent[] {
  return STARTUP_AGENTS.filter(a => a.phase === phase);
}

export function getPhaseForAgent(agentId: string): string {
  return STARTUP_AGENTS.find(a => a.id === agentId)?.phase || 'intake';
}
