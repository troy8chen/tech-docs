'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { MarkdownRenderer } from './markdown-renderer';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
    timestamp: Date;
    domain?: string;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  
  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-lg px-4 py-3 relative group",
        isUser 
          ? "bg-blue-600 text-white ml-12" 
          : "bg-muted border mr-12"
      )}>
        {/* Domain badge for assistant messages */}
        {!isUser && message.domain && (
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              ⚡ Inngest Expert
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {/* Message content with improved markdown rendering */}
        <MarkdownRenderer 
          content={message.content}
          isUser={isUser}
          className="min-w-0"
        />
        
        {/* Sources for assistant messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Sources ({message.sources.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, index) => {
                // Check if source is a URL
                const isUrl = source.startsWith('http://') || source.startsWith('https://');
                
                if (isUrl) {
                  return (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-md hover:bg-muted transition-colors text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {source.length > 50 ? `${source.substring(0, 47)}...` : source}
                    </a>
                  );
                }
                
                return (
                  <Badge key={index} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Copy button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0",
            isUser ? "text-white hover:bg-blue-500" : "text-muted-foreground hover:bg-muted"
          )}
          onClick={copyMessage}
        >
          <Copy className="h-3 w-3" />
        </Button>
        
        {copied && (
          <div className="absolute -top-8 right-2 bg-black text-white text-xs px-2 py-1 rounded z-10">
            Copied!
          </div>
        )}
        
        {/* Timestamp for user messages */}
        {isUser && (
          <div className="text-xs text-blue-200 mt-2 text-right">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
} 