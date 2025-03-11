import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AgentService } from './agent.service';

interface MessageRequest {
  message: string;
}

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('conversations')
  async createConversation() {
    return this.agentService.createConversation();
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() { message }: MessageRequest,
  ) {
    return this.agentService.getResponse(Number(conversationId), message);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.agentService.getConversationMessages(Number(conversationId));
  }
}
