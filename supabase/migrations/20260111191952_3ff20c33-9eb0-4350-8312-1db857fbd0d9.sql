-- Add new columns to context_docs table
ALTER TABLE public.context_docs 
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS doc_type text DEFAULT 'text',
ADD COLUMN IF NOT EXISTS file_path text;

-- Add new columns to tools table
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS source_url text,
ADD COLUMN IF NOT EXISTS script_content text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS mcp_config jsonb DEFAULT '{}'::jsonb;

-- Create resources storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to resources bucket
CREATE POLICY "Public can read resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Allow anyone to upload to resources bucket
CREATE POLICY "Anyone can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resources');

-- Allow anyone to delete their resources
CREATE POLICY "Anyone can delete resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'resources');