import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Terminal, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CodeBlock } from '@/components/CodeBlock';

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

// Context Docs also shown here
interface ContextDoc {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  tags: string[];
  doc_type: string | null;
  source_url: string | null;
  created_at: string;
}

const Prompts = () => {
  const [searchParams] = useSearchParams();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [docs, setDocs] = useState<ContextDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add');
  const [formType, setFormType] = useState<'prompt' | 'doc'>('prompt');
  const [formData, setFormData] = useState({
    title: '', content: '', description: '', category: '', tags: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [promptsRes, docsRes] = await Promise.all([
      supabase.from('prompt_templates').select('*').order('created_at', { ascending: false }),
      supabase.from('context_docs').select('*').order('created_at', { ascending: false }),
    ]);
    setPrompts(promptsRes.data || []);
    setDocs(docsRes.data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', description: '', category: '', tags: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (formType === 'prompt') {
      const { error } = await supabase.from('prompt_templates').insert({
        name: formData.title, slug, template: formData.content,
        description: formData.description || null, category: formData.category || null, tags,
      });
      if (error) { toast.error('Failed to add prompt'); return; }
    } else {
      const { error } = await supabase.from('context_docs').insert({
        title: formData.title, slug, content: formData.content,
        category: formData.category || null, tags,
      });
      if (error) { toast.error('Failed to add document'); return; }
    }

    toast.success(`${formType === 'prompt' ? 'Prompt' : 'Document'} added`);
    setShowForm(false);
    resetForm();
    fetchData();
  };

  const deletePrompt = async (id: string) => {
    await supabase.from('prompt_templates').delete().eq('id', id);
    toast.success('Deleted');
    fetchData();
  };

  const deleteDoc = async (id: string) => {
    await supabase.from('context_docs').delete().eq('id', id);
    toast.success('Deleted');
    fetchData();
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const searchLower = search.toLowerCase();
  const filteredPrompts = prompts.filter(p => p.name.toLowerCase().includes(searchLower) || p.template.toLowerCase().includes(searchLower));
  const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(searchLower) || d.content.toLowerCase().includes(searchLower));

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">Prompts & Docs</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              System prompts, soul.md templates, skills.md, and context documents.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-56" />
            </div>
            <Button size="sm" className="h-9" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card variant="glass" className="p-6 mb-6 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <Button type="button" variant={formType === 'prompt' ? 'default' : 'outline'} size="sm" onClick={() => setFormType('prompt')} className="gap-1.5">
                  <Terminal className="w-4 h-4" />Prompt Template
                </Button>
                <Button type="button" variant={formType === 'doc' ? 'default' : 'outline'} size="sm" onClick={() => setFormType('doc')} className="gap-1.5">
                  <FileText className="w-4 h-4" />Context Doc
                </Button>
              </div>
              <Input placeholder={formType === 'prompt' ? 'Prompt name' : 'Document title'} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              {formType === 'prompt' && (
                <Input placeholder="Description (optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              )}
              <Textarea
                placeholder={formType === 'prompt' ? 'Prompt template... Use {{variable}} for placeholders' : 'Document content...'}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className={formType === 'prompt' ? 'font-mono text-sm' : ''}
                required
              />
              <div className="flex gap-4">
                <Input placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex-1" />
                <Input placeholder="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="flex-1" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Prompts */}
            {filteredPrompts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Prompt Templates</h2>
                <div className="space-y-3">
                  {filteredPrompts.map((prompt) => (
                    <Card key={prompt.id} variant="premium" className="p-4 group">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/8 text-primary shrink-0">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground mb-1 text-sm">{prompt.name}</h3>
                          {prompt.description && <p className="text-muted-foreground text-xs mb-2">{prompt.description}</p>}
                          <CodeBlock code={prompt.template} language="markdown" maxHeight="150px" />
                          {prompt.tags && prompt.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {prompt.tags.map(tag => <span key={tag} className="chip chip-muted text-xs">{tag}</span>)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(prompt.template, prompt.id)}>
                            {copiedId === prompt.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deletePrompt(prompt.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Docs */}
            {filteredDocs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Context Documents</h2>
                <div className="space-y-3">
                  {filteredDocs.map((doc) => (
                    <Card key={doc.id} variant="premium" className="p-4 group">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/8 text-primary shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground text-sm">{doc.title}</h3>
                            {doc.doc_type && <span className="chip chip-muted text-xs">{doc.doc_type}</span>}
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2">{doc.content}</p>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map(tag => <span key={tag} className="chip chip-muted text-xs">{tag}</span>)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(doc.content, doc.id)}>
                            {copiedId === doc.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteDoc(doc.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {filteredPrompts.length === 0 && filteredDocs.length === 0 && (
              <Card variant="glass" className="text-center py-16">
                <Terminal className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No prompts or docs yet. Add your first one.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prompts;
