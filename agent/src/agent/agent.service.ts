import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DatabaseService } from '../db/database.service';
import { eq } from 'drizzle-orm';
import { conversations, messages } from '../db/schema';
import { DrizzleError } from 'drizzle-orm/errors';
// import {
//   ChatCompletionMessageParam,
//   // ChatCompletionUserMessageParam,
//   // ChatCompletionAssistantMessageParam,
//   ChatCompletionFunctionMessageParam,
// } from 'openai/resources/chat/completions';
// import { Readable } from 'stream';

type TimeResponse = {
  time: string;
};

type WeatherResponse = {
  city: string;
  temperature: string;
  condition: string;
};

type FunctionResponse = TimeResponse | WeatherResponse;
type AgentFunction = (args?: Record<string, unknown>) => FunctionResponse;

// type MessageRole = 'user' | 'assistant' | 'function';

@Injectable()
export class AgentService {
  private client: OpenAI;
  private availableFunctions: Map<string, AgentFunction> = new Map();

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.client = new OpenAI({ apiKey });
    this.initializeFunctions();
  }

  private initializeFunctions(): void {
    this.availableFunctions.clear();
    this.availableFunctions.set('get_current_time', () => this.getCurrentTime());
    this.availableFunctions.set('get_weather', args => this.getWeather(args?.city as string));
  }

  private getCurrentTime(): TimeResponse {
    const currentTime = new Date().toLocaleTimeString();
    return { time: currentTime };
  }

  private getWeather(city: string = 'London'): WeatherResponse {
    // Mock implementation
    return {
      city,
      temperature: '22°C',
      condition: 'Sunny',
    };
  }

  private getFunctionSpecs() {
    return [
      {
        name: 'get_current_time',
        description: 'Get the current time',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_weather',
        description: 'Get the weather for a specific city',
        parameters: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: 'The city to get weather for',
            },
          },
          required: ['city'],
        },
      },
    ];
  }

  private executeFunction(functionName: string, functionArgs: Record<string, unknown>): string {
    const func = this.availableFunctions.get(functionName);
    if (!func) {
      throw new Error(`Function ${functionName} not found`);
    }

    const result = func(functionArgs);
    return JSON.stringify(result);
  }

  async createConversation() {
    const db = this.db.getDb();
    const result = await db.insert(conversations).values({}).returning();
    return result[0];
  }

  // async addMessage(conversationId: number, role: MessageRole, content: string, name?: string) {
  //   const db = this.db.getDb();
  //   return db.insert(messages).values({
  //     conversationId,
  //     role,
  //     content,
  //     name,
  //   });
  // }

  async getConversationMessages(conversationId: number) {
    try {
      const db = this.db.getDb();
      const result = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);
      return result;
    } catch (error) {
      if (error instanceof DrizzleError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw error;
    }
  }

  // async getResponse(conversationId: number, userInput: string) {
  //   // Add user input to conversation history
  //   await this.addMessage(conversationId, 'user', userInput);

  //   // Get conversation history
  //   const history = await this.getConversationMessages(conversationId);
  //   const messages: ChatCompletionMessageParam[] = history.map(msg => {
  //     if (msg.role === 'function') {
  //       return {
  //         role: msg.role,
  //         name: msg.name || 'unknown',
  //         content: msg.content,
  //       } as ChatCompletionFunctionMessageParam;
  //     }
  //     return {
  //       role: msg.role,
  //       content: msg.content,
  //     } as ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam;
  //   });

  //   // Get response from OpenAI with function calling
  //   const response = await this.client.chat.completions.create({
  //     model: 'gpt-3.5-turbo',
  //     messages,
  //     functions: this.getFunctionSpecs(),
  //     temperature: 0.7,
  //     max_tokens: 150,
  //   });

  //   const message = response.choices[0].message;

  //   // Check if the model wants to call a function
  //   if (message.function_call) {
  //     // Get function details
  //     const functionName = message.function_call.name;
  //     const functionArgs = JSON.parse(message.function_call.arguments);

  //     // Execute the function
  //     const functionResponse = this.executeFunction(
  //       functionName,
  //       functionArgs as Record<string, unknown>,
  //     );

  //     // Add function call and result to conversation history
  //     if (message.content) {
  //       await this.addMessage(conversationId, 'assistant', message.content);
  //     }
  //     await this.addMessage(conversationId, 'function', functionResponse, functionName);

  //     // Get final response from OpenAI with function result
  //     const finalResponse = await this.client.chat.completions.create({
  //       model: 'gpt-3.5-turbo',
  //       messages: [
  //         ...messages,
  //         {
  //           role: 'function',
  //           name: functionName,
  //           content: functionResponse,
  //         } as ChatCompletionFunctionMessageParam,
  //       ],
  //       temperature: 0.7,
  //       max_tokens: 150,
  //     });

  //     const assistantResponse = finalResponse.choices[0].message.content;
  //     if (assistantResponse) {
  //       await this.addMessage(conversationId, 'assistant', assistantResponse);
  //       return assistantResponse;
  //     }
  //     return 'No response generated';
  //   } else if (message.content) {
  //     await this.addMessage(conversationId, 'assistant', message.content);
  //     return message.content;
  //   }

  //   return 'No response generated';
  // }

  // async getStreamingResponse(conversationId: number, userInput: string): Promise<Readable> {
  //   await this.addMessage(conversationId, 'user', userInput);
  //   const history = await this.getConversationMessages(conversationId);

  //   const messages: ChatCompletionMessageParam[] = history.map(msg => {
  //     if (msg.role === 'function' && msg.name) {
  //       return {
  //         role: msg.role,
  //         name: msg.name,
  //         content: msg.content || '',
  //       } as ChatCompletionFunctionMessageParam;
  //     }
  //     return {
  //       role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
  //       content: msg.content || '',
  //     } as ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam;
  //   });

  //   const stream = new Readable({
  //     read() {}, // Required but we push data manually
  //   });

  //   // Start the OpenAI stream in the background
  //   this.handleOpenAIStream(conversationId, messages, stream).catch(error => {
  //     console.error('Streaming error:', error);
  //     stream.destroy(error);
  //   });

  //   return stream;
  // }

  // private async handleOpenAIStream(
  //   conversationId: number,
  //   messages: ChatCompletionMessageParam[],
  //   stream: Readable,
  // ): Promise<void> {
  //   try {
  //     const response = await this.client.chat.completions.create({
  //       model: 'gpt-3.5-turbo',
  //       messages,
  //       functions: this.getFunctionSpecs(),
  //       temperature: 0.7,
  //       stream: true,
  //     });

  //     let functionCall: { name: string; arguments: string } | undefined;
  //     let content = '';

  //     for await (const chunk of response) {
  //       const delta = chunk.choices[0]?.delta;

  //       if (delta.function_call) {
  //         functionCall = functionCall || { name: '', arguments: '' };
  //         if (delta.function_call.name) {
  //           functionCall.name += delta.function_call.name;
  //         }
  //         if (delta.function_call.arguments) {
  //           functionCall.arguments += delta.function_call.arguments;
  //         }
  //       } else if (delta.content) {
  //         content += delta.content;
  //         // Preserve line breaks in the content
  //         const formattedContent = delta.content.replace(/\n/g, '\\n');
  //         stream.push(`data: ${formattedContent}\n\n`);
  //       }
  //     }

  //     if (functionCall && functionCall.name && functionCall.arguments) {
  //       if (content) {
  //         await this.addMessage(conversationId, 'assistant', content);
  //       }

  //       const functionArgs = JSON.parse(functionCall.arguments);
  //       const functionResponse = this.executeFunction(functionCall.name, functionArgs);
  //       await this.addMessage(conversationId, 'function', functionResponse, functionCall.name);

  //       const finalResponse = await this.client.chat.completions.create({
  //         model: 'gpt-3.5-turbo',
  //         messages: [
  //           ...messages,
  //           {
  //             role: 'function',
  //             name: functionCall.name,
  //             content: functionResponse,
  //           } as ChatCompletionFunctionMessageParam,
  //         ],
  //         temperature: 0.7,
  //         stream: true,
  //       });

  //       for await (const chunk of finalResponse) {
  //         const content = chunk.choices[0]?.delta?.content;
  //         if (content) {
  //           stream.push(`data: ${content}\n\n`);
  //         }
  //       }

  //       await this.addMessage(conversationId, 'assistant', content);
  //     } else if (content) {
  //       await this.addMessage(conversationId, 'assistant', content);
  //     }

  //     stream.push(null);
  //   } catch (error) {
  //     stream.destroy(error as Error);
  //     throw error;
  //   }
  // }
}
