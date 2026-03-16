import { useEffect, useState } from 'react';
import { ArrowDown, Workflow, Users, FolderTree, Zap } from 'lucide-react';
import { agents } from '@/data/specData';
import AnimatedPipelineFlow from './AnimatedPipelineFlow';
import useReducedMotion from '@/hooks/useReducedMotion';

const Hero = () => {
  const [activeAgent, setActiveAgent] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % 9);
    }, 2000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-hero)' }}
      />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Floating particles (decorative) */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30 animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 md:mb-8 rounded-full bg-primary/10 border border-primary/20 animate-fade-up">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs md:text-sm font-medium text-primary">LangGraph State Machine</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 animate-fade-up stagger-1" style={{ opacity: 0 }}>
          <span className="text-foreground">Elite </span>
          <span className="text-gradient">9-Agent</span>
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          <span className="text-foreground">Launch Squad</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 animate-fade-up stagger-2 px-2" style={{ opacity: 0 }}>
          From raw idea to production-ready SaaS in a single autonomous pipeline. 
          Human-in-the-loop checkpoints ensure quality at every critical stage.
        </p>

        {/* Animated Pipeline Preview */}
        <div className="mb-8 md:mb-12 py-4 md:py-8 animate-fade-up stagger-3" style={{ opacity: 0 }}>
          <AnimatedPipelineFlow 
            activeAgent={activeAgent}
            onAgentClick={setActiveAgent}
            compact={typeof window !== 'undefined' && window.innerWidth < 640}
          />
          
          {/* Active Agent Label */}
          <div className="mt-4 md:mt-6 min-h-[2rem] flex flex-col items-center justify-center gap-1">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-semibold">{agents[activeAgent].id}</span>
              <span className="mx-2 hidden sm:inline">→</span>
              <span className="sm:hidden">: </span>
              <span className="font-medium">{agents[activeAgent].name}</span>
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-md hidden md:block">
              {agents[activeAgent].goal}
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up stagger-4 px-4" style={{ opacity: 0 }}>
          <button
            onClick={() => scrollToSection('shared-state')}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium transition-all hover:border-primary/50"
          >
            <Workflow className="w-4 h-4" />
            View State Machine
          </button>
          <button
            onClick={() => scrollToSection('pipeline')}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:opacity-90"
            style={{ boxShadow: 'var(--glow-primary)' }}
          >
            <Users className="w-4 h-4" />
            View Agents
          </button>
          <button
            onClick={() => scrollToSection('repo-map')}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium transition-all hover:border-primary/50"
          >
            <FolderTree className="w-4 h-4" />
            View Repo
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <button 
          onClick={() => scrollToSection('pipeline')}
          className="p-2 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          <ArrowDown className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
