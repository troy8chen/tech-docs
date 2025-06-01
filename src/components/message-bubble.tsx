'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Copy, Check, ExternalLink, ChevronDown, User, Bot } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

// Helper function to extract readable titles from URLs
function getSourceTitle(source: string): string {
  if (!source.startsWith('http')) {
    return source;
  }

  // Extract page title from URL path
  const urlPath = source.replace('https://www.inngest.com', '');
  let title = urlPath
    .split('/')
    .pop()
    ?.replace(/-/g, ' ')
    ?.replace(/^\w/, c => c.toUpperCase()) || 'Documentation';
  
  // Special cases for common patterns
  if (urlPath.includes('/docs/functions/')) title = 'Functions Guide';
  if (urlPath.includes('/docs/local-development')) title = 'Local Development';
  if (urlPath.includes('/docs/deploy/')) title = 'Deployment Guide';
  if (urlPath.includes('/docs/reference/')) title = 'API Reference';
  if (urlPath.includes('/docs/guides/')) title = 'Implementation Guide';
  if (urlPath.includes('/docs/quick-start')) title = 'Quick Start';
  if (urlPath.includes('/docs/concepts/')) title = 'Core Concepts';
  if (urlPath.includes('/docs/learn/')) title = 'Learning Resources';
  if (urlPath === '/docs' || urlPath === '/docs/') title = 'Documentation Home';
  
  return title;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] rounded-lg px-4 py-3 relative",
        isUser 
          ? "bg-blue-600 text-white ml-12" 
          : "bg-muted border mr-12"
      )}>
        {/* Domain badge and timestamp for assistant messages */}
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
        
        {/* Message content */}
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <MarkdownRenderer 
            content={message.content}
            className="min-w-0"
          />
        )}
        
        {/* Sources section - collapsible for better UX */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-muted-foreground/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground -ml-1"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3 w-3" />
                <span>Sources ({message.sources.length})</span>
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  showSources && "rotate-180"
                )} />
              </div>
            </Button>
            
            {showSources && (
              <div className="mt-3 space-y-2">
                {message.sources.map((source, index) => {
                  // Improved URL detection - handle more cases
                  const isUrl = source.startsWith('http://') || source.startsWith('https://') || source.includes('inngest.com');
                  
                  // Handle different source types
                  if (isUrl && (source.startsWith('http://') || source.startsWith('https://'))) {
                    // Full URL - make it clickable with readable title
                    const title = getSourceTitle(source);
                    return (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors group/link"
                        title={source}
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="break-all">{title}</span>
                      </a>
                    );
                  } else if (source.includes('inngest.com') && !source.startsWith('http')) {
                    // Partial URL - construct full URL and make clickable
                    const fullUrl = source.startsWith('//') ? `https:${source}` : `https://${source}`;
                    const title = getSourceTitle(fullUrl);
                    return (
                      <a
                        key={index}
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors group/link"
                        title={fullUrl}
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="break-all">{title}</span>
                      </a>
                    );
                  } else if (source.startsWith('Inngest Documentation:')) {
                    // Section-based source - show as informative badge with better styling
                    const sectionName = source.replace('Inngest Documentation: ', '').trim();
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          📚 {sectionName}
                        </Badge>
                      </div>
                    );
                  }
                  
                  // Default case - generic badge
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
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
          title="Copy message"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
        
        {/* Copy notification */}
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
      
      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center ml-3">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
} 