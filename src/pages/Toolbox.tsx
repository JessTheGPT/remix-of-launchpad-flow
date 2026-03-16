import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Wrench, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2,
  ExternalLink,
  Server,
  Code,
  Zap,
  Globe,
  Sparkles,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CodeBlock } from '@/components/CodeBlock';

type ToolType = 'function' | 'mcp' | 'api' | 'script' | 'skill';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  schema: unknown;
  example_usage: string | null;
  category: string | null;
  tags: string[];
  is_public: boolean;
  created_at: string;
  source_url: string | null;
  script_content: string | null;
  language: string | null;
  mcp_config: unknown;
}

const TOOL_TYPES: { value: ToolType; label: string; icon: React.ReactNode }[] = [
  { value: 'function', label: 'Function', icon: <Code className="w-4 h-4" /> },
  { value: 'mcp', label: 'MCP Server', icon: <Server className="w-4 h-4" /> },
  { value: 'api', label: 'API', icon: <Globe className="w-4 h-4" /> },
  { value: 'script', label: 'Script', icon: <Zap className="w-4 h-4" /> },
  { value: 'skill', label: 'Skill', icon: <Sparkles className="w-4 h-4" /> },
];

const LANGUAGES = ['javascript', 'typescript', 'python', 'bash', 'json', 'yaml', 'sql'];

const Toolbox = () => {
  const [searchParams] = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add');
  const [toolType, setToolType] = useState<ToolType>('function');
  const [language, setLanguage] = useState('javascript');
  const [formData, setFormData] = useState({
    title: '', description: '', content: '', category: '', tags: '',
    sourceUrl: '', schema: '', exampleUsage: '', mcpConfig: '',
  });

  useEffect(() => { fetchTools(); }, []);

  const fetchTools = async () => {
    setLoading(true);
    const { data } = await supabase.from('tools').select('*').order('created_at', { ascending: false });
    setTools(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', content: '', category: '', tags: '', sourceUrl: '', schema: '', exampleUsage: '', mcpConfig: '' });
    setToolType('function');
    setLanguage('javascript');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    let schemaObj = {};
    let mcpObj = {};
    try { if (formData.schema) schemaObj = JSON.parse(formData.schema); } catch { toast.error('Invalid schema JSON'); return; }
    try { if (formData.mcpConfig) mcpObj = JSON.parse(formData.mcpConfig); } catch { toast.error('Invalid MCP config JSON'); return; }

    const { error } = await supabase.from('tools').insert({
      name: formData.title, slug, description: formData.description || null,
      type: toolType, schema: schemaObj, example_usage: formData.exampleUsage || null,
      category: formData.category || null, tags, source_url: formData.sourceUrl || null,
      script_content: toolType === 'script' ? formData.content : null,
      language: toolType === 'script' ? language : null, mcp_config: mcpObj,
    });

    if (error) { toast.error('Failed to add tool'); return; }
    toast.success('Tool added');
    setShowForm(false);
    resetForm();
    fetchTools();
  };

  const deleteTool = async (id: string) => {
    await supabase.from('tools').delete().eq('id', id);
    toast.success('Deleted');
    fetchTools();
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: string) => {
    const found = TOOL_TYPES.find(t => t.value === type);
    return found?.icon || <Wrench className="w-4 h-4" />;
  };

  const filtered = tools.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">Toolbox</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Functions, MCP servers, APIs, scripts, and skills for your agents.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tools..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-56" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>All Types</DropdownMenuItem>
                {TOOL_TYPES.map(t => (
                  <DropdownMenuItem key={t.value} onClick={() => setFilterType(t.value)}>
                    {t.icon}<span className="ml-2">{t.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-9" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Tool
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card variant="glass" className="p-6 mb-6 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {TOOL_TYPES.map(t => (
                  <Button key={t.value} type="button" variant={toolType === t.value ? 'default' : 'outline'} size="sm" onClick={() => setToolType(t.value)} className="gap-1.5">
                    {t.icon}{t.label}
                  </Button>
                ))}
              </div>
              <Input placeholder="Tool name" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              
              {toolType === 'script' && (
                <>
                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Textarea placeholder="Script content..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={10} className="font-mono text-sm" />
                </>
              )}
              {toolType === 'mcp' && (
                <Textarea placeholder='MCP Config JSON: {"server": "...", "tools": [...]}' value={formData.mcpConfig} onChange={(e) => setFormData({ ...formData, mcpConfig: e.target.value })} rows={6} className="font-mono text-sm" />
              )}
              {(toolType === 'function' || toolType === 'api') && (
                <>
                  <Textarea placeholder='Schema JSON: {"type": "function", "parameters": {...}}' value={formData.schema} onChange={(e) => setFormData({ ...formData, schema: e.target.value })} rows={6} className="font-mono text-sm" />
                  <Input placeholder="Source URL (optional)" value={formData.sourceUrl} onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })} />
                </>
              )}
              <Textarea placeholder="Example usage..." value={formData.exampleUsage} onChange={(e) => setFormData({ ...formData, exampleUsage: e.target.value })} rows={3} className="font-mono text-sm" />
              <div className="flex gap-4">
                <Input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex-1" />
                <Input placeholder="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="flex-1" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Tool</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tools Grid */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card variant="glass" className="text-center py-16">
            <Wrench className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">No tools yet. Add your first one.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map((tool) => (
              <Card key={tool.id} variant="premium" className="p-4 group">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-primary/8 text-primary shrink-0">
                    {getTypeIcon(tool.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm">{tool.name}</h3>
                      <span className="chip chip-primary text-xs">{tool.type}</span>
                      {tool.language && <span className="chip chip-muted text-xs">{tool.language}</span>}
                    </div>
                    {tool.description && <p className="text-muted-foreground text-xs mb-2">{tool.description}</p>}
                    {tool.source_url && (
                      <a href={tool.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-2">
                        <ExternalLink className="w-3 h-3" />{tool.source_url}
                      </a>
                    )}
                    {tool.script_content && <CodeBlock code={tool.script_content} language={tool.language || 'javascript'} maxHeight="120px" />}
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tool.tags.map(tag => <span key={tag} className="chip chip-muted text-xs">{tag}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(JSON.stringify(tool.schema, null, 2), tool.id)}>
                      {copiedId === tool.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteTool(tool.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbox;
