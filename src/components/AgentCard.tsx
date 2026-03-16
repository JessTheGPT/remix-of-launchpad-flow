import { ChevronRight, CheckCircle2, Users, Target } from 'lucide-react';
import { Agent } from '@/data/specData';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface AgentCardProps {
  agent: Agent;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

const AgentCard = ({ agent, index, isActive, onSelect }: AgentCardProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <button
        onClick={onSelect}
        className={`
          group relative w-full text-left p-4 md:p-5 rounded-2xl border transition-all duration-300
          ${isActive 
            ? 'bg-card border-primary/50 glow-border' 
            : 'bg-card/50 border-border/50 hover:border-border hover:bg-card'
          }
        `}
      >
        {/* Agent ID badge */}
        <div className={`
          absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold transition-colors
          ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}
        `}>
          {agent.id}
        </div>

        {/* HITL indicator */}
        {agent.hitl && (
          <div className="absolute -top-3 right-4 px-2 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-medium flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">HITL</span>
          </div>
        )}

        {/* Content */}
        <div className="mt-3">
          {/* Persona tag */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full truncate max-w-[200px]">
              {agent.persona}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-1">
            {agent.name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex items-start gap-2">
            <Target className="w-3 h-3 mt-1 flex-shrink-0 text-primary/60" />
            <span>{agent.goal}</span>
          </p>

          {/* Outputs chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.outputs.slice(0, 2).map((output, i) => (
              <span key={i} className="chip chip-muted text-[10px] truncate max-w-[120px] md:max-w-[150px]">
                {output.split('/').pop()}
              </span>
            ))}
            {agent.outputs.length > 2 && (
              <span className="chip chip-muted text-[10px]">+{agent.outputs.length - 2}</span>
            )}
          </div>

          {/* Tools count */}
          <div className="flex items-center justify-between">
            {/* Flag indicator */}
            {agent.flag ? (
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span className="text-muted-foreground font-mono text-[10px] md:text-xs">{agent.flag}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">{agent.tools.length} tools</span>
            )}

            {/* Expand indicator */}
            <div className={`
              p-1.5 rounded-full transition-all duration-300
              ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-hover:text-foreground'}
            `}>
              <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>

        {/* Connection indicator for pipeline flow */}
        {index < 8 && (
          <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r from-border to-transparent" />
        )}
      </button>
    </div>
  );
};

export default AgentCard;
