import { X, FileText, Shield, Box, CheckCircle2, AlertTriangle, Users, Wrench, Code, Zap, Target, BookOpen } from 'lucide-react';
import { Agent } from '@/data/specData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface AgentDrawerProps {
  agent: Agent | null;
  onClose: () => void;
}

const AgentDrawer = ({ agent, onClose }: AgentDrawerProps) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!agent) return null;

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-border z-50 animate-slide-in-right overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 p-4 md:p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {agent.id}
                  </span>
                  {agent.hitl && (
                    <span className="px-2 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      HITL
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{agent.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{agent.persona}</p>
              </div>
              <button 
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="flex-shrink-0 w-full justify-start px-4 md:px-6 pt-4 bg-transparent border-b border-border rounded-none gap-1 overflow-x-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-secondary text-xs md:text-sm">
                <Target className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-secondary text-xs md:text-sm">
                <Wrench className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Tools</span>
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-secondary text-xs md:text-sm">
                <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Rules</span>
              </TabsTrigger>
              <TabsTrigger value="outputs" className="data-[state=active]:bg-secondary text-xs md:text-sm">
                <Box className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Outputs</span>
              </TabsTrigger>
              {(agent.codeExample || agent.outputTemplate) && (
                <TabsTrigger value="code" className="data-[state=active]:bg-secondary text-xs md:text-sm">
                  <Code className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Code</span>
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Goal */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Goal
                  </h4>
                  <p className="text-muted-foreground text-sm md:text-base">{agent.goal}</p>
                </div>

                {/* Mission */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Mission
                  </h4>
                  <p className="text-muted-foreground text-sm md:text-base">{agent.mission}</p>
                </div>

                {/* Decision Matrix (for A3) */}
                {agent.decisionMatrix && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Decision Matrix
                    </h4>
                    <div className="space-y-2">
                      {agent.decisionMatrix.map((row, i) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">{row.condition}</div>
                          <div className="font-mono text-sm text-primary">{row.stack}</div>
                          <div className="text-xs text-muted-foreground mt-1">→ {row.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mandatory Stack (for A3) */}
                {agent.mandatoryStack && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Mandatory Stack
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.mandatoryStack.map((tech, i) => (
                        <span key={i} className="chip chip-primary text-xs">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Gates (for A5) */}
                {agent.qualityGates && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success" />
                      Quality Gates
                    </h4>
                    <ul className="space-y-2">
                      {agent.qualityGates.map((gate, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
                          <span className="font-mono text-xs">{gate}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Flag */}
                {agent.flag && (
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-semibold text-sm">Sets Flag</span>
                    </div>
                    <p className="mt-1 font-mono text-sm text-success/80">{agent.flag} = true</p>
                  </div>
                )}
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="mt-0 space-y-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Available Tools
                </h4>
                <div className="space-y-3">
                  {agent.tools.map((tool, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div className="font-mono text-sm text-primary mb-1">{tool.name}</div>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Rules Tab */}
              <TabsContent value="rules" className="mt-0 space-y-6">
                {/* Rules */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Rules
                  </h4>
                  <ul className="space-y-2">
                    {agent.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Termination Rules */}
                {agent.terminationRules && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      Termination Rules
                    </h4>
                    <ul className="space-y-2">
                      {agent.terminationRules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-destructive/80">
                          <span className="w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            ✕
                          </span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Constraints */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Constraints
                  </h4>
                  <ul className="space-y-2">
                    {agent.constraints.map((constraint, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded-full bg-warning/10 text-warning flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          !
                        </span>
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              {/* Outputs Tab */}
              <TabsContent value="outputs" className="mt-0">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Box className="w-4 h-4 text-primary" />
                  Generated Outputs
                </h4>
                <div className="space-y-2">
                  {agent.outputs.map((output, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-mono text-xs md:text-sm text-foreground break-all">{output}</span>
                    </div>
                  ))}
                </div>

                {/* Output Template Preview */}
                {agent.outputTemplate && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Template Preview</h4>
                    <div className="rounded-lg bg-background border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-secondary/30 border-b border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">output_template.md</span>
                        <button
                          onClick={() => handleCopyCode(agent.outputTemplate!)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedCode ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3 text-xs font-mono text-muted-foreground overflow-x-auto max-h-60">
                        {agent.outputTemplate}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Code Tab */}
              {(agent.codeExample || agent.outputTemplate) && (
                <TabsContent value="code" className="mt-0">
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    Code Example
                  </h4>
                  {agent.codeExample && (
                    <div className="rounded-lg bg-background border border-border overflow-hidden">
                      <div className="px-3 py-2 bg-secondary/30 border-b border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">example.tsx</span>
                        <button
                          onClick={() => handleCopyCode(agent.codeExample!)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedCode ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3 text-xs font-mono text-muted-foreground overflow-x-auto">
                        {agent.codeExample}
                      </pre>
                    </div>
                  )}
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AgentDrawer;
