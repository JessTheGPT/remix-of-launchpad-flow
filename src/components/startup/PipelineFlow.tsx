import { PHASES, STARTUP_AGENTS } from '@/lib/startupAgents';
import { IdeaDocument } from './DocumentPanel';

interface PipelineFlowProps {
  currentPhase: string;
  activeAgent?: string;
  onAgentClick?: (agentId: string) => void;
  documents?: IdeaDocument[];
  generating?: boolean;
}

const PipelineFlow = ({ currentPhase, activeAgent, onAgentClick, documents = [], generating }: PipelineFlowProps) => {
  const currentPhaseIndex = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className="w-full py-2">
      {/* Phase track */}
      <div className="flex items-stretch gap-1">
        {PHASES.map((phase, i) => {
          const isComplete = i < currentPhaseIndex;
          const isCurrent = i === currentPhaseIndex;
          const agents = STARTUP_AGENTS.filter(a => a.phase === phase.id);
          const phaseDocs = documents.filter(d => d.phase === phase.id);
          const hasGenerating = phaseDocs.some(d => d.status === 'generating');

          return (
            <div key={phase.id} className="flex-1 min-w-0">
              {/* Phase bar */}
              <div className="relative mb-2">
                <div className={`
                  h-1 rounded-full transition-all duration-700
                  ${isComplete ? 'bg-primary' : isCurrent ? 'bg-primary/60' : 'bg-border'}
                `}>
                  {isCurrent && hasGenerating && (
                    <div className="absolute inset-0 rounded-full bg-primary/40 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Phase label */}
              <p className={`text-[10px] font-semibold mb-1.5 truncate ${
                isCurrent ? 'text-primary' : isComplete ? 'text-foreground/70' : 'text-muted-foreground/50'
              }`}>
                {phase.label}
              </p>

              {/* Agent chips */}
              <div className="flex flex-wrap gap-1">
                {agents.map(agent => {
                  const isActive = activeAgent === agent.id;
                  const agentDoc = phaseDocs.find(d => d.agent === agent.id);
                  const isGenerating = agentDoc?.status === 'generating';
                  const isDocComplete = agentDoc?.status === 'complete' || agentDoc?.status === 'reviewed';

                  return (
                    <button
                      key={agent.id}
                      onClick={() => onAgentClick?.(agent.id)}
                      className={`
                        group relative flex items-center gap-1 px-2 py-1 rounded-md
                        text-[10px] font-medium transition-all duration-200 border
                        ${isActive
                          ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]'
                          : isDocComplete
                            ? 'bg-primary/5 border-primary/20 text-primary/70'
                            : 'bg-card/50 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }
                      `}
                    >
                      <span className="text-xs leading-none">{agent.icon}</span>
                      <span className="hidden lg:inline truncate max-w-[60px]">{agent.name}</span>
                      
                      {isGenerating && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                      {isActive && !isGenerating && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Doc indicators */}
              {phaseDocs.length > 0 && (
                <div className="flex gap-0.5 mt-1.5">
                  {phaseDocs.map(doc => (
                    <div
                      key={doc.id}
                      className={`
                        h-0.5 flex-1 rounded-full transition-all duration-500
                        ${doc.status === 'generating' ? 'bg-primary/50 animate-pulse' :
                          doc.status === 'complete' ? 'bg-primary/40' :
                          doc.status === 'reviewed' ? 'bg-primary' : 'bg-border'}
                      `}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineFlow;
