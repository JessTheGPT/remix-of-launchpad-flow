import { Play, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { finalOutputs, agents } from '@/data/specData';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const ExecutionFlow = () => {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="execution" className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div 
          ref={ref}
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="chip chip-primary mb-4">
            <Play className="w-3 h-3 mr-1" />
            Execution
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Execution Flow & Outputs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            From initialization to production deployment, each agent produces specific outputs with validation flags.
          </p>
        </div>

        {/* Execution Steps */}
        <div className="space-y-4 mb-8 md:mb-12">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Initialize State</h4>
              <p className="text-sm text-muted-foreground">
                Set <code className="text-primary">raw_idea</code>, <code className="text-primary">founder_profile</code>, 
                and all flags to <code className="text-primary">False</code>
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Run the Graph</h4>
              <p className="text-sm text-muted-foreground">
                Execute <code className="text-primary">result = app.invoke(state)</code> — 
                agents process sequentially with HITL pauses
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <span className="text-success font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Monitor & Deploy</h4>
              <p className="text-sm text-muted-foreground">
                Check <code className="text-primary">agent_status</code> for progress. 
                When <code className="text-success">deployment_ready = True</code>, ship to production
              </p>
            </div>
          </div>
        </div>

        {/* Final Outputs Table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-secondary/30 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Final Outputs by Agent</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/20">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Output Files</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Validation Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {finalOutputs.map((output, i) => (
                  <tr key={i} className="bg-card">
                    <td className="px-4 py-3">
                      <span className="chip chip-primary text-xs">{output.agent}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {output.outputFiles.map((file, j) => (
                          <span key={j} className="text-[10px] md:text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                            {file}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {output.validationFlag === 'N/A' ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <span className="text-xs font-mono text-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {output.validationFlag}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mt-6 md:mt-8 grid grid-cols-3 gap-3 md:gap-4">
          <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
            <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-bold text-success">6</p>
          </div>
          <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 text-center">
            <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-lg font-bold text-warning">1</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary border border-border text-center">
            <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-muted-foreground">2</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutionFlow;
