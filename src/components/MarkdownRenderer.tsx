import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());
  
  // Extract URLs from both direct URLs and markdown links
  const directUrlPattern = /(https?:\/\/[^\s\)\]\,\;]+)/g;
  const markdownLinkPattern = /\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
  
  // Extract all URLs
  const allUrls = new Set<string>();
  
  // Find direct URLs
  const directUrls = [...content.matchAll(directUrlPattern)];
  directUrls.forEach(match => {
    const url = match[1].replace(/[.,;:!?\]\)]*$/, '');
    allUrls.add(url);
  });
  
  // Find markdown link URLs
  const markdownUrls = [...content.matchAll(markdownLinkPattern)];
  markdownUrls.forEach(match => {
    const url = match[2].replace(/[.,;:!?\]\)]*$/, '');
    allUrls.add(url);
  });
  
  const uniqueUrls = [...allUrls].filter(url => url.length > 20);

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set([...prev, blockIndex]));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderTextWithCitations = (text: string) => {
    // First handle markdown links
    const processedText = text.replace(markdownLinkPattern, (match, linkText, url) => {
      const cleanUrl = url.replace(/[.,;:!?\]\)]*$/, '');
      const citationIndex = uniqueUrls.indexOf(cleanUrl) + 1;
      return citationIndex > 0 ? `[${citationIndex}]` : linkText;
    });
    
    // Then handle direct URLs
    const parts = processedText.split(directUrlPattern);
    
    return parts.map((part, index) => {
      if (part.match(directUrlPattern)) {
        const cleanUrl = part.replace(/[.,;:!?\]\)]*$/, '');
        const citationIndex = uniqueUrls.indexOf(cleanUrl) + 1;
        return citationIndex > 0 ? (
          <span key={index} className="text-blue-600 font-medium">
            [{citationIndex}]
          </span>
        ) : part;
      }
      return part;
    });
  };

  const renderContent = (text: string): React.ReactElement[] => {
    const lines = text.split('\n');
    const result: React.ReactElement[] = [];
    let i = 0;
    let codeBlockIndex = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks - fix the detection
      if (line.trim().startsWith('```')) {
        const language = line.trim().slice(3).trim() || 'text';
        const codeLines: string[] = [];
        i++;

        // Collect code lines until closing ```
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }

        if (codeLines.length > 0) {
          const code = codeLines.join('\n');
          const currentBlockIndex = codeBlockIndex++;

          result.push(
            <div key={`code-${i}`} className="relative group my-4">
              <button
                onClick={() => copyToClipboard(code, currentBlockIndex)}
                className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Copy code"
              >
                {copiedBlocks.has(currentBlockIndex) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  padding: '1rem',
                }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          );
        }
        i++;
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        result.push(
          <h1 key={i} className="text-2xl font-bold mb-4 mt-6">
            {renderTextWithCitations(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        result.push(
          <h2 key={i} className="text-xl font-semibold mb-3 mt-5">
            {renderTextWithCitations(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }

      if (line.startsWith('### ')) {
        result.push(
          <h3 key={i} className="text-lg font-medium mb-2 mt-4">
            {renderTextWithCitations(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // Lists
      if (line.match(/^\d+\.\s/)) {
        const listItems: React.ReactElement[] = [];
        while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
          listItems.push(
            <li key={i} className="mb-1">
              {renderTextWithCitations(lines[i].replace(/^\d+\.\s/, ''))}
            </li>
          );
          i++;
        }
        result.push(
          <ol key={`ol-${i}`} className="list-decimal list-inside mb-4 space-y-1">
            {listItems}
          </ol>
        );
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems: React.ReactElement[] = [];
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          listItems.push(
            <li key={i} className="mb-1">
              {renderTextWithCitations(lines[i].slice(2))}
            </li>
          );
          i++;
        }
        result.push(
          <ul key={`ul-${i}`} className="list-disc list-inside mb-4 space-y-1">
            {listItems}
          </ul>
        );
        continue;
      }

      // Empty lines
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Regular paragraphs with inline formatting
      const processInlineFormatting = (text: string): React.ReactNode[] => {
        // Split by bold text first
        const boldParts = text.split(/(\*\*.*?\*\*)/g);
        const result: React.ReactNode[] = [];
        
        boldParts.forEach((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // Bold text
            const boldContent = part.slice(2, -2);
            result.push(<strong key={`bold-${index}`}>{renderTextWithCitations(boldContent)}</strong>);
          } else if (part.includes('`')) {
            // Handle inline code
            const codeParts = part.split(/(`[^`]+`)/g);
            codeParts.forEach((codePart, codeIndex) => {
              if (codePart.startsWith('`') && codePart.endsWith('`')) {
                result.push(
                  <code key={`code-${index}-${codeIndex}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                    {codePart.slice(1, -1)}
                  </code>
                );
              } else {
                result.push(...renderTextWithCitations(codePart));
              }
            });
          } else {
            // Regular text with citations
            result.push(...renderTextWithCitations(part));
          }
        });
        
        return result;
      };

      result.push(
        <p key={i} className="mb-4 leading-relaxed">
          {processInlineFormatting(line)}
        </p>
      );
      i++;
    }

    // Add references section if there are URLs
    if (uniqueUrls.length > 0) {
      result.push(
        <div key="references" className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold mb-3 text-gray-700">References:</h4>
          <ol className="text-xs space-y-1">
            {uniqueUrls.map((url, index) => (
              <li key={index} className="text-gray-600">
                <span className="font-medium">[{index + 1}]</span>{' '}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ol>
        </div>
      );
    }

    return result;
  };

  return <div className="space-y-2">{renderContent(content)}</div>;
} 