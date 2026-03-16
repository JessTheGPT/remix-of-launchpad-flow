import { Copy, Check, Play, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { langGraphCode, executionFlowCode } from '@/data/specData';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const LangGraphMapping = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'execution'>('graph');
  const { ref, isIntersecting } = useIntersectionObserver();

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="langgraph" className="py-16 md:py-24 px-4 bg-card/30">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div 
          ref={ref}
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="chip chip-primary mb-4">LangGraph</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            LangGraph Node Mapping
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            The pipeline maps directly to LangGraph nodes with conditional edges for HITL checkpoints.
          </p>
        </div>

        {/* Concept cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6 md:mb-8">
          <div className="p-4 md:p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-sm md:text-base">add_node()</h4>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Each agent (A1–A9) becomes a node that receives state, performs work, and returns updated state.
            </p>
          </div>
          <div className="p-4 md:p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-warning" />
              </div>
              <h4 className="font-semibold text-foreground text-sm md:text-base">add_conditional_edges()</h4>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              HITL checkpoints use conditional edges to route to next agent or END based on approval.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'graph' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Graph Definition
          </button>
          <button
            onClick={() => setActiveTab('execution')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'execution' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Execution Flow
          </button>
        </div>

        {/* Code block */}
        <div className="relative rounded-2xl bg-background border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive/50" />
              <span className="w-3 h-3 rounded-full bg-warning/50" />
              <span className="w-3 h-3 rounded-full bg-success/50" />
              <span className="ml-3 text-[10px] md:text-xs text-muted-foreground font-mono">
                {activeTab === 'graph' ? 'langgraph_pipeline.py' : 'execute_pipeline.py'}
              </span>
            </div>
            <button
              onClick={() => handleCopy(
                activeTab === 'graph' ? langGraphCode : executionFlowCode, 
                activeTab
              )}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-xs md:text-sm transition-colors"
            >
              {copied === activeTab ? (
                <>
                  <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-success" />
                  <span className="text-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-[10px] md:text-xs leading-relaxed font-mono max-h-[400px]">
            <code className="text-muted-foreground">
              {(activeTab === 'graph' ? langGraphCode : executionFlowCode).split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="w-6 md:w-8 text-muted-foreground/50 select-none flex-shrink-0 text-right pr-3">
                    {i + 1}
                  </span>
                  <span className={
                    line.includes('#') ? 'text-muted-foreground/60' :
                    line.includes('def ') || line.includes('graph.') || line.includes('app.') ? 'text-primary' :
                    line.includes('"') || line.includes("'") ? 'text-success' :
                    ''
                  }>
                    {line}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>

        {/* How to Use */}
        <div className="mt-8 md:mt-12 p-4 md:p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">How to Use This Spec</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium text-foreground mb-2 text-sm">For Humans</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Follow the repository structure</li>
                <li>• Use file templates as guides</li>
                <li>• Approve/reject at HITL points</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium text-foreground mb-2 text-sm">For LangGraph</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Map each agent to a node</li>
                <li>• Use shared state schema</li>
                <li>• Implement conditional edges</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium text-foreground mb-2 text-sm">For Deployment</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• A9 handles hosting + CI/CD</li>
                <li>• No manual steps after approval</li>
                <li>• deployment_ready = True → ship</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LangGraphMapping;
