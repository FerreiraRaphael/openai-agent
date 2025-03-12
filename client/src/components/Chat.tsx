import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useAgentControllerCreateConversation,
  useAgentControllerSendMessage,
  useAgentControllerGetMessages,
} from '@/api/generated/agent/agent';
import type { MessageResponseDto } from '@/api/model';

export function Chat() {
  const [conversationId, setConversationId] = useState<string>('');
  const [input, setInput] = useState('');

  // Create a new conversation
  const { mutate: createConversation } = useAgentControllerCreateConversation({
    mutation: {
      onSuccess: (response) => {
        setConversationId(response.data.id.toString());
      },
    },
  });

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useAgentControllerSendMessage({
    mutation: {
      onSuccess: () => {
        // Messages will be automatically updated through the query
      },
    },
  });

  // Get messages query
  const { data: messages, isLoading: isLoadingMessages } = useAgentControllerGetMessages(
    conversationId,
    {
      query: {
        enabled: !!conversationId,
        refetchInterval: 1000, // Poll for new messages every second
      },
    }
  );

  // Create conversation on component mount
  useEffect(() => {
    createConversation();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !conversationId) return;

    sendMessage({
      id: conversationId,
      data: { message: input.trim() },
    });
    setInput('');
  };

  const isLoading = isLoadingMessages || isSending;

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
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
                    AI
                  </div>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <p className="text-muted-foreground">Thinking...</p>
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
        <Button type="submit" disabled={isLoading || !conversationId}>
          Send
        </Button>
      </form>
    </div>
  );
}
