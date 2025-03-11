import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ConversationResponseDto } from "./dto/conversation.dto";
import { MessageRequestDto, MessageResponseDto } from "./dto/message.dto";
import { plainToInstance } from "class-transformer";

@ApiTags("agent")
@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("conversations")
  @ApiOperation({ summary: "Create a new conversation" })
  @ApiResponse({
    status: 201,
    description: "The conversation has been successfully created.",
    type: ConversationResponseDto,
  })
  async createConversation(): Promise<ConversationResponseDto> {
    return plainToInstance(
      ConversationResponseDto,
      this.agentService.createConversation(),
    );
  }

  @Post("conversations/:id/messages")
  @ApiOperation({ summary: "Send a message in a conversation" })
  @ApiResponse({
    status: 201,
    description: "The message has been successfully processed.",
    type: String,
  })
  async sendMessage(
    @Param("id") conversationId: string,
    @Body() { message }: MessageRequestDto,
  ): Promise<string> {
    return this.agentService.getResponse(Number(conversationId), message);
  }

  @Get("conversations/:id/messages")
  @ApiOperation({ summary: "Get all messages in a conversation" })
  @ApiResponse({
    status: 200,
    description: "List of all messages in the conversation.",
    type: [MessageResponseDto],
  })
  async getMessages(
    @Param("id") conversationId: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.agentService.getConversationMessages(
      Number(conversationId),
    );
    return messages.map((message) =>
      plainToInstance(MessageResponseDto, message),
    );
  }
}
