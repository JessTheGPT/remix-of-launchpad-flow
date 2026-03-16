import { Plus, ChevronDown, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface StartupIdea {
  id: string;
  title: string;
  description: string | null;
  status: string;
  current_phase: string;
  created_at: string;
}

interface IdeaSelectorProps {
  ideas: StartupIdea[];
  activeIdea: StartupIdea | null;
  onSelect: (idea: StartupIdea) => void;
  onNew: () => void;
}

const phaseLabels: Record<string, string> = {
  intake: 'Intake',
  strategy: 'Strategy',
  execution: 'Execution',
  synthesis: 'Synthesis',
  launch: 'Launch Ready',
};

const IdeaSelector = ({ ideas, activeIdea, onSelect, onNew }: IdeaSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 gap-2 text-sm max-w-[240px]">
            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="truncate">
              {activeIdea?.title || 'Select idea'}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {ideas.map(idea => (
            <DropdownMenuItem
              key={idea.id}
              onClick={() => onSelect(idea)}
              className="flex items-center gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{idea.title}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {phaseLabels[idea.current_phase] || idea.current_phase}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
          {ideas.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={onNew} className="text-primary">
            <Plus className="w-3.5 h-3.5 mr-2" />
            New Idea
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" onClick={onNew} className="h-9 gap-1.5">
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">New Idea</span>
      </Button>
    </div>
  );
};

export default IdeaSelector;
