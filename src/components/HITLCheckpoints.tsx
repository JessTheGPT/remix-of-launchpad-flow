import { useState } from 'react';
import { Check, X, Users, ArrowRight, StopCircle, ArrowDown } from 'lucide-react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const checkpoints = [
  { 
    agent: 'A1', 
    name: 'Market Strategist',
    description: 'Validate market opportunity before product definition',
    approvalGates: ['Market validation complete', 'Competitive analysis reviewed', 'TAM/SAM/SOM approved'],
    action: 'Set state["human_approved"] = True/False',
    rejection: 'Terminate graph; output KILLED.md'
  },
  { 
    agent: 'A2', 
    name: 'Visionary PM',
    description: 'Lock scope before architecture and development',
    approvalGates: ['Vision aligned with market', 'Scope is achievable (6 features max)', 'Backlog prioritized'],
    action: 'Set state["scope_locked"] = True/False',
    rejection: 'Terminate graph; output REJECTED.md'
  },
  { 
    agent: 'A9', 
    name: 'SRE/Ops/Legal',
    description: 'Final approval before production deployment',
    approvalGates: ['All tests passing', 'Security audit complete', 'Legal docs reviewed'],
    action: 'Set state["deployment_ready"] = True/False',
    rejection: 'No deployment; requires manual fix'
  }
];

const HITLCheckpoints = () => {
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'rejected' | null>>({
    A1: 'approved',
    A2: 'approved',
    A9: null
  });
  const { ref, isIntersecting } = useIntersectionObserver();

  const toggleDecision = (agent: string, decision: 'approved' | 'rejected') => {
    setDecisions(prev => ({
      ...prev,
      [agent]: prev[agent] === decision ? null : decision
    }));
  };

  const hasRejection = Object.values(decisions).some(d => d === 'rejected');

  return (
    <section id="hitl" className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div 
          ref={ref}
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="chip chip-warning mb-4">
            <Users className="w-3 h-3 mr-1" />
            HITL
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Human-in-the-Loop Checkpoints
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Critical decision points where human approval is required before proceeding. 
            A rejection terminates the pipeline.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line - Desktop */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          <div className="space-y-6 md:space-y-8">
            {checkpoints.map((checkpoint, index) => {
              const decision = decisions[checkpoint.agent];
              const isBlocked = index > 0 && Object.entries(decisions)
                .filter(([agent]) => checkpoints.findIndex(c => c.agent === agent) < index)
                .some(([_, d]) => d === 'rejected' || d === null);

              return (
                <div 
                  key={checkpoint.agent}
                  className={`
                    relative pl-0 md:pl-16 transition-opacity duration-300
                    ${isBlocked ? 'opacity-40' : 'opacity-100'}
                  `}
                >
                  {/* Timeline node - Desktop */}
                  <div className={`
                    hidden md:flex absolute left-0 w-12 h-12 rounded-full items-center justify-center
                    border-2 transition-all duration-300
                    ${decision === 'approved' 
                      ? 'bg-success/10 border-success text-success' 
                      : decision === 'rejected'
                        ? 'bg-destructive/10 border-destructive text-destructive'
                        : 'bg-card border-border text-muted-foreground'
                    }
                  `}>
                    {decision === 'approved' && <Check className="w-5 h-5" />}
                    {decision === 'rejected' && <X className="w-5 h-5" />}
                    {!decision && <Users className="w-5 h-5" />}
                  </div>

                  {/* Card */}
                  <div className={`
                    p-4 md:p-6 rounded-2xl border transition-all duration-300
                    ${decision === 'approved' 
                      ? 'bg-success/5 border-success/30' 
                      : decision === 'rejected'
                        ? 'bg-destructive/5 border-destructive/30'
                        : 'bg-card border-border'
                    }
                  `}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <span className="chip chip-primary">{checkpoint.agent}</span>
                          <h3 className="font-semibold text-foreground text-sm md:text-base">{checkpoint.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{checkpoint.description}</p>
                      </div>

                      {/* Toggle buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleDecision(checkpoint.agent, 'approved')}
                          disabled={isBlocked}
                          className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all
                            ${decision === 'approved'
                              ? 'bg-success text-success-foreground'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <Check className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                        <button
                          onClick={() => toggleDecision(checkpoint.agent, 'rejected')}
                          disabled={isBlocked}
                          className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all
                            ${decision === 'rejected'
                              ? 'bg-destructive text-destructive-foreground'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </div>
                    </div>

                    {/* Approval gates */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {checkpoint.approvalGates.map((gate, i) => (
                        <span 
                          key={i}
                          className={`
                            text-[10px] md:text-xs px-2 py-1 rounded-md
                            ${decision === 'approved' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-secondary text-muted-foreground'
                            }
                          `}
                        >
                          {gate}
                        </span>
                      ))}
                    </div>

                    {/* Action info */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground font-mono">
                        Action: <span className="text-primary">{checkpoint.action}</span>
                      </p>
                      {decision === 'rejected' && (
                        <p className="text-xs text-destructive mt-1">
                          → {checkpoint.rejection}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Arrow to next or END */}
                  {index < checkpoints.length - 1 && (
                    <div className="flex items-center justify-center py-4 text-muted-foreground">
                      {decision === 'rejected' ? (
                        <div className="flex items-center gap-2 text-destructive">
                          <StopCircle className="w-4 h-4" />
                          <span className="text-xs md:text-sm font-medium">Pipeline Terminated</span>
                        </div>
                      ) : decision === 'approved' ? (
                        <ArrowDown className="w-4 h-4 text-success md:hidden" />
                      ) : (
                        <span className="text-xs">Awaiting decision...</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final outcome */}
          <div className="mt-8 p-4 rounded-xl bg-card border border-border text-center">
            {hasRejection ? (
              <div className="flex items-center justify-center gap-2 text-destructive">
                <StopCircle className="w-5 h-5" />
                <span className="font-semibold text-sm md:text-base">Pipeline ends at rejection point</span>
              </div>
            ) : decisions.A9 === 'approved' ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <Check className="w-5 h-5" />
                <span className="font-semibold text-sm md:text-base">Deployment approved — Production ready!</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Toggle decisions above to see pipeline flow</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HITLCheckpoints;
