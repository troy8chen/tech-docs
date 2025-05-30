'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './message-bubble';
import { Send, Loader2, Zap, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
  domain?: string;
}

interface StreamData {
  type: 'metadata' | 'content' | 'done' | 'error';
  content?: string;
  sources?: string[];
  domain?: string;
  timestamp?: string;
  error?: string;
  message?: string;
}

const EXAMPLE_QUESTIONS = [
  "My Inngest function isn't triggering. How do I debug this?",
  "How do I implement error handling and retries in Inngest?",
  "How do I break my function into steps to avoid timeouts?",
  "What's the best way to rate limit my Inngest functions?",
  "How do I set up local development with Inngest?",
  "How do I deploy Inngest functions to Vercel?"
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    setCurrentSources([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText.trim(),
          domain: 'inngest',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      const assistantMessageId = Date.now().toString();
      let accumulatedContent = ''; // Local variable to track content
      let messageSources: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamData = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'metadata':
                  messageSources = data.sources || [];
                  setCurrentSources(messageSources);
                  break;

                case 'content':
                  if (data.content) {
                    accumulatedContent += data.content;
                    setStreamingContent(accumulatedContent);
                  }
                  break;

                case 'done':
                  // Finalize the assistant message
                  const finalMessage: ChatMessage = {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: accumulatedContent,
                    sources: messageSources,
                    timestamp: new Date(),
                    domain: 'inngest',
                  };
                  
                  setMessages(prev => [...prev, finalMessage]);
                  setStreamingContent('');
                  setCurrentSources([]);
                  setIsLoading(false);
                  break;

                case 'error':
                  console.error('Stream error:', data.error);
                  const errorMessage: ChatMessage = {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: `I apologize, but I encountered an error: ${data.error || 'Unknown error'}. Please try asking your question again.`,
                    timestamp: new Date(),
                    domain: 'inngest',
                  };
                  setMessages(prev => [...prev, errorMessage]);
                  setStreamingContent('');
                  setIsLoading(false);
                  break;
              }
            } catch {
              console.warn('Failed to parse streaming data:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I apologize, but I'm having trouble connecting right now. Please check your connection and try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        domain: 'inngest',
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Inngest Expert Chatbot</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            Powered by RAG + GPT-4
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me anything about Inngest implementation, troubleshooting, or best practices
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center space-y-6 mt-8">
            <div className="space-y-2">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-lg font-medium">Welcome to Inngest Expert Support</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                I&apos;m your AI-powered Developer Success Engineer. I can help you with Inngest implementation, 
                troubleshooting, and architectural guidance based on the official documentation.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Try asking:</h3>
              <div className="grid gap-2 max-w-2xl mx-auto">
                {EXAMPLE_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left justify-start h-auto p-3 text-sm"
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {isLoading && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted border mr-12">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  ⚡ Inngest Expert
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="prose prose-sm max-w-none prose-gray dark:prose-invert">
                {streamingContent}
                <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1" />
              </div>
              {currentSources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                  <div className="flex flex-wrap gap-1">
                    {currentSources.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted border mr-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Searching knowledge base...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about Inngest..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 