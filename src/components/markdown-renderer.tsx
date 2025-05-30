'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

export function MarkdownRenderer({ content, isUser = false, className }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    let codeBlockCounter = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Handle code blocks
      if (line.startsWith('```')) {
        const language = line.substring(3).trim() || 'typescript';
        const codeLines: string[] = [];
        i++; // Skip the opening ```
        
        // Collect code block content
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        const codeContent = codeLines.join('\n');
        const codeId = `code-${codeBlockCounter++}`;
        
        elements.push(
          <div key={i} className="relative my-4 rounded-lg overflow-hidden bg-gray-900 border">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs font-medium text-gray-300">{language}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => copyCode(codeContent, codeId)}
              >
                {copiedCode === codeId ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
                showLineNumbers={codeContent.split('\n').length > 3}
                wrapLines={true}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          </div>
        );
        
        i++; // Skip the closing ```
        continue;
      }

      // Handle headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-foreground">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-foreground">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold mt-6 mb-4 text-foreground">
            {line.replace('# ', '')}
          </h1>
        );
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const listItems: React.ReactNode[] = [];
        const listStartIndex = i;
        
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          const itemText = lines[i].replace(/^\d+\.\s/, '');
          listItems.push(
            <li key={i} className="mb-2">
              {renderInlineFormatting(itemText)}
            </li>
          );
          i++;
        }
        
        elements.push(
          <ol key={listStartIndex} className="list-decimal list-inside mb-4 space-y-1 ml-4">
            {listItems}
          </ol>
        );
        i--; // Adjust because the while loop will increment
      }
      // Handle bullet lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems: React.ReactNode[] = [];
        const listStartIndex = i;
        
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          const itemText = lines[i].substring(2);
          listItems.push(
            <li key={i} className="mb-2">
              {renderInlineFormatting(itemText)}
            </li>
          );
          i++;
        }
        
        elements.push(
          <ul key={listStartIndex} className="list-disc list-inside mb-4 space-y-1 ml-4">
            {listItems}
          </ul>
        );
        i--; // Adjust because the while loop will increment
      }
      // Handle regular paragraphs
      else if (line.trim()) {
        elements.push(
          <p key={i} className="mb-3 leading-relaxed">
            {renderInlineFormatting(line)}
          </p>
        );
      }
      // Handle empty lines
      else {
        elements.push(<br key={i} />);
      }

      i++;
    }

    return elements;
  };

  const renderInlineFormatting = (text: string) => {
    // Handle inline code
    const parts = text.split(/(`[^`]+`)/);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code
            key={index}
            className={cn(
              "px-1.5 py-0.5 rounded text-sm font-mono",
              isUser ? "bg-blue-500 text-white" : "bg-muted text-foreground border"
            )}
          >
            {code}
          </code>
        );
      }
      
      // Handle bold text
      if (part.includes('**')) {
        const boldParts = part.split(/(\*\*[^*]+\*\*)/);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
            return (
              <strong key={`${index}-${boldIndex}`} className="font-semibold">
                {boldPart.slice(2, -2)}
              </strong>
            );
          }
          return boldPart;
        });
      }
      
      return part;
    });
  };

  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      isUser 
        ? "text-white prose-headings:text-white prose-code:text-white prose-strong:text-white" 
        : "prose-gray dark:prose-invert",
      className
    )}>
      {renderContent()}
    </div>
  );
} 