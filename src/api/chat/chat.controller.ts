import { Controller, Post, Get, Body, Param, UseGuards, Req, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto, GetMessagesDto } from './dto/chat.dto';
import { successResponse } from 'src/common/dto/response.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @Get('conversations-history')
  @UseGuards(JwtAuthGuard)
  async getConversationsHistory(@Req() req) {
    const isAdmin = req.user.role === 'ADMIN';
    const conversations = await this.chatService.getConversationsWithDetails(req.user._id, isAdmin);
    return successResponse(conversations);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('id') conversationId: string, @Req() req) {
    console.log('📍 GET /chat/conversations/:id/messages called');
    console.log('   Conversation ID:', conversationId);
    console.log('   User:', req.user);
    console.log('   Is Admin:', req.user.role === 'ADMIN');
    
    const isAdmin = req.user.role === 'ADMIN';
    const messages = await this.chatService.getMessages(conversationId, undefined, req.user._id, isAdmin);
    
    console.log('   Messages found:', messages.length);
    return successResponse(messages);
  }

  @Post('send')
  async sendMessage(@Body() dto: SendMessageDto, @Req() req) {
    const message = await this.chatService.sendMessage(dto, req.user._id);
    
    // Bắt đầu stream response từ 
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

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is missing');
    }
    console.log('📤 Uploading image to Cloudinary:', file.originalname);
    const result = await this.cloudinaryService.uploadFile(file);
    console.log('✅ Image uploaded:', result.secure_url);
    return successResponse({ 
      url: result.secure_url,
      type: result.type,
      fileName: file.originalname,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-delete-images')
  async testDeleteImages(@Body() body: { urls: string[] }) {
    try {
      console.log('🧪 Testing image deletion:', body.urls);
      const result = await this.cloudinaryService.deleteFilesByUrls(body.urls);
      return successResponse({ 
        message: 'Test completed',
        result 
      });
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  // Admin endpoints for chat management
  @Delete('conversations/:id')
  @UseGuards(JwtAuthGuard)
  async deleteConversationById(@Param('id') conversationId: string, @Req() req) {
    console.log('📍 DELETE /chat/conversations/:id called');
    console.log('   Conversation ID:', conversationId);
    console.log('   User:', req.user);
    
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Only admins can delete conversations');
    }
    
    await this.chatService.deleteConversationById(conversationId);
    return successResponse({ message: 'Conversation deleted successfully' });
  }

  @Delete('messages/:id')
  @UseGuards(JwtAuthGuard)
  async deleteMessageById(@Param('id') messageId: string, @Req() req) {
    console.log('📍 DELETE /chat/messages/:id called');
    console.log('   Message ID:', messageId);
    console.log('   User:', req.user);
    
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Only admins can delete messages');
    }
    
    await this.chatService.deleteMessageById(messageId);
    return successResponse({ message: 'Message deleted successfully' });
  }

}

