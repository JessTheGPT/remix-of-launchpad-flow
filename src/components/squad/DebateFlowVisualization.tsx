import { motion } from 'framer-motion';
import { SQUAD_AGENTS, getSquadAgentById } from '@/lib/squadAgents';
import { DEBATE_PAIRS, AGENT_STANCES } from '@/lib/debateConfig';
import { CheckCircle2, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DebateFlowVisualizationProps {
  completedAgents: Set<string>;
  completedDebates: Set<string>;
  activeDebateId?: string;
  debateRedLines: Record<string, boolean>; // debateId -> hasRedLine
  onDebateClick?: (debateId: string) => void;
}

const DebateFlowVisualization = ({
  completedAgents,
  completedDebates,
  activeDebateId,
  debateRedLines,
  onDebateClick,
}: DebateFlowVisualizationProps) => {
  return (
    <div className="w-full py-3">
      {/* Agent nodes row */}
      <div className="flex items-center justify-between mb-4 px-2">
        {SQUAD_AGENTS.map((agent, i) => {
          const isComplete = completedAgents.has(agent.id);
          const debatesAfter = DEBATE_PAIRS.filter(d => d.afterAgent === agent.id);
          const hasDebates = debatesAfter.length > 0;
          const debatesComplete = debatesAfter.every(d => completedDebates.has(d.id));
          const hasRedLines = debatesAfter.some(d => debateRedLines[d.id]);

          return (
            <div key={agent.id} className="flex items-center">
              <motion.div
                className={`relative flex flex-col items-center ${hasDebates ? 'cursor-pointer' : ''}`}
                onClick={() => hasDebates && debatesAfter[0] && onDebateClick?.(debatesAfter[0].id)}
                whileHover={hasDebates ? { scale: 1.05 } : {}}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm border-2 transition-all ${
                  isComplete
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-card border-border/40'
                }`}>
                  {agent.icon}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 font-medium">{agent.name.split(' ')[0]}</span>
                
                {/* Debate indicator */}
                {hasDebates && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                    {debatesComplete ? (
                      hasRedLines ? (
                        <AlertTriangle className="w-3 h-3 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )
                    ) : (
                      <MessageSquare className="w-2.5 h-2.5 text-muted-foreground/40" />
                    )}
                  </div>
                )}
              </motion.div>

              {/* Connection arrow */}
              {i < SQUAD_AGENTS.length - 1 && (
                <div className="flex items-center mx-1">
                  {/* Check if there's a debate between this agent and next */}
                  {DEBATE_PAIRS.some(d => d.afterAgent === agent.id) ? (
                    <div className="flex items-center">
                      <div className={`h-px w-3 ${isComplete ? 'bg-primary/40' : 'bg-border/40'}`} />
                      <motion.div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          completedDebates.has(DEBATE_PAIRS.find(d => d.afterAgent === agent.id)?.id || '')
                            ? debateRedLines[DEBATE_PAIRS.find(d => d.afterAgent === agent.id)?.id || '']
                              ? 'border-destructive/40 bg-destructive/10'
                              : 'border-green-500/40 bg-green-500/10'
                            : activeDebateId === DEBATE_PAIRS.find(d => d.afterAgent === agent.id)?.id
                              ? 'border-primary/40 bg-primary/10 animate-pulse'
                              : 'border-border/30 bg-card/30'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                      </motion.div>
                      <div className={`h-px w-3 ${isComplete ? 'bg-primary/40' : 'bg-border/40'}`} />
                    </div>
                  ) : (
                    <ArrowRight className={`w-3 h-3 ${isComplete ? 'text-primary/40' : 'text-border/40'}`} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Debate connections labels (below) */}
      <div className="flex items-center justify-between px-2 mt-5">
        {DEBATE_PAIRS.filter(d => !d.isOpenForum).map(debate => {
          const afterIdx = SQUAD_AGENTS.findIndex(a => a.id === debate.afterAgent);
          const isComplete = completedDebates.has(debate.id);
          const hasRedLine = debateRedLines[debate.id];

          return (
            <motion.button
              key={debate.id}
              onClick={() => onDebateClick?.(debate.id)}
              className={`text-[8px] px-1.5 py-0.5 rounded-md border transition-all ${
                isComplete
                  ? hasRedLine
                    ? 'border-destructive/30 text-destructive bg-destructive/5'
                    : 'border-green-500/30 text-green-500 bg-green-500/5'
                  : 'border-border/20 text-muted-foreground/50 hover:text-muted-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {debate.topic.split(' ').slice(0, 2).join(' ')}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DebateFlowVisualization;
