import { Controller, Post, Get, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto, GetMessagesDto } from './dto/chat.dto';
import { successResponse } from 'src/common/dto/response.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('my-conversation')
  async getMyConversation(@Req() req) {
    console.log('📍 GET /chat/my-conversation called');
    console.log('   User:', req.user);
    const conversation = await this.chatService.getOrCreateUserConversation(req.user._id);
    return successResponse(conversation);
  }

  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto, @Req() req) {
    const conversation = await this.chatService.createConversation(req.user._id, dto.title);
    return successResponse(conversation);
  }

  @Get('conversations')
  async getConversations(@Req() req) {
    const conversations = await this.chatService.getConversations(req.user._id);
    return successResponse(conversations);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    const messages = await this.chatService.getMessages(conversationId);
    return successResponse(messages);
  }

  @Post('send')
  async sendMessage(@Body() dto: SendMessageDto, @Req() req) {
    const message = await this.chatService.sendMessage(dto, req.user._id);
    
    // Bắt đầu stream response từ Gemini
    this.chatService.streamGeminiResponse(dto.conversationId, (message as any)._id.toString());
    
    return successResponse({
      messageId: (message as any)._id,
      conversationId: dto.conversationId,
      isStreaming: true,
    });
  }

  @Delete('conversations/:id/messages')
  async clearConversation(@Param('id') conversationId: string) {
    await this.chatService.clearConversation(conversationId);
    return successResponse({ message: 'Đã xóa tất cả tin nhắn' });
  }

  @Delete('my-conversation')
  async deleteMyConversation(@Req() req) {
    await this.chatService.deleteConversation(req.user._id);
    // Tạo conversation mới
    const newConversation = await this.chatService.getOrCreateUserConversation(req.user._id);
    return successResponse({ 
      message: 'Đã tạo cuộc trò chuyện mới',
      conversation: newConversation 
    });
  }
}

