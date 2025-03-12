import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useAgentControllerCreateConversation,
  useAgentControllerGetMessages,
} from '@/api/generated/agent/agent';
import type { MessageResponseDto } from '@/api/model';
import { AXIOS_INSTANCE } from '@/api/axios-client';

export function Chat() {
  const [conversationId, setConversationId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  console.log('streamingContent', streamingContent);

  const { mutate: createConversation } = useAgentControllerCreateConversation({
    mutation: {
      onSuccess: (response) => {
        setConversationId(response.data.id.toString());
      },
    },
  });

  const { data: messages, refetch: refetchMessages } = useAgentControllerGetMessages(
    conversationId,
    {
      query: {
        enabled: !!conversationId,
      },
    }
  );

  useEffect(() => {
    createConversation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !conversationId) return;

    const userInput = input.trim();
    setInput('');
    setStreamingContent('');
    setIsStreaming(true);

    try {
      const response = await fetch(
        `${AXIOS_INSTANCE.defaults.baseURL}/agent/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ message: userInput }),
        }
      );

      const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
      if (!reader) {
        throw new Error('No reader available');
      }
      const True = true;
      while (True) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const lines = value.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const content = line.slice(6);
              if (content) {
                const formattedContent = content.replace(/\\n/g, '\n');
                setStreamingContent((prev) => prev + formattedContent);
              }
            }
          }
        }
      }

      setIsStreaming(false);
      refetchMessages();
      setStreamingContent('');
    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
      refetchMessages();
      setStreamingContent('');
    }
  };

  return (
    <div className="container max-w-3xl mx-auto h-[calc(100vh-2rem)] flex flex-col gap-4 py-4">
      <Card className="flex-1">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages?.data?.map((message: MessageResponseDto) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </div>
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {streamingContent && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
                    AI
                  </div>
                </Avatar>
                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                  <p className="whitespace-pre-wrap">{streamingContent}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={!conversationId}>
          Send
        </Button>
      </form>
    </div>
  );
}
