import { useState } from 'react';
import { agents } from '@/data/specData';
import AgentCard from './AgentCard';
import AgentDrawer from './AgentDrawer';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { Users } from 'lucide-react';

const Pipeline = () => {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const { ref: headerRef, isIntersecting: headerVisible } = useIntersectionObserver();

  return (
    <section id="pipeline" className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="chip chip-primary mb-4">Pipeline</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            9 Specialized Agents
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Each agent has a specific role, tools, and outputs. Click any agent to explore its full specification.
          </p>
        </div>

        {/* Pipeline visualization - Desktop */}
        <div className="relative mb-8 hidden lg:block">
          {/* Background line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {/* Animated progress line */}
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 transition-all duration-500"
            style={{ 
              width: selectedAgent !== null ? `${((selectedAgent + 1) / 9) * 100}%` : '0%',
              opacity: selectedAgent !== null ? 1 : 0
            }}
          />

          <div className="flex justify-between px-4 md:px-8">
            {agents.map((agent, i) => (
              <div key={agent.id} className="relative group">
                <button
                  onClick={() => setSelectedAgent(selectedAgent === i ? null : i)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-300 cursor-pointer
                    ${selectedAgent === i 
                      ? 'bg-primary text-primary-foreground scale-125 shadow-lg' 
                      : selectedAgent !== null && i < selectedAgent
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-secondary text-muted-foreground border border-border hover:border-primary/50 hover:scale-110'
                    }
                  `}
                  style={{
                    boxShadow: selectedAgent === i ? 'var(--glow-primary-strong)' : 'none'
                  }}
                >
                  {i + 1}
                </button>
                
                {/* Agent name tooltip */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-[10px] text-muted-foreground">{agent.name}</span>
                </div>

                {/* HITL indicator */}
                {agent.hitl && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-warning font-medium whitespace-nowrap">
                    <Users className="w-3 h-3" />
                    HITL
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile mini-map */}
        <div className="lg:hidden mb-6 p-4 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {agents.map((agent, i) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(selectedAgent === i ? null : i)}
                className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                  transition-all duration-200
                  ${selectedAgent === i 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground'
                  }
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {selectedAgent !== null && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              <span className="text-primary font-medium">{agents[selectedAgent].id}</span>
              {' • '}
              {agents[selectedAgent].name}
            </p>
          )}
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={index}
              isActive={selectedAgent === index}
              onSelect={() => setSelectedAgent(selectedAgent === index ? null : index)}
            />
          ))}
        </div>
      </div>

      {/* Agent Drawer */}
      <AgentDrawer 
        agent={selectedAgent !== null ? agents[selectedAgent] : null}
        onClose={() => setSelectedAgent(null)}
      />
    </section>
  );
};

export default Pipeline;
