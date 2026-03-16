import { FileText, Activity } from 'lucide-react';
import { IdeaDocument } from './DocumentPanel';
import AgentActivityFeed from './AgentActivityFeed';
import DocumentViewer from './DocumentViewer';
import type { ActivityEvent } from '@/pages/Startup';

interface CenterCanvasProps {
  view: { type: 'activity' | 'document' | 'agent_thread'; id?: string };
  documents: IdeaDocument[];
  activityFeed: ActivityEvent[];
  onDocumentUpdate?: (docId: string, content: string) => void;
  generating?: boolean;
}

const CenterCanvas = ({ view, documents, activityFeed, onDocumentUpdate, generating }: CenterCanvasProps) => {
  if (view.type === 'document' && view.id) {
    const doc = documents.find(d => d.id === view.id);
    if (doc) {
      return <DocumentViewer document={doc} onUpdate={onDocumentUpdate} />;
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-card/30">
        <Activity className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Agent Activity</span>
        {generating && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-medium">Agents working</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <AgentActivityFeed events={activityFeed} />
      </div>
    </div>
  );
};

export default CenterCanvas;
