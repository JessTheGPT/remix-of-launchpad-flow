import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  GripVertical,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CodeBlock } from '@/components/CodeBlock';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentDraft {
  id: string;
  name: string;
  role: string;
  description: string;
  tools: string[];
  hitl_checkpoint: boolean;
}

const Builder = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [agents, setAgents] = useState<AgentDraft[]>([
    { id: '1', name: '', role: '', description: '', tools: [], hitl_checkpoint: false }
  ]);
  const [saving, setSaving] = useState(false);
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<string>('');
  const [copiedExport, setCopiedExport] = useState(false);

  const generateCrewAIYAML = (): string => {
    let yaml = `# ${teamName}\n# ${teamDescription}\n\nagents:\n`;
    agents.forEach(agent => {
      const id = agent.name.toLowerCase().replace(/\s+/g, '_') || 'unnamed';
      yaml += `  ${id}:\n`;
      yaml += `    role: "${agent.role || agent.name}"\n`;
      yaml += `    goal: "Execute ${agent.role || agent.name} responsibilities"\n`;
      yaml += `    backstory: "${agent.description || agent.role || agent.name}"\n`;
      if (agent.tools.length > 0 && agent.tools[0]) {
        yaml += `    tools:\n`;
        agent.tools.forEach(t => { if (t) yaml += `      - ${t}\n`; });
      }
      if (agent.hitl_checkpoint) yaml += `    human_input: true\n`;
      yaml += `    allow_delegation: false\n\n`;
    });
    yaml += `tasks:\n`;
    agents.forEach((agent, i) => {
      const id = agent.name.toLowerCase().replace(/\s+/g, '_') || 'unnamed';
      yaml += `  task_${i + 1}:\n`;
      yaml += `    description: "${agent.description || `Execute ${agent.role || agent.name} tasks`}"\n`;
      yaml += `    agent: ${id}\n`;
      yaml += `    expected_output: "Completed ${agent.role || agent.name} output"\n\n`;
    });
    return yaml;
  };

  const generateOpenAIJSON = (): string => {
    const assistants = agents.map(agent => ({
      name: agent.name,
      instructions: agent.description || `You are the ${agent.role || agent.name}.`,
      tools: agent.tools.filter(Boolean).map(t => ({
        type: "function",
        function: { name: t, description: `${t} capability` }
      })),
      model: "gpt-4o"
    }));
    return JSON.stringify({ name: teamName, description: teamDescription, assistants }, null, 2);
  };

  const generateLangGraphPython = (): string => {
    let py = `"""${teamName} - LangGraph Pipeline"""\n`;
    py += `from typing import TypedDict, Annotated\n`;
    py += `from langgraph.graph import StateGraph, END\n`;
    py += `from langgraph.checkpoint.memory import MemorySaver\n\n`;
    py += `class TeamState(TypedDict):\n`;
    py += `    messages: list[str]\n`;
    py += `    current_agent: str\n`;
    py += `    results: dict\n\n`;
    agents.forEach(agent => {
      const fn = agent.name.toLowerCase().replace(/\s+/g, '_') || 'unnamed';
      py += `def ${fn}_node(state: TeamState) -> TeamState:\n`;
      py += `    """${agent.role || agent.name}: ${agent.description || 'Execute tasks'}"""\n`;
      py += `    # TODO: Implement ${agent.name} logic\n`;
      py += `    return {**state, "current_agent": "${agent.name}"}\n\n`;
    });
    py += `# Build graph\n`;
    py += `workflow = StateGraph(TeamState)\n\n`;
    agents.forEach(agent => {
      const fn = agent.name.toLowerCase().replace(/\s+/g, '_') || 'unnamed';
      py += `workflow.add_node("${fn}", ${fn}_node)\n`;
    });
    py += `\n`;
    agents.forEach((agent, i) => {
      const fn = agent.name.toLowerCase().replace(/\s+/g, '_') || 'unnamed';
      if (i === 0) py += `workflow.set_entry_point("${fn}")\n`;
      if (i < agents.length - 1) {
        const next = agents[i + 1].name.toLowerCase().replace(/\s+/g, '_') || 'unnamed';
        py += `workflow.add_edge("${fn}", "${next}")\n`;
      } else {
        py += `workflow.add_edge("${fn}", END)\n`;
      }
    });
    py += `\ncheckpointer = MemorySaver()\n`;
    py += `app = workflow.compile(checkpointer=checkpointer)\n`;
    return py;
  };

  const showExport = (format: string) => {
    let code = '';
    if (format === 'crewai') code = generateCrewAIYAML();
    else if (format === 'openai') code = generateOpenAIJSON();
    else if (format === 'langgraph') code = generateLangGraphPython();
    setExportFormat(format);
    setExportPreview(code);
  };

  const copyExport = async () => {
    if (!exportPreview) return;
    await navigator.clipboard.writeText(exportPreview);
    setCopiedExport(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const addAgent = () => {
    setAgents([
      ...agents,
      { 
        id: crypto.randomUUID(), 
        name: '', 
        role: '', 
        description: '', 
        tools: [], 
        hitl_checkpoint: false 
      }
    ]);
  };

  const removeAgent = (id: string) => {
    if (agents.length > 1) {
      setAgents(agents.filter(a => a.id !== id));
    }
  };

  const updateAgent = (id: string, field: keyof AgentDraft, value: any) => {
    setAgents(agents.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (agents.some(a => !a.name.trim())) {
      toast.error('All agents need a name');
      return;
    }

    setSaving(true);
    const slug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          slug,
          description: teamDescription
        })
        .select()
        .single();

      if (teamError) throw teamError;

      const agentInserts = agents.map((agent, index) => ({
        team_id: team.id,
        name: agent.name,
        role: agent.role,
        description: agent.description,
        tools: agent.tools,
        hitl_checkpoint: agent.hitl_checkpoint,
        order_index: index
      }));

      const { error: agentsError } = await supabase
        .from('agents')
        .insert(agentInserts);

      if (agentsError) throw agentsError;

      toast.success('Team saved!');
      navigate('/resources?tab=teams');
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error('Failed to save team');
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Build Agent Team</h1>
            <p className="text-muted-foreground text-sm">
              Design a custom agent team with roles, tools, and HITL checkpoints
            </p>
          </div>
        </div>

        {/* Team Info */}
        <Card variant="glass" className="p-6 mb-4">
          <h2 className="text-base font-semibold text-foreground mb-4">Team Info</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName" className="text-sm">Team Name</Label>
              <Input
                id="teamName"
                placeholder="e.g. Product Launch Squad"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="teamDesc" className="text-sm">Description</Label>
              <Textarea
                id="teamDesc"
                placeholder="What does this team do?"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>

        {/* Agents */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Agents</h2>
            <Button variant="outline" size="sm" onClick={addAgent}>
              <Plus className="w-4 h-4 mr-1" />
              Add Agent
            </Button>
          </div>

          {agents.map((agent, index) => (
            <Card key={agent.id} variant="premium" className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <Input
                  placeholder="Agent name"
                  value={agent.name}
                  onChange={(e) => updateAgent(agent.id, 'name', e.target.value)}
                  className="flex-1"
                />
                {agents.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAgent(agent.id)}
                    className="text-destructive hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm">Role</Label>
                  <Input
                    placeholder="e.g. Research, Writer, Reviewer"
                    value={agent.role}
                    onChange={(e) => updateAgent(agent.id, 'role', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Tools (comma separated)</Label>
                  <Input
                    placeholder="e.g. web_search, file_read, code_execute"
                    value={agent.tools.join(', ')}
                    onChange={(e) => updateAgent(agent.id, 'tools', e.target.value.split(',').map(t => t.trim()))}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-sm">Description</Label>
                <Textarea
                  placeholder="What does this agent do?"
                  value={agent.description}
                  onChange={(e) => updateAgent(agent.id, 'description', e.target.value)}
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id={`hitl-${agent.id}`}
                  checked={agent.hitl_checkpoint}
                  onCheckedChange={(checked) => updateAgent(agent.id, 'hitl_checkpoint', checked)}
                />
                <Label htmlFor={`hitl-${agent.id}`} className="text-sm text-muted-foreground">
                  HITL Checkpoint (require human approval after this agent)
                </Label>
              </div>
            </Card>
          ))}
        </div>

        {/* Export Preview */}
        {exportPreview && (
          <Card variant="glass" className="p-5 mb-6 animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Export Preview — {exportFormat === 'crewai' ? 'CrewAI YAML' : exportFormat === 'openai' ? 'OpenAI JSON' : 'LangGraph Python'}
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyExport}>
                  {copiedExport ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedExport ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setExportPreview(null)}>Close</Button>
              </div>
            </div>
            <CodeBlock 
              code={exportPreview} 
              language={exportFormat === 'crewai' ? 'yaml' : exportFormat === 'openai' ? 'json' : 'python'} 
              maxHeight="300px"
              showLineNumbers 
            />
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1.5" />
                Export Config
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => showExport('crewai')}>CrewAI YAML</DropdownMenuItem>
              <DropdownMenuItem onClick={() => showExport('langgraph')}>LangGraph Python</DropdownMenuItem>
              <DropdownMenuItem onClick={() => showExport('openai')}>OpenAI Assistants JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Crew
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
