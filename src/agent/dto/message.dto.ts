import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from "class-validator";

export class MessageRequestDto {
  @ApiProperty({
    description: "The message to send to the agent",
    example: "What is the current time?",
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class CreateMessageDto {
  @ApiProperty({
    description: "The ID of the conversation this message belongs to",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;

  @ApiProperty({
    description: "The role of the message sender",
    enum: ["user", "assistant", "function"],
    example: "user",
  })
  @IsEnum(["user", "assistant", "function"])
  @IsNotEmpty()
  role: "user" | "assistant" | "function";

  @ApiProperty({
    description: "The content of the message",
    example: "Hello, how can you help me today?",
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: "The name of the function (only for function messages)",
    required: false,
    example: "get_weather",
  })
  @IsString()
  @IsOptional()
  name?: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: "The unique identifier of the message",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: "The ID of the conversation this message belongs to",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;

  @ApiProperty({
    description: "The role of the message sender",
    enum: ["user", "assistant", "function"],
    example: "assistant",
  })
  @IsEnum(["user", "assistant", "function"])
  @IsNotEmpty()
  role: "user" | "assistant" | "function";

  @ApiProperty({
    description: "The content of the message",
    example: "I can help you with various tasks. What would you like to know?",
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: "The name of the function (only for function messages)",
    required: false,
    example: "get_weather",
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "The timestamp when the message was created",
    example: "2024-03-11T17:37:36.000Z",
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: string;
}
