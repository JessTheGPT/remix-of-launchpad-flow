import { useState } from 'react';
import { Copy, Check, Download, Code, FileJson, BookOpen } from 'lucide-react';
import { stateSchemaCode, langGraphCode, specJson } from '@/data/specData';

const Footer = () => {
  const [copiedState, setCopiedState] = useState(false);
  const [copiedGraph, setCopiedGraph] = useState(false);

  const handleCopyState = async () => {
    await navigator.clipboard.writeText(stateSchemaCode);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleCopyGraph = async () => {
    await navigator.clipboard.writeText(langGraphCode);
    setCopiedGraph(true);
    setTimeout(() => setCopiedGraph(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(specJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elite-launch-squad-spec.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <footer className="py-12 md:py-16 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        {/* Quick Actions */}
        <div className="text-center mb-8 md:mb-12">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Quick Export</h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-6">
            Copy code snippets or download the complete specification
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 md:gap-4">
            <button
              onClick={handleCopyState}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs md:text-sm font-medium transition-all"
            >
              {copiedState ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  <span>Copy State Schema</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyGraph}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs md:text-sm font-medium transition-all"
            >
              {copiedGraph ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-success">Copied!</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Copy LangGraph Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadJson}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs md:text-sm font-medium transition-all hover:opacity-90"
              style={{ boxShadow: 'var(--glow-primary)' }}
            >
              <Download className="w-4 h-4" />
              <span>Download Full Spec (JSON)</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-6 md:mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="text-gradient font-semibold">Elite 9-Agent Launch Squad</span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="hidden sm:inline">Powered by LangGraph</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pipeline" className="hover:text-foreground transition-colors">Agents</a>
            <a href="#shared-state" className="hover:text-foreground transition-colors">State</a>
            <a href="#hitl" className="hover:text-foreground transition-colors">HITL</a>
            <a href="#execution" className="hover:text-foreground transition-colors">Execution</a>
            <a href="#repo-map" className="hover:text-foreground transition-colors">Repo</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
