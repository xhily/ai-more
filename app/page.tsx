'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface ModelResponse {
  name: string;
  displayName: string;
  content: string;
  loading: boolean;
  error: string | null;
  icon: string;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [responses, setResponses] = useState<ModelResponse[]>([
    { name: 'deepseek', displayName: 'DeepSeek R1', content: '', loading: false, error: null, icon: '🔷' },
    { name: 'qwen', displayName: 'Qwen 2.5', content: '', loading: false, error: null, icon: '🟦' },
    { name: 'glm', displayName: 'GLM-4', content: '', loading: false, error: null, icon: '🟪' },
    { name: 'hunyuan', displayName: 'Hunyuan', content: '', loading: false, error: null, icon: '🔵' },
    { name: 'internlm', displayName: 'InternLM 2.5', content: '', loading: false, error: null, icon: '🟩' },
  ]);

  const handleQuery = async () => {
    if (!question.trim() || isQuerying) return;

    setIsQuerying(true);
    
    // Reset all responses
    setResponses(prev => prev.map(r => ({ 
      ...r, 
      content: '', 
      loading: true, 
      error: null 
    })));

    // Query all models in parallel
    const queryPromises = responses.map(async (model, index) => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question, model: model.name }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No reader available');
        }

        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          setResponses(prev => {
            const newResponses = [...prev];
            newResponses[index] = {
              ...newResponses[index],
              content: accumulatedContent,
              loading: false,
            };
            return newResponses;
          });
        }
      } catch (error) {
        console.error(`[v0] Error querying ${model.name}:`, error);
        setResponses(prev => {
          const newResponses = [...prev];
          newResponses[index] = {
            ...newResponses[index],
            loading: false,
            error: '获取回复失败',
          };
          return newResponses;
        });
      }
    });

    await Promise.all(queryPromises);
    setIsQuerying(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">AI 模型比对工具</h1>
              <p className="text-sm text-muted-foreground">多模型同时回复，实时对比效果</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <Card className="p-6 mb-8 bg-card border-border">
          <div className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium mb-2 text-foreground">
                输入您的问题
              </label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入您的问题...&#10;提示：按 Ctrl+Enter 或 Cmd+Enter 快速发送"
                className="min-h-32 resize-none bg-background border-input text-foreground placeholder:text-muted-foreground"
                disabled={isQuerying}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isQuerying ? '正在查询所有模型...' : '准备就绪'}
              </p>
              <Button
                onClick={handleQuery}
                disabled={!question.trim() || isQuerying}
                className="min-w-32"
              >
                {isQuerying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    查询中
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    查询
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Responses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {responses.map((model) => (
            <Card
              key={model.name}
              className="p-6 bg-card border-border flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <span className="text-2xl">{model.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">{model.displayName}</h3>
                  <p className="text-xs text-muted-foreground">{model.name}</p>
                </div>
                {model.loading && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
              </div>

              <div className="flex-1 min-h-48 max-h-96 overflow-y-auto">
                {model.error ? (
                  <div className="text-destructive text-sm bg-destructive/10 rounded-lg p-4">
                    {model.error}
                  </div>
                ) : model.content ? (
                  <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap text-pretty">
                    {model.content}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm italic">
                    {model.loading ? '正在生成回复...' : '等待查询'}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>支持的模型：DeepSeek R1、Qwen 2.5、GLM-4、Hunyuan、InternLM 2.5</p>
            <p className="text-xs">由硅基流动平台提供技术支持</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
