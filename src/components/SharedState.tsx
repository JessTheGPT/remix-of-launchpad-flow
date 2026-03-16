import { useState } from 'react';
import { Check, X, AlertCircle, Copy, ChevronRight } from 'lucide-react';
import { stateGroups, stateSchemaCode } from '@/data/specData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const flags = [
  { name: 'market_validated', status: true, agent: 'A1' },
  { name: 'scope_locked', status: true, agent: 'A2' },
  { name: 'architecture_approved', status: true, agent: 'A3' },
  { name: 'security_verified', status: false, agent: 'A7' },
  { name: 'deployment_ready', status: false, agent: 'A9' },
];

const SharedState = () => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(stateSchemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="shared-state" className="py-16 md:py-24 px-4 bg-card/30">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div 
          ref={ref}
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="chip chip-primary mb-4">State Machine</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Shared State Schema
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            A TypedDict that flows through all agents. Grouped into Core Data, Progress, Flags, and Errors.
          </p>
        </div>

        {/* Flag Status Bar */}
        <div className="mb-6 md:mb-8 p-4 rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Pipeline Flags</h4>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              {showCode ? 'Hide' : 'Show'} TypedDict
              <ChevronRight className={`w-3 h-3 transition-transform ${showCode ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          {/* Scrollable flags on mobile */}
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {flags.map((flag) => (
              <div 
                key={flag.name}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono
                  ${flag.status 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-muted text-muted-foreground border border-border'
                  }
                `}
              >
                {flag.status ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{flag.name}</span>
                <span className="sm:hidden">{flag.agent}</span>
              </div>
            ))}
          </div>

          {/* Code preview */}
          {showCode && (
            <div className="mt-4 rounded-lg bg-background border border-border overflow-hidden animate-fade-up">
              <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border">
                <span className="text-xs text-muted-foreground font-mono">state_schema.py</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-muted-foreground overflow-x-auto max-h-60">
                {stateSchemaCode}
              </pre>
            </div>
          )}
        </div>

        {/* State Groups Accordion */}
        <Accordion type="multiple" defaultValue={['Core Data', 'Flags']} className="space-y-3">
          {stateGroups.map((group) => (
            <AccordionItem 
              key={group.name} 
              value={group.name}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 md:px-5 py-4 hover:bg-secondary/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3">
                  <span className={`
                    w-2 h-2 rounded-full
                    ${group.name === 'Core Data' ? 'bg-primary' : ''}
                    ${group.name === 'Progress' ? 'bg-warning' : ''}
                    ${group.name === 'Flags' ? 'bg-success' : ''}
                    ${group.name === 'Errors' ? 'bg-destructive' : ''}
                  `} />
                  <span className="font-semibold text-foreground text-sm md:text-base">{group.name}</span>
                  <span className="text-xs text-muted-foreground">({group.fields.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 md:px-5 pb-4">
                <div className="space-y-2 pt-2">
                  {group.fields.map((field) => (
                    <div 
                      key={field.name}
                      className="p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="font-mono text-xs md:text-sm text-foreground">{field.name}</span>
                        <span className="text-[10px] md:text-xs text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">
                          {field.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                      {field.example && (
                        <p className="text-[10px] font-mono text-muted-foreground/70 mt-1">
                          Example: {field.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Error Panel */}
        <div className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">last_error</span>
          </div>
          <div className="p-3 rounded-lg bg-background/50 font-mono text-xs text-muted-foreground overflow-x-auto">
            <span className="text-destructive/60">null</span>
            <span className="text-muted-foreground/50"> // No errors in current pipeline run</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SharedState;
