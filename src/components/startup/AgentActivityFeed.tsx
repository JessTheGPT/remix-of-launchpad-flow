import { STARTUP_AGENTS } from '@/lib/startupAgents';
import { ArrowRight, FileText, CheckCircle, MessageSquare, Zap } from 'lucide-react';
import type { ActivityEvent } from '@/pages/Startup';

interface AgentActivityFeedProps {
  events: ActivityEvent[];
}

const typeConfig = {
  delegation: { icon: ArrowRight, color: 'text-warning', bg: 'bg-warning/10' },
  doc_start: { icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
  doc_complete: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  message: { icon: MessageSquare, color: 'text-foreground', bg: 'bg-secondary' },
  phase_advance: { icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
};

const AgentActivityFeed = ({ events }: AgentActivityFeedProps) => {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center px-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-primary/40" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">No activity yet</p>
          <p className="text-xs text-muted-foreground/60">
            Chat with an agent or advance phases to see the crew in action
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1">
      {events.map((event, i) => {
        const config = typeConfig[event.type];
        const Icon = config.icon;
        const fromAgent = STARTUP_AGENTS.find(a => a.id === event.fromAgent);
        const toAgent = event.toAgent ? STARTUP_AGENTS.find(a => a.id === event.toAgent) : null;

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/30 transition-colors animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">{fromAgent?.icon}</span>
                <span className="text-xs font-medium text-foreground">{fromAgent?.name}</span>
                {toAgent && (
                  <>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{toAgent.icon}</span>
                    <span className="text-xs font-medium text-foreground">{toAgent.name}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{event.content}</p>
            </div>
            <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 mt-1 tabular-nums">
              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AgentActivityFeed;
