import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface CodeBlockProps {
  code: string;
  language?: string;
  maxLines?: number;
  maxHeight?: string;
  showLineNumbers?: boolean;
}

const languageColors: Record<string, string> = {
  javascript: 'bg-yellow-500/20 text-yellow-400',
  typescript: 'bg-blue-500/20 text-blue-400',
  python: 'bg-green-500/20 text-green-400',
  bash: 'bg-gray-500/20 text-gray-400',
  shell: 'bg-gray-500/20 text-gray-400',
  json: 'bg-orange-500/20 text-orange-400',
  yaml: 'bg-purple-500/20 text-purple-400',
  markdown: 'bg-cyan-500/20 text-cyan-400',
  sql: 'bg-pink-500/20 text-pink-400',
};

export const CodeBlock = ({ 
  code, 
  language = 'text', 
  maxLines = 20,
  maxHeight,
  showLineNumbers = false 
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  
  const lines = code.split('\n');
  const truncated = lines.length > maxLines;
  const displayLines = truncated ? lines.slice(0, maxLines) : lines;
  const displayCode = displayLines.join('\n');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const langClass = languageColors[language.toLowerCase()] || 'bg-muted text-muted-foreground';

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${langClass}`}>
          {language}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto bg-background/50 text-sm" style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>
        <code className="font-mono text-muted-foreground">
          {showLineNumbers ? (
            displayLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none text-muted-foreground/40 w-8 text-right pr-4 shrink-0">
                  {i + 1}
                </span>
                <span className="whitespace-pre-wrap break-all">{line}</span>
              </div>
            ))
          ) : (
            <span className="whitespace-pre-wrap">{displayCode}</span>
          )}
        </code>
      </pre>
      {truncated && (
        <div className="px-4 py-2 bg-muted/30 text-center text-xs text-muted-foreground border-t border-border">
          ... {lines.length - maxLines} more lines
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
