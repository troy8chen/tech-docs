'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
        "max-w-[80%] rounded-lg px-4 py-3 relative group",
        isUser 
          ? "bg-blue-600 text-white ml-12" 
          : "bg-muted border mr-12"
      )}>
        {/* Domain badge for assistant messages */}
        {!isUser && message.domain && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              ⚡ Inngest Expert
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {/* Message content */}
        <div className={cn(
          "prose prose-sm max-w-none",
          isUser 
            ? "text-white prose-headings:text-white prose-code:text-white prose-strong:text-white" 
            : "prose-gray dark:prose-invert"
        )}>
          {/* Render markdown-like content */}
          {message.content.split('\n').map((line, index) => {
            // Handle code blocks
            if (line.startsWith('```')) {
              return null; // Handle in a more sophisticated way if needed
            }
            
            // Handle headers
            if (line.startsWith('### ')) {
              return (
                <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
                  {line.replace('### ', '')}
                </h3>
              );
            }
            
            if (line.startsWith('## ')) {
              return (
                <h2 key={index} className="text-xl font-semibold mt-4 mb-2">
                  {line.replace('## ', '')}
                </h2>
              );
            }
            
            // Handle code inline
            if (line.includes('`') && !line.startsWith('```')) {
              const parts = line.split('`');
              return (
                <p key={index} className="mb-2">
                  {parts.map((part, i) => 
                    i % 2 === 0 ? part : (
                      <code key={i} className={cn(
                        "px-1.5 py-0.5 rounded text-sm font-mono",
                        isUser ? "bg-blue-500 text-white" : "bg-muted text-foreground"
                      )}>
                        {part}
                      </code>
                    )
                  )}
                </p>
              );
            }
            
            // Regular paragraph
            if (line.trim()) {
              return (
                <p key={index} className="mb-2">
                  {line}
                </p>
              );
            }
            
            return <br key={index} />;
          })}
        </div>
        
        {/* Sources for assistant messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Sources ({message.sources.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Copy button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0",
            isUser ? "text-white hover:bg-blue-500" : "text-muted-foreground"
          )}
          onClick={copyMessage}
        >
          <Copy className="h-3 w-3" />
        </Button>
        
        {copied && (
          <div className="absolute -top-8 right-2 bg-black text-white text-xs px-2 py-1 rounded">
            Copied!
          </div>
        )}
        
        {/* Timestamp for user messages */}
        {isUser && (
          <div className="text-xs text-blue-200 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
} 