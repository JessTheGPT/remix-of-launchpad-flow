import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Shield, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Play, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SQUAD_AGENTS, getSquadAgentById } from '@/lib/squadAgents';
import { DEBATE_PAIRS, AGENT_STANCES, type DebatePair } from '@/lib/debateConfig';
import { streamChat } from '@/lib/streamChat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export interface DebateMessage {
  id: string;
  agent: string;
  content: string;
  round: number;
  stance: string;
  redLineTriggered: boolean;
  timestamp: number;
}

interface DebateCanvasProps {
  ideaId: string;
  userId: string;
  completedAgents: Set<string>;
  documents: { agent: string; title: string; content: string }[];
  onDebateComplete?: (debateId: string) => void;
}

const DebateCanvas = ({ ideaId, userId, completedAgents, documents, onDebateComplete }: DebateCanvasProps) => {
  const [activeDebate, setActiveDebate] = useState<DebatePair | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>({} as any);
  const [allMessages, setAllMessages] = useState<Record<string, DebateMessage[]>>({});
  const [generating, setGenerating] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);
  const [completedDebates, setCompletedDebates] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing debate messages
  useEffect(() => {
    loadDebateMessages();
  }, [ideaId]);

  const loadDebateMessages = async () => {
    const { data } = await supabase
      .from('debate_messages')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at');
    
    if (data) {
      const grouped: Record<string, DebateMessage[]> = {};
      const completed = new Set<string>();
      data.forEach((m: any) => {
        if (!grouped[m.debate_id]) grouped[m.debate_id] = [];
        grouped[m.debate_id].push({
          id: m.id,
          agent: m.agent,
          content: m.content,
          round: m.round,
          stance: m.stance || 'assert',
          redLineTriggered: m.red_line_triggered || false,
          timestamp: new Date(m.created_at).getTime(),
        });
      });
      // Mark debates with messages as completed
      Object.keys(grouped).forEach(debateId => {
        const debate = DEBATE_PAIRS.find(d => d.id === debateId);
        if (debate && grouped[debateId].length >= debate.agents.length * 2) {
          completed.add(debateId);
        }
      });
      setAllMessages(grouped);
      setCompletedDebates(completed);
    }
  };

  const availableDebates = DEBATE_PAIRS.filter(d => {
    const afterIdx = SQUAD_AGENTS.findIndex(a => a.id === d.afterAgent);
    return completedAgents.has(d.afterAgent) || afterIdx < [...completedAgents].reduce((max, id) => {
      const idx = SQUAD_AGENTS.findIndex(a => a.id === id);
      return Math.max(max, idx);
    }, -1);
  });

  const runDebate = async (debate: DebatePair) => {
    setActiveDebate(debate);
    setExpandedDebate(debate.id);
    setGenerating(true);
    setCurrentRound(1);

    const debateMessages: DebateMessage[] = allMessages[debate.id] || [];
    
    // Build context from completed documents
    const contextDocs = documents.filter(d => completedAgents.has(d.agent));
    const context = contextDocs.map(d => `## ${d.title}\n\n${d.content}`).join('\n\n---\n\n');

    try {
      const totalExchanges = debate.isOpenForum 
        ? debate.agents.length * 2 // Each agent speaks twice in forum
        : debate.rounds * debate.agents.length;

      for (let i = 0; i < totalExchanges; i++) {
        const agentIdx = i % debate.agents.length;
        const agentId = debate.agents[agentIdx];
        const round = Math.floor(i / debate.agents.length) + 1;
        const agent = getSquadAgentById(agentId);
        const stance = AGENT_STANCES[agentId];

        if (!agent || !stance) continue;

        setCurrentRound(round);

        // Build debate prompt with previous messages
        const prevMessages = debateMessages.map(m => {
          const a = getSquadAgentById(m.agent);
          return `**${a?.name || m.agent}** (Round ${m.round}, ${m.stance}): ${m.content}`;
        }).join('\n\n');

        const redLinesList = stance.redLines.map(r => `- 🔴 ${r.rule}: ${r.description}`).join('\n');
        const flexList = stance.flexAreas.map(f => `- 🟢 ${f.area}: ${f.description}`).join('\n');

        const debateSystemPrompt = debate.isOpenForum
          ? `You are ${agent.name} (${agent.role}) in a FINAL ALIGNMENT FORUM. All 9 agents are present.

Your RED LINES (non-negotiable):
${redLinesList}

Your FLEXIBLE AREAS:
${flexList}

RULES:
1. State your position on the overall plan clearly
2. Flag ANY red line violations you see from other agents' work
3. Acknowledge areas where you're willing to compromise
4. If majority aligns and no red lines are crossed, signal ALIGNMENT_REACHED
5. If a red line IS crossed, clearly state RED_LINE_VIOLATED and what must change
6. Keep response to 2-3 focused paragraphs

Topic: ${debate.topic}
${prevMessages ? `\nPrevious discussion:\n${prevMessages}` : ''}`
          : `You are ${agent.name} (${agent.role}) in a structured debate on: "${debate.topic}"

Your RED LINES (non-negotiable):
${redLinesList}

Your FLEXIBLE AREAS:
${flexList}

RULES:
1. This is Round ${round} of ${debate.rounds}
2. ${i === 0 ? 'Open with your position on the topic' : 'Respond to the previous arguments'}
3. If another agent crosses one of your red lines, say RED_LINE_VIOLATED clearly
4. If you can find common ground, propose a specific compromise
5. Stay in character as ${agent.name}
6. Keep response concise (2-3 paragraphs)
7. On the final round, state whether you ALIGN, CONCEDE, or BLOCK

Topic: ${debate.topic}
Trigger Question: ${debate.trigger}
${prevMessages ? `\nPrevious exchanges:\n${prevMessages}` : ''}`;

        let content = '';
        const msgId = crypto.randomUUID();

        await streamChat({
          messages: [{ role: 'user', content: `Engage in this debate as ${agent.name}. Round ${round}.` }],
          agent: agentId,
          context: `${debateSystemPrompt}\n\n---\nProject Context:\n${context}`,
          onDelta: (delta) => {
            content += delta;
            const msg: DebateMessage = {
              id: msgId,
              agent: agentId,
              content,
              round,
              stance: content.includes('RED_LINE_VIOLATED') ? 'red_line' : 
                     content.includes('ALIGNMENT_REACHED') ? 'align' :
                     i === 0 ? 'assert' : 'challenge',
              redLineTriggered: content.includes('RED_LINE_VIOLATED'),
              timestamp: Date.now(),
            };
            setAllMessages(prev => ({
              ...prev,
              [debate.id]: [...(debateMessages), msg],
            }));
          },
          onDone: async () => {
            const finalMsg: DebateMessage = {
              id: msgId,
              agent: agentId,
              content,
              round,
              stance: content.includes('RED_LINE_VIOLATED') ? 'red_line' : 
                     content.includes('ALIGNMENT_REACHED') ? 'align' :
                     i === 0 ? 'assert' : 'challenge',
              redLineTriggered: content.includes('RED_LINE_VIOLATED'),
              timestamp: Date.now(),
            };
            debateMessages.push(finalMsg);

            await supabase.from('debate_messages').insert({
              idea_id: ideaId,
              debate_id: debate.id,
              agent: agentId,
              content,
              round,
              stance: finalMsg.stance,
              red_line_triggered: finalMsg.redLineTriggered,
              user_id: userId,
            });
          },
        });
      }

      setCompletedDebates(prev => new Set([...prev, debate.id]));
      onDebateComplete?.(debate.id);
      toast.success(`${debate.topic} debate complete`);
    } catch (err) {
      toast.error('Debate interrupted');
    } finally {
      setGenerating(false);
      setActiveDebate(null);
    }
  };

  const getStanceIcon = (stance: string) => {
    switch (stance) {
      case 'red_line': return <AlertTriangle className="w-3 h-3 text-destructive" />;
      case 'align': return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'challenge': return <MessageSquare className="w-3 h-3 text-warning" />;
      default: return <MessageSquare className="w-3 h-3 text-primary" />;
    }
  };

  const getStanceBorder = (stance: string) => {
    switch (stance) {
      case 'red_line': return 'border-l-destructive bg-destructive/5';
      case 'align': return 'border-l-green-500 bg-green-500/5';
      case 'challenge': return 'border-l-warning bg-warning/5';
      default: return 'border-l-primary bg-primary/5';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/40 bg-card/30">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Agent Debates</h3>
          <Badge variant="outline" className="text-[10px]">
            {completedDebates.size}/{DEBATE_PAIRS.length}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Structured rounds → red line enforcement → majority alignment
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {DEBATE_PAIRS.map((debate, idx) => {
            const isAvailable = availableDebates.includes(debate);
            const isComplete = completedDebates.has(debate.id);
            const isActive = activeDebate?.id === debate.id;
            const isExpanded = expandedDebate === debate.id;
            const msgs = allMessages[debate.id] || [];
            const hasRedLine = msgs.some(m => m.redLineTriggered);

            return (
              <motion.div
                key={debate.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-lg border transition-all duration-200 ${
                  isActive ? 'border-primary/40 shadow-[0_0_16px_hsl(var(--primary)/0.1)]' :
                  isComplete ? (hasRedLine ? 'border-destructive/30' : 'border-green-500/30') :
                  isAvailable ? 'border-border/40 hover:border-primary/30' :
                  'border-border/20 opacity-50'
                }`}
              >
                {/* Debate Header */}
                <button
                  onClick={() => setExpandedDebate(isExpanded ? null : debate.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                  disabled={!isAvailable && !isComplete}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Agent avatars */}
                    <div className="flex -space-x-1.5">
                      {debate.agents.slice(0, 3).map(agentId => {
                        const agent = getSquadAgentById(agentId);
                        return (
                          <div
                            key={agentId}
                            className="w-6 h-6 rounded-full bg-card border border-border/60 flex items-center justify-center text-[10px]"
                            title={agent?.name}
                          >
                            {agent?.icon}
                          </div>
                        );
                      })}
                      {debate.agents.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-card border border-border/60 flex items-center justify-center text-[9px] text-muted-foreground font-medium">
                          +{debate.agents.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground truncate">{debate.topic}</span>
                        {isComplete && !hasRedLine && <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />}
                        {hasRedLine && <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />}
                        {debate.isOpenForum && <Badge variant="secondary" className="text-[8px] px-1 py-0">Forum</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{debate.trigger}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                </button>

                {/* Expanded Debate Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2">
                        {/* Red lines summary */}
                        <div className="flex flex-wrap gap-1">
                          {debate.agents.map(agentId => {
                            const stance = AGENT_STANCES[agentId];
                            const agent = getSquadAgentById(agentId);
                            if (!stance || !agent) return null;
                            return (
                              <div key={agentId} className="group relative">
                                <Badge variant="outline" className="text-[8px] cursor-default gap-1">
                                  <Shield className="w-2.5 h-2.5" />
                                  {agent.icon} {stance.redLines.length} red lines
                                </Badge>
                              </div>
                            );
                          })}
                        </div>

                        {/* Messages */}
                        {msgs.length > 0 && (
                          <div className="space-y-2 max-h-[400px] overflow-y-auto" ref={scrollRef}>
                            {msgs.map((msg, i) => {
                              const agent = getSquadAgentById(msg.agent);
                              return (
                                <motion.div
                                  key={msg.id + '-' + i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  className={`border-l-2 pl-3 py-2 rounded-r-lg ${getStanceBorder(msg.stance)}`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs">{agent?.icon}</span>
                                    <span className="text-[10px] font-semibold text-foreground">{agent?.name}</span>
                                    <span className="text-[9px] text-muted-foreground">R{msg.round}</span>
                                    {getStanceIcon(msg.stance)}
                                    {msg.redLineTriggered && (
                                      <Badge variant="destructive" className="text-[8px] px-1 py-0">RED LINE</Badge>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-foreground/80 prose prose-xs max-w-none">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        {/* Action */}
                        {isAvailable && !isComplete && !isActive && (
                          <Button
                            onClick={() => runDebate(debate)}
                            disabled={generating}
                            size="sm"
                            className="w-full gap-2 text-xs h-8"
                          >
                            <Play className="w-3 h-3" />
                            Start {debate.isOpenForum ? 'Forum' : 'Debate'} ({debate.rounds} rounds)
                          </Button>
                        )}
                        {isActive && (
                          <div className="flex items-center gap-2 justify-center py-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            Round {currentRound} of {debate.rounds}...
                          </div>
                        )}
                        {isComplete && (
                          <div className={`flex items-center gap-2 justify-center py-1.5 text-[10px] rounded-md ${
                            hasRedLine ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                          }`}>
                            {hasRedLine ? (
                              <><AlertTriangle className="w-3 h-3" /> Red lines triggered — review required</>
                            ) : (
                              <><CheckCircle2 className="w-3 h-3" /> Aligned — no red lines crossed</>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DebateCanvas;
