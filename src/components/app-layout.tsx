'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChatInterface } from './chat-interface';
import { UploadInterface } from './upload-interface';
import { DomainSelector } from './domain-selector';
import { MessageSquare, Upload, Zap, Settings } from 'lucide-react';

export function AppLayout() {
  const [selectedDomain, setSelectedDomain] = useState('inngest');
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Expert Chatbot Platform</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              Powered by RAG + GPT-4
            </Badge>
          </div>
          
          {/* Domain Selector */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Active Domain:
            </div>
            <DomainSelector 
              selectedDomain={selectedDomain}
              onDomainChange={setSelectedDomain}
              className="w-64"
            />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">
          Chat with domain experts or upload new knowledge to expand capabilities
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full m-0 p-0">
              <ChatInterface selectedDomain={selectedDomain} />
            </TabsContent>

            <TabsContent value="upload" className="h-full m-0 p-4 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <UploadInterface />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 