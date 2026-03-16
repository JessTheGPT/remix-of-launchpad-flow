import { useState, useCallback } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  onUpload: (path: string, content?: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const ALLOWED_EXTENSIONS = ['.md', '.txt', '.json', '.yaml', '.yml', '.py', '.js', '.ts', '.sh', '.css', '.html'];

export const FileUpload = ({ 
  onUpload, 
  accept = '.md,.txt,.json,.yaml,.yml,.py,.js,.ts,.sh,.css,.html',
  maxSize = 5 
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFile = async (file: File) => {
    // Validate extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`File type ${ext} not supported`);
      return;
    }

    // Validate size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Max size is ${maxSize}MB`);
      return;
    }

    setUploading(true);

    try {
      // Read file content for text files
      const content = await file.text();
      
      // Generate unique filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `uploads/${timestamp}-${safeName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('resources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setUploadedFile({ name: file.name, path: filePath });
      onUpload(filePath, content);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      processFile(files[0]);
    }
  };

  const removeFile = async () => {
    if (uploadedFile) {
      await supabase.storage.from('resources').remove([uploadedFile.path]);
      setUploadedFile(null);
      onUpload('');
    }
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
        <File className="w-5 h-5 text-primary" />
        <span className="flex-1 text-sm font-medium truncate">{uploadedFile.name}</span>
        <Button size="icon" variant="ghost" onClick={removeFile} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center p-8 
        border-2 border-dashed rounded-lg transition-colors cursor-pointer
        ${isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      
      {uploading ? (
        <>
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
          <span className="text-sm text-muted-foreground">Uploading...</span>
        </>
      ) : (
        <>
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground text-center">
            Drop file here or click to upload
          </span>
          <span className="text-xs text-muted-foreground/60 mt-1">
            Supports: {ALLOWED_EXTENSIONS.join(', ')}
          </span>
        </>
      )}
    </div>
  );
};

export default FileUpload;
