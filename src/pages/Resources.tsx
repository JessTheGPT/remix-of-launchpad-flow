import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Terminal, 
  Wrench, 
  Plus, 
  Search,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Link as LinkIcon,
  Code,
  FileCode,
  Upload,
  Filter
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { FileUpload } from '@/components/FileUpload';

type TabType = 'docs' | 'prompts' | 'tools';
type DocType = 'text' | 'link' | 'script' | 'file';
type ToolType = 'function' | 'mcp' | 'api' | 'script' | 'skill';

interface ContextDoc {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  tags: string[];
  is_public: boolean;
  created_at: string;
  source_url: string | null;
  doc_type: string | null;
  file_path: string | null;
}

interface PromptTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  template: string;
  category: string | null;
  tags: string[];
  is_public: boolean;
  created_at: string;
}

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

const DOC_TYPES: { value: DocType; label: string; icon: React.ReactNode }[] = [
  { value: 'text', label: 'Text Document', icon: <FileText className="w-4 h-4" /> },
  { value: 'link', label: 'Link / Repo', icon: <LinkIcon className="w-4 h-4" /> },
  { value: 'script', label: 'Script / Code', icon: <Code className="w-4 h-4" /> },
  { value: 'file', label: 'File Upload', icon: <Upload className="w-4 h-4" /> },
];

const TOOL_TYPES: { value: ToolType; label: string }[] = [
  { value: 'function', label: 'Function' },
  { value: 'mcp', label: 'MCP Server' },
  { value: 'api', label: 'API Endpoint' },
  { value: 'script', label: 'Script' },
  { value: 'skill', label: 'Skill' },
];

const LANGUAGES = ['javascript', 'typescript', 'python', 'bash', 'json', 'yaml', 'sql', 'markdown'];

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'docs';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  // Data states
  const [docs, setDocs] = useState<ContextDoc[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [docType, setDocType] = useState<DocType>('text');
  const [toolType, setToolType] = useState<ToolType>('function');
  const [language, setLanguage] = useState('javascript');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    sourceUrl: '',
    filePath: '',
    schema: '',
    exampleUsage: '',
    description: '',
    mcpConfig: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'docs') {
        const { data } = await supabase.from('context_docs').select('*').order('created_at', { ascending: false });
        setDocs(data || []);
      } else if (activeTab === 'prompts') {
        const { data } = await supabase.from('prompt_templates').select('*').order('created_at', { ascending: false });
        setPrompts(data || []);
      } else {
        const { data } = await supabase.from('tools').select('*').order('created_at', { ascending: false });
        setTools(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
    setSearchParams({ tab: value });
    setShowForm(false);
    setFilterType('all');
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: '',
      sourceUrl: '',
      filePath: '',
      schema: '',
      exampleUsage: '',
      description: '',
      mcpConfig: '',
    });
    setDocType('text');
    setToolType('function');
    setLanguage('javascript');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    
    try {
      if (activeTab === 'docs') {
        await supabase.from('context_docs').insert({
          title: formData.title,
          slug,
          content: formData.content,
          category: formData.category || null,
          tags,
          doc_type: docType,
          source_url: formData.sourceUrl || null,
          file_path: formData.filePath || null,
        });
      } else if (activeTab === 'prompts') {
        await supabase.from('prompt_templates').insert({
          name: formData.title,
          slug,
          template: formData.content,
          description: formData.description || null,
          category: formData.category || null,
          tags
        });
      } else {
        let schemaObj = {};
        let mcpObj = {};
        
        try {
          if (formData.schema) schemaObj = JSON.parse(formData.schema);
        } catch { 
          toast.error('Invalid JSON in schema');
          return;
        }
        
        try {
          if (formData.mcpConfig) mcpObj = JSON.parse(formData.mcpConfig);
        } catch {
          toast.error('Invalid JSON in MCP config');
          return;
        }
        
        await supabase.from('tools').insert({
          name: formData.title,
          slug,
          description: formData.description || null,
          type: toolType,
          schema: schemaObj,
          example_usage: formData.exampleUsage || null,
          category: formData.category || null,
          tags,
          source_url: formData.sourceUrl || null,
          script_content: toolType === 'script' ? formData.content : null,
          language: toolType === 'script' ? language : null,
          mcp_config: mcpObj,
        });
      }
      
      toast.success('Resource added');
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    }
  };

  const handleDelete = async (id: string, table: 'context_docs' | 'prompt_templates' | 'tools') => {
    try {
      await supabase.from(table).delete().eq('id', id);
      toast.success('Deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleFileUpload = (path: string, content?: string) => {
    setFormData(prev => ({ 
      ...prev, 
      filePath: path,
      content: content || prev.content 
    }));
  };

  const searchLower = search.toLowerCase();
  
  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchLower) ||
      d.content.toLowerCase().includes(searchLower);
    const matchesFilter = filterType === 'all' || d.doc_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredPrompts = prompts.filter(p => 
    p.name.toLowerCase().includes(searchLower) ||
    p.template.toLowerCase().includes(searchLower)
  );

  const filteredTools = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchLower) ||
      (t.description?.toLowerCase().includes(searchLower));
    const matchesFilter = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getDocTypeIcon = (type: string | null) => {
    switch (type) {
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'script': return <Code className="w-4 h-4" />;
      case 'file': return <FileCode className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Resources</h1>
          <p className="text-muted-foreground text-sm">
            Manage your AI context documents, prompt templates, and tools.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="docs" className="gap-2 text-sm">
                <FileText className="w-4 h-4" />
                Docs
              </TabsTrigger>
              <TabsTrigger value="prompts" className="gap-2 text-sm">
                <Terminal className="w-4 h-4" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-2 text-sm">
                <Wrench className="w-4 h-4" />
                Tools
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              
              {(activeTab === 'docs' || activeTab === 'tools') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType('all')}>
                      All Types
                    </DropdownMenuItem>
                    {activeTab === 'docs' ? (
                      DOC_TYPES.map(t => (
                        <DropdownMenuItem key={t.value} onClick={() => setFilterType(t.value)}>
                          {t.icon}
                          <span className="ml-2">{t.label}</span>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      TOOL_TYPES.map(t => (
                        <DropdownMenuItem key={t.value} onClick={() => setFilterType(t.value)}>
                          {t.label}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} size="icon" className="h-9 w-9">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add Form - Context Docs */}
          {showForm && activeTab === 'docs' && (
            <Card variant="glass" className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {DOC_TYPES.map(t => (
                    <Button
                      key={t.value}
                      type="button"
                      variant={docType === t.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDocType(t.value)}
                      className="gap-2"
                    >
                      {t.icon}
                      {t.label}
                    </Button>
                  ))}
                </div>
                
                <Input
                  placeholder="Document title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                
                {docType === 'link' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Source URL</Label>
                    <Input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      required
                    />
                  </div>
                )}
                
                {docType === 'script' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Label className="text-sm">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {docType === 'file' ? (
                  <FileUpload onUpload={handleFileUpload} />
                ) : (
                  <Textarea
                    placeholder={docType === 'script' ? 'Paste your code here...' : 'Content...'}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={docType === 'script' ? 12 : 6}
                    className={docType === 'script' ? 'font-mono text-sm' : ''}
                    required
                  />
                )}
                
                <div className="flex gap-4">
                  <Input
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Save Document</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Add Form - Prompts */}
          {showForm && activeTab === 'prompts' && (
            <Card variant="glass" className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Prompt name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Textarea
                  placeholder="Prompt template... Use {{variable}} for placeholders"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                  required
                />
                <div className="flex gap-4">
                  <Input
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Save Prompt</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Add Form - Tools */}
          {showForm && activeTab === 'tools' && (
            <Card variant="glass" className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {TOOL_TYPES.map(t => (
                    <Button
                      key={t.value}
                      type="button"
                      variant={toolType === t.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setToolType(t.value)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
                
                <Input
                  placeholder="Tool name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                
                {toolType === 'script' && (
                  <>
                    <div className="flex items-center gap-4">
                      <Label className="text-sm">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Script content..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </>
                )}
                
                {toolType === 'mcp' && (
                  <Textarea
                    placeholder='MCP Config (JSON): {"server": "...", "tools": [...]}'
                    value={formData.mcpConfig}
                    onChange={(e) => setFormData({ ...formData, mcpConfig: e.target.value })}
                    rows={6}
                    className="font-mono text-sm"
                  />
                )}
                
                {(toolType === 'function' || toolType === 'api') && (
                  <>
                    <Textarea
                      placeholder='Schema (JSON): {"type": "function", "parameters": {...}}'
                      value={formData.schema}
                      onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <Input
                      placeholder="Source URL (optional)"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    />
                  </>
                )}
                
                <Textarea
                  placeholder="Example usage..."
                  value={formData.exampleUsage}
                  onChange={(e) => setFormData({ ...formData, exampleUsage: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                />
                
                <div className="flex gap-4">
                  <Input
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Save Tool</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Content Lists */}
          <TabsContent value="docs" className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : filteredDocs.length === 0 ? (
              <Card variant="glass" className="text-center py-12">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No documents yet. Add your first one.</p>
              </Card>
            ) : (
              filteredDocs.map((doc) => (
                <Card key={doc.id} variant="premium" className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      {getDocTypeIcon(doc.doc_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground text-sm">{doc.title}</h3>
                        {doc.doc_type && (
                          <span className="chip chip-muted text-xs">{doc.doc_type}</span>
                        )}
                      </div>
                      
                      {doc.source_url && (
                        <a 
                          href={doc.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {doc.source_url}
                        </a>
                      )}
                      
                      {doc.doc_type === 'script' ? (
                        <CodeBlock code={doc.content} language="javascript" maxHeight="200px" />
                      ) : (
                        <p className="text-muted-foreground text-sm line-clamp-2">{doc.content}</p>
                      )}
                      
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map(tag => (
                            <span key={tag} className="chip chip-muted text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(doc.content, doc.id)}
                      >
                        {copiedId === doc.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc.id, 'context_docs')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="prompts" className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : filteredPrompts.length === 0 ? (
              <Card variant="glass" className="text-center py-12">
                <Terminal className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No prompts yet. Add your first one.</p>
              </Card>
            ) : (
              filteredPrompts.map((prompt) => (
                <Card key={prompt.id} variant="premium" className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1 text-sm">{prompt.name}</h3>
                      {prompt.description && (
                        <p className="text-muted-foreground text-xs mb-2">{prompt.description}</p>
                      )}
                      <CodeBlock code={prompt.template} language="markdown" maxHeight="150px" />
                      {prompt.tags && prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prompt.tags.map(tag => (
                            <span key={tag} className="chip chip-muted text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(prompt.template, prompt.id)}
                      >
                        {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(prompt.id, 'prompt_templates')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
            ) : filteredTools.length === 0 ? (
              <Card variant="glass" className="text-center py-12">
                <Wrench className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No tools yet. Add your first one.</p>
              </Card>
            ) : (
              filteredTools.map((tool) => (
                <Card key={tool.id} variant="premium" className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground text-sm">{tool.name}</h3>
                        <span className="chip chip-primary text-xs">{tool.type}</span>
                        {tool.language && (
                          <span className="chip chip-muted text-xs">{tool.language}</span>
                        )}
                      </div>
                      {tool.description && (
                        <p className="text-muted-foreground text-xs mb-2">{tool.description}</p>
                      )}
                      
                      {tool.source_url && (
                        <a 
                          href={tool.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {tool.source_url}
                        </a>
                      )}
                      
                      {tool.script_content && (
                        <CodeBlock 
                          code={tool.script_content} 
                          language={tool.language || 'javascript'} 
                          maxHeight="150px" 
                        />
                      )}
                      
                      {tool.example_usage && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Example:</p>
                          <CodeBlock code={tool.example_usage} language="javascript" maxHeight="100px" />
                        </div>
                      )}
                      
                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tool.tags.map(tag => (
                            <span key={tag} className="chip chip-muted text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(JSON.stringify(tool.schema, null, 2), tool.id)}
                      >
                        {copiedId === tool.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(tool.id, 'tools')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
