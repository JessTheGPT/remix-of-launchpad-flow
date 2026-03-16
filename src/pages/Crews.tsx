import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Boxes, 
  Plus, 
  Search, 
  Users, 
  ArrowRight, 
  Copy, 
  Check, 
  Trash2,
  Download,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  agents?: Agent[];
}

interface Agent {
  id: string;
  name: string;
  role: string | null;
  tools: unknown;
  hitl_checkpoint: boolean | null;
}

const Crews = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamsData && teamsData.length > 0) {
      const { data: agentsData } = await supabase
        .from('agents')
        .select('id, name, role, tools, hitl_checkpoint, team_id')
        .in('team_id', teamsData.map(t => t.id))
        .order('order_index');

      const teamsWithAgents = teamsData.map(team => ({
        ...team,
        agents: (agentsData || []).filter(a => a.team_id === team.id)
      }));
      setTeams(teamsWithAgents);
    } else {
      setTeams([]);
    }
    setLoading(false);
  };

  const deleteTeam = async (id: string) => {
    await supabase.from('agents').delete().eq('team_id', id);
    await supabase.from('teams').delete().eq('id', id);
    toast.success('Crew deleted');
    fetchTeams();
  };

  const exportCrewYAML = (team: Team) => {
    const yaml = generateCrewAIYAML(team);
    navigator.clipboard.writeText(yaml);
    setCopiedId(`yaml-${team.id}`);
    toast.success('CrewAI YAML copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCrewJSON = (team: Team) => {
    const json = generateOpenAIJSON(team);
    navigator.clipboard.writeText(json);
    setCopiedId(`json-${team.id}`);
    toast.success('OpenAI JSON copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateCrewAIYAML = (team: Team): string => {
    const agents = team.agents || [];
    let yaml = `# ${team.name}\n# ${team.description || ''}\n\nagents:\n`;
    agents.forEach(agent => {
      const tools = Array.isArray(agent.tools) ? agent.tools : [];
      yaml += `  ${agent.name.toLowerCase().replace(/\s+/g, '_')}:\n`;
      yaml += `    role: "${agent.role || agent.name}"\n`;
      yaml += `    goal: "Execute ${agent.role || agent.name} responsibilities"\n`;
      yaml += `    backstory: "${agent.role || agent.name} agent"\n`;
      if (tools.length > 0) {
        yaml += `    tools:\n`;
        tools.forEach((t: unknown) => { yaml += `      - ${t}\n`; });
      }
      yaml += `    allow_delegation: false\n\n`;
    });
    yaml += `tasks:\n`;
    agents.forEach((agent, i) => {
      yaml += `  task_${i + 1}:\n`;
      yaml += `    description: "Execute ${agent.role || agent.name} tasks"\n`;
      yaml += `    agent: ${agent.name.toLowerCase().replace(/\s+/g, '_')}\n`;
      yaml += `    expected_output: "Completed ${agent.role || agent.name} output"\n\n`;
    });
    return yaml;
  };

  const generateOpenAIJSON = (team: Team): string => {
    const agents = (team.agents || []).map(agent => {
      const tools = Array.isArray(agent.tools) ? agent.tools : [];
      return {
        name: agent.name,
        instructions: `You are the ${agent.role || agent.name}. Execute your responsibilities with precision.`,
        tools: tools.map((t: unknown) => ({
          type: "function",
          function: { name: String(t), description: `${t} capability` }
        })),
        model: "gpt-4o"
      };
    });
    return JSON.stringify({ name: team.name, description: team.description, assistants: agents }, null, 2);
  };

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Boxes className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">Crews</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Multi-agent team configurations. Browse, fork, and export.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search crews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 w-56"
              />
            </div>
            <Link to="/builder">
              <Button size="sm" className="h-9">
                <Plus className="w-4 h-4 mr-1.5" />
                New Crew
              </Button>
            </Link>
          </div>
        </div>

        {/* Crews Grid */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card variant="glass" className="text-center py-16">
            <Boxes className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No crews yet. Build your first agent team.</p>
            <Link to="/builder">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Build Crew
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((team) => (
              <Card key={team.id} variant="premium" className="p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-primary/8 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{team.name}</h3>
                      {team.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{team.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportCrewYAML(team)}>
                          Export CrewAI YAML
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportCrewJSON(team)}>
                          Export OpenAI JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteTeam(team.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Agent pills */}
                {team.agents && team.agents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {team.agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/80 border border-border/40 text-xs"
                      >
                        <Bot className="w-3 h-3 text-primary" />
                        <span className="text-foreground font-medium">{agent.name}</span>
                        {agent.role && (
                          <span className="text-muted-foreground">· {agent.role}</span>
                        )}
                        {agent.hitl_checkpoint && (
                          <span className="w-1.5 h-1.5 rounded-full bg-warning" title="HITL Checkpoint" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Crews;
