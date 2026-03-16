import { RefreshCw, GitBranch, Clock, ShieldAlert, XCircle, ArrowLeft, AlertTriangle, Skull } from 'lucide-react';
import { errorHandlers, failureModes } from '@/data/specData';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const iconMap: Record<string, React.ReactNode> = {
  'refresh-cw': <RefreshCw className="w-5 h-5" />,
  'git-branch': <GitBranch className="w-5 h-5" />,
  'clock': <Clock className="w-5 h-5" />,
  'shield-alert': <ShieldAlert className="w-5 h-5" />,
  'x-circle': <XCircle className="w-5 h-5" />,
  'skull': <Skull className="w-5 h-5" />,
  'shield-x': <ShieldAlert className="w-5 h-5" />,
  'x-octagon': <XCircle className="w-5 h-5" />,
};

const ErrorHandling = () => {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="error-handling" className="py-16 md:py-24 px-4 bg-card/30">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div 
          ref={ref}
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="chip chip-destructive mb-4">Error Handling</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Error Recovery Loops
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            The pipeline handles failures gracefully with specific recovery strategies for each error type.
          </p>
        </div>

        {/* Error handlers grid */}
        <div className="grid gap-3 md:gap-4">
          {errorHandlers.map((handler, index) => (
            <div 
              key={handler.type}
              className={`
                group relative flex flex-col sm:flex-row sm:items-start gap-4 p-4 md:p-5 rounded-2xl 
                bg-card border border-border hover:border-primary/30 transition-all
                ${isIntersecting ? 'animate-fade-up' : 'opacity-0'}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center
                ${handler.critical 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-warning/10 text-warning'
                }
              `}>
                {iconMap[handler.icon]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">{handler.type}</h3>
                  {handler.critical && (
                    <span className="chip chip-destructive text-[10px]">CRITICAL</span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">{handler.trigger}</p>
                
                {/* Action */}
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                  <span className="text-primary font-medium">{handler.action}</span>
                </div>

                {/* Loop target */}
                {handler.loopTarget && (
                  <div className="mt-2 text-[10px] md:text-xs text-muted-foreground font-mono">
                    → Loop to: <span className="text-warning">{handler.loopTarget}</span>
                  </div>
                )}
              </div>

              {/* Loop indicator */}
              <div className="hidden md:flex items-center gap-2 text-muted-foreground flex-shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                  <RefreshCw className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Failure Modes Table */}
        <div className="mt-8 md:mt-12">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Failure Modes
          </h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Failure</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Recovery Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {failureModes.map((mode, i) => (
                    <tr key={i} className="bg-card">
                      <td className="px-4 py-3 text-xs md:text-sm text-foreground">{mode.failure}</td>
                      <td className="px-4 py-3 text-xs md:text-sm text-muted-foreground font-mono">{mode.recovery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Visual loop diagram */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 rounded-2xl bg-secondary/30 border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-4">Example: Contract Mismatch Loop</h4>
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs md:text-sm">
            <span className="px-3 py-1.5 rounded-lg bg-card border border-border font-mono">A5/A6</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">Mismatch!</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Loop
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-card border border-border font-mono">A3</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ErrorHandling;
