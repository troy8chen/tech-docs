'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, ChevronDown, User, Bot } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white ml-12'
              : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
          
          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
              title="Copy message"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Sources section */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Sources ({message.sources.length})
              <ChevronDown className={`w-4 h-4 transition-transform ${showSources ? 'rotate-180' : ''}`} />
            </button>
            
            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, index) => {
                  // Check if source is a URL
                  const isUrl = source.startsWith('http');
                  
                  return (
                    <div key={index} className="flex items-center gap-2">
                      {isUrl ? (
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm break-all flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          {source}
                        </a>
                      ) : (
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-sm text-gray-700">
                          {source}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
} 