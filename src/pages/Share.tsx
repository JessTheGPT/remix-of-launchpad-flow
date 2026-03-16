import { useState, useEffect } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShareToken {
  id: string;
  token: string;
  resource_type: string;
  resource_id: string | null;
  expires_at: string | null;
  access_count: number;
  last_accessed_at: string | null;
  created_at: string;
}

const Share = () => {
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newTokenType, setNewTokenType] = useState<string>('all');

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('share_tokens')
      .select('*')
      .order('created_at', { ascending: false });
    setTokens(data || []);
    setLoading(false);
  };

  const createToken = async () => {
    const { data, error } = await supabase
      .from('share_tokens')
      .insert({ resource_type: newTokenType })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create token');
      return;
    }

    toast.success('Share link created');
    fetchTokens();
  };

  const deleteToken = async (id: string) => {
    await supabase.from('share_tokens').delete().eq('id', id);
    toast.success('Token deleted');
    fetchTokens();
  };

  const copyLink = async (token: string, id: string) => {
    const link = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/context/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('Link copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'all': return 'All Resources';
      case 'team': return 'Teams';
      case 'agent': return 'Agents';
      case 'doc': return 'Context Docs';
      case 'prompt': return 'Prompts';
      case 'tool': return 'Tools';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Share Links</h1>
          <p className="text-muted-foreground text-sm">
            Create shareable URLs that AI agents can fetch. Update your resources once, and all agents using the link get the latest version.
          </p>
        </div>

        {/* How it works */}
        <Card variant="glass" className="p-6 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-background/50">
              <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold mb-2">1</div>
              <p className="text-muted-foreground text-sm">Create a share link for your resources</p>
            </div>
            <div className="p-4 rounded bg-background/50">
              <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold mb-2">2</div>
              <p className="text-muted-foreground text-sm">Give the URL to your AI agent (ChatGPT, Claude, etc.)</p>
            </div>
            <div className="p-4 rounded bg-background/50">
              <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold mb-2">3</div>
              <p className="text-muted-foreground text-sm">Agent fetches latest content—no need to re-upload docs</p>
            </div>
          </div>
        </Card>

        {/* Create new token */}
        <Card variant="glass" className="p-6 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Create Share Link</h2>
          <div className="flex gap-3">
            <Select value={newTokenType} onValueChange={setNewTokenType}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="team">Teams Only</SelectItem>
                <SelectItem value="doc">Docs Only</SelectItem>
                <SelectItem value="prompt">Prompts Only</SelectItem>
                <SelectItem value="tool">Tools Only</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createToken} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Link
            </Button>
          </div>
        </Card>

        {/* Existing tokens */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Active Links</h2>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : tokens.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <Link2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No share links yet. Create your first one above.</p>
            </Card>
          ) : (
            tokens.map((token) => (
              <Card key={token.id} variant="premium" className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="chip chip-primary">{getTypeLabel(token.resource_type)}</span>
                      {token.access_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {token.access_count} accesses
                        </span>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground break-all font-mono">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/context/{token.token}
                    </code>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyLink(token.token, token.id)}
                    >
                      {copiedId === token.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`/api/context/${token.token}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteToken(token.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Share;
