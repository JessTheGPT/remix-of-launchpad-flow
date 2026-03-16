import { useEffect, useState } from 'react';
import { agents } from '@/data/specData';
import useReducedMotion from '@/hooks/useReducedMotion';

interface AnimatedPipelineFlowProps {
  activeAgent: number;
  onAgentClick?: (index: number) => void;
  className?: string;
  compact?: boolean;
}

const AnimatedPipelineFlow = ({ 
  activeAgent, 
  onAgentClick, 
  className = '',
  compact = false 
}: AnimatedPipelineFlowProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [pulsePosition, setPulsePosition] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setPulsePosition(prev => (prev + 1) % 100);
    }, 50);
    
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const nodeSize = compact ? 32 : 48;
  const gap = compact ? 8 : 16;

  return (
    <div className={`relative ${className}`}>
      {/* SVG for connecting lines */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset={`${pulsePosition - 10}%`} stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset={`${pulsePosition}%`} stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset={`${pulsePosition + 10}%`} stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Agent nodes */}
      <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap relative z-10">
        {agents.map((agent, index) => {
          const isActive = index === activeAgent;
          const isCompleted = index < activeAgent;
          const isHITL = agent.hitl;

          return (
            <div key={agent.id} className="flex items-center">
              {/* Node */}
              <button
                onClick={() => onAgentClick?.(index)}
                className={`
                  relative flex items-center justify-center rounded-xl
                  text-xs md:text-sm font-semibold transition-all duration-500
                  ${isActive 
                    ? 'bg-primary text-primary-foreground scale-110' 
                    : isCompleted 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'bg-secondary text-muted-foreground border border-border'
                  }
                  ${onAgentClick ? 'cursor-pointer hover:scale-105' : ''}
                `}
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  boxShadow: isActive ? 'var(--glow-primary-strong)' : 'none',
                }}
              >
                {agent.id}
                
                {/* HITL indicator */}
                {isHITL && (
                  <span 
                    className={`
                      absolute -top-1 -right-1 w-3 h-3 rounded-full
                      ${isCompleted || isActive ? 'bg-warning' : 'bg-warning/50'}
                    `}
                  />
                )}

                {/* Pulse ring for active */}
                {isActive && !prefersReducedMotion && (
                  <span className="absolute inset-0 rounded-xl animate-ping bg-primary/30" />
                )}
              </button>

              {/* Connector line */}
              {index < agents.length - 1 && (
                <div className="relative">
                  <div 
                    className={`
                      h-0.5 transition-all duration-500
                      ${isCompleted ? 'bg-primary' : 'bg-border'}
                    `}
                    style={{ width: compact ? 16 : 32 }}
                  />
                  
                  {/* Animated pulse dot */}
                  {isActive && !prefersReducedMotion && (
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-flow-pulse"
                      style={{ 
                        left: '0%',
                        animation: 'flow-pulse 1.5s ease-in-out infinite'
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedPipelineFlow;
