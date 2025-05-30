'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, FileText, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { getActiveDomains } from '@/lib/config';

interface UploadResult {
  success: boolean;
  domain: string;
  chunks: number;
  message: string;
  error?: string;
}

export function UploadInterface() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('custom');
  
  // Form states
  const [files, setFiles] = useState<FileList | null>(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [customDomainName, setCustomDomainName] = useState('');

  const activeDomains = getActiveDomains();

  const handleUpload = async (method: 'files' | 'url' | 'text') => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      
      // Set domain (use custom name if provided)
      const domain = selectedDomain === 'custom' && customDomainName 
        ? customDomainName.toLowerCase().replace(/\s+/g, '-')
        : selectedDomain;
      
      formData.append('domain', domain);

      // Add content based on method
      switch (method) {
        case 'files':
          if (!files || files.length === 0) {
            throw new Error('Please select files to upload');
          }
          Array.from(files).forEach(file => {
            formData.append('files', file);
          });
          break;
          
        case 'url':
          if (!url.trim()) {
            throw new Error('Please enter a URL');
          }
          formData.append('url', url.trim());
          break;
          
        case 'text':
          if (!text.trim()) {
            throw new Error('Please enter text content');
          }
          formData.append('text', text.trim());
          break;
      }

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      
      // Clear form
      setFiles(null);
      setUrl('');
      setText('');
      if (selectedDomain === 'custom') {
        setCustomDomainName('');
      }

    } catch (error) {
      setUploadResult({
        success: false,
        domain: selectedDomain,
        chunks: 0,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Upload className="h-8 w-8 text-blue-600 mx-auto" />
          <h2 className="text-xl font-semibold">Expand Knowledge Base</h2>
          <p className="text-sm text-muted-foreground">
            Upload documents, URLs, or text to create new expertise domains
          </p>
        </div>

        {/* Domain Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Target Domain</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(activeDomains).map(([key, domain]) => (
              <Button
                key={key}
                variant={selectedDomain === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDomain(key)}
              >
                {domain.icon || '📚'} {domain.name}
              </Button>
            ))}
            <Button
              variant={selectedDomain === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDomain('custom')}
            >
              ➕ New Domain
            </Button>
          </div>
          
          {selectedDomain === 'custom' && (
            <Input
              placeholder="Enter new domain name (e.g., 'React', 'Python')"
              value={customDomainName}
              onChange={(e) => setCustomDomainName(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        {/* Upload Methods */}
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Files</label>
              <Input
                type="file"
                multiple
                accept=".txt,.md,.markdown"
                onChange={(e) => setFiles(e.target.files)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: .txt, .md, .markdown
              </p>
            </div>
            <Button 
              onClick={() => handleUpload('files')}
              disabled={!files || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Documentation URL</label>
              <Input
                type="url"
                placeholder="https://docs.example.com/documentation.txt"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to documentation or text content
              </p>
            </div>
            <Button 
              onClick={() => handleUpload('url')}
              disabled={!url.trim() || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Ingest from URL
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text Content</label>
              <Textarea
                placeholder="Paste your documentation or text content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Paste markdown or plain text documentation
              </p>
            </div>
            <Button 
              onClick={() => handleUpload('text')}
              disabled={!text.trim() || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Process Text
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Upload Result */}
        {uploadResult && (
          <div className={`rounded-lg p-4 border ${
            uploadResult.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {uploadResult.success ? (
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p className={`font-medium ${
                  uploadResult.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                </p>
                <p className={`text-sm ${
                  uploadResult.success 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {uploadResult.error || uploadResult.message}
                </p>
                {uploadResult.success && (
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                      {uploadResult.domain}
                    </Badge>
                    <Badge variant="outline">
                      {uploadResult.chunks} chunks
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-blue-800 dark:text-blue-200">Pro Tips</p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Markdown files work best for structured documentation</li>
                <li>• Use descriptive domain names for easy organization</li>
                <li>• Large files are automatically chunked for optimal search</li>
                <li>• You can add to existing domains by selecting them</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 