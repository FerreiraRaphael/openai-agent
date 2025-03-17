import { Controller, Get, Param, Post } from '@nestjs/common';
// import { Response } from 'express';
import { AgentService } from './agent.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConversationResponseDto } from './dto/conversation.dto';
import { MessageResponseDto } from './dto/message.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'The conversation has been successfully created.',
    type: ConversationResponseDto,
  })
  async createConversation(): Promise<ConversationResponseDto> {
    return plainToInstance(ConversationResponseDto, this.agentService.createConversation());
  }

  // @Post('conversations/:id/messages')
  // @ApiOperation({ summary: 'Send a message in a conversation' })
  // @ApiResponse({
  //   status: 201,
  //   description: "Server-sent events stream of the assistant's response",
  // })
  // async sendMessage(
  //   @Param('id') conversationId: string,
  //   @Body() { message }: MessageRequestDto,
  //   @Res() res: Response,
  // ): Promise<void> {
  //   res.setHeader('Content-Type', 'text/event-stream');
  //   res.setHeader('Cache-Control', 'no-cache');
  //   res.setHeader('Connection', 'keep-alive');
  //   res.flushHeaders();
  //   try {
  //     const stream = await this.agentService.getStreamingResponse(Number(conversationId), message);
  //     stream.pipe(res);
  //   } catch (error) {
  //     res.write(`data: ${error.message}\n\n`);
  //     res.end();
  //   }
  // }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get all messages in a conversation' })
  @ApiResponse({
    status: 200,
    description: 'List of all messages in the conversation.',
    type: [MessageResponseDto],
  })
  async getMessages(@Param('id') conversationId: string): Promise<MessageResponseDto[]> {
    const messages = await this.agentService.getConversationMessages(Number(conversationId));
    return messages.map(message => plainToInstance(MessageResponseDto, message));
  }
}
