import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot } from 'lucide-react';
import type { TripDetails } from '@/types/trip';
import {
  getTripAgentControllerGetTripPlansQueryKey,
  useTripAgentControllerGetTripPlans,
  useTripAgentControllerProcessTripQuery,
} from '@/api/generated/trip-agent/trip-agent';
import ReactMarkdown from 'react-markdown';
import { useQueryClient } from '@tanstack/react-query';
import { useAgentControllerCreateConversation } from '@/api/generated/agent/agent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onTripUpdate: (trip: TripDetails | null) => void;
}

export function ChatInterface({ onTripUpdate }: ChatInterfaceProps) {
  const client = useQueryClient();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there! I'm your trip planning assistant. Where would you like to go?",
    },
  ]);
  const { mutateAsync: processTripQuery } = useTripAgentControllerProcessTripQuery({
    mutation: {
      onSuccess: () => {
        console.log('processTripQuery success', conversationId);
        client.invalidateQueries({
          queryKey: getTripAgentControllerGetTripPlansQueryKey(conversationId?.toString() ?? '1'),
        });
      },
    },
  });
  const { mutateAsync: createConversation } = useAgentControllerCreateConversation({
    mutation: {
      onSuccess: (res) => {
        console.log('createConversation', res);
        if (res.data.id) {
          client.invalidateQueries({
            queryKey: getTripAgentControllerGetTripPlansQueryKey(res.data.id.toString()),
          });
          setConversationId(res.data.id);
        }
      },
    },
  });
  const { data: tripPlans } = useTripAgentControllerGetTripPlans(conversationId?.toString() ?? '', {
    query: {
      enabled: !!conversationId,
    },
  });

  useEffect(() => {
    createConversation();
  }, [createConversation]);
  useEffect(() => {
    if (tripPlans?.data) {
      console.log('tripPlans', tripPlans.data);
      onTripUpdate(tripPlans.data[0]);
    }
  }, [onTripUpdate, tripPlans]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!conversationId) return;
    const userMessage = input;
    setInput('');

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Set loading state
    setIsLoading(true);

    try {
      // Process the user query with our agent
      const data = await processTripQuery(
        {
          id: conversationId?.toString(),
          data: {
            query: userMessage,
          },
        },
        {
          onSuccess: (data) => {
            console.log(data);
          },
        }
      );
      const response = data.data.response;
      // const tripDetails = data.data.tripDetails;

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

      // Update trip details if available
    } catch (error) {
      console.error('Error processing query:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="h-8 w-8">
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 prose prose-sm dark:prose-invert max-w-none ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about destinations, hotels, activities..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
