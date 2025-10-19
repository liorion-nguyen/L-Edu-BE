import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from 'src/scheme/conversation.schema';
import { ChatMessage, ChatMessageDocument } from 'src/scheme/chat-message.schema';
import { SendMessageDto } from './dto/chat.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ChatService {
  private readonly geminiApiKey: string;
  private readonly geminiApiUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(ChatMessage.name) private messageModel: Model<ChatMessageDocument>,
    private cloudinaryService: CloudinaryService,
  ) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent';
  }

  async createConversation(userId: string, title: string): Promise<ConversationDocument> {
    const conversation = new this.conversationModel({
      userId,
      title,
    });
    return await conversation.save();
  }

  async getOrCreateUserConversation(userId: string): Promise<ConversationDocument> {
    // Tìm conversation của user (mỗi user chỉ có 1 conversation)
    const existingConversation = await this.conversationModel
      .findOne({ userId, isActive: true })
      .exec();

    // Nếu đã có thì return luôn
    if (existingConversation) {
      console.log('📂 Found existing conversation:', existingConversation._id);
      return existingConversation;
    }

    // Nếu chưa có thì tạo mới
    const newConversation = await this.createConversation(
      userId,
      `Cuộc trò chuyện của ${userId}`,
    );
    console.log('🆕 Created new conversation for user:', userId);
    
    return newConversation;
  }

  async getConversations(userId: string): Promise<ConversationDocument[]> {
    return await this.conversationModel
      .find({ userId, isActive: true })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async getConversationsWithDetails(userId: string, isAdmin: boolean = false): Promise<any[]> {
    // Admin có thể xem tất cả conversation, user thường chỉ xem của mình
    const filter = isAdmin 
      ? { isActive: true } 
      : { userId, isActive: true };
      
    const conversations = await this.conversationModel
      .find(filter)
      .sort({ lastMessageAt: -1 })
      .exec();
    console.log(conversations);

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Lấy tin nhắn cuối cùng
        const lastMessage = await this.messageModel
          .findOne({ 
            $or: [
              { conversationId: conversation._id },
              { conversationId: new Types.ObjectId(conversation._id.toString()) }
            ]
          })
          .sort({ createdAt: -1 })
          .exec();

        // Đếm tổng số tin nhắn
        const messageCount = await this.messageModel
          .countDocuments({ 
            $or: [
              { conversationId: conversation._id },
              { conversationId: new Types.ObjectId(conversation._id.toString()) }
            ]
          })
          .exec();

        return {
          _id: conversation._id,
          userId: conversation.userId,
          title: conversation.title,
          isActive: conversation.isActive,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: (conversation as any).createdAt,
          updatedAt: (conversation as any).updatedAt,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            role: lastMessage.role,
            createdAt: (lastMessage as any).createdAt,
            imageUrls: lastMessage.imageUrls
          } : null,
          messageCount: messageCount,
          status: conversation.isActive ? 'active' : 'inactive'
        };
      })
    );

    return conversationsWithDetails;
  }

  async getMessages(conversationId: string, lastMessageId?: string, userId?: string, isAdmin?: boolean): Promise<ChatMessage[]> {
    console.log('🔍 Getting messages for conversation:', conversationId);
    
    // Kiểm tra quyền xem conversation (nếu có userId)
    if (userId && !isAdmin) {
      const conversation = await this.conversationModel.findById(conversationId).exec();
      
      if (!conversation || conversation.userId !== userId) {
        console.log('❌ User not authorized to view this conversation');
        return []; // User không có quyền xem conversation này
      }
    }
    
    // Debug: Kiểm tra conversation có tồn tại không
    const conversation = await this.conversationModel.findById(conversationId).exec();
    console.log('🏠 Conversation exists:', !!conversation, conversation ? {
      id: conversation._id,
      title: conversation.title,
      userId: conversation.userId
    } : 'Not found');
    
    // Debug: Kiểm tra tất cả messages trong database
    const allMessages = await this.messageModel.find({}).limit(5).exec();
    console.log('📋 Sample messages in DB:', allMessages.map(m => ({
      id: m._id,
      conversationId: m.conversationId,
      conversationIdType: typeof m.conversationId,
      role: m.role,
      content: m.content?.substring(0, 50)
    })));
    
    // Debug: Tìm messages với conversationId cụ thể
    const directQuery = await this.messageModel.find({ conversationId }).exec();
    console.log('🎯 Direct query result:', directQuery.length, 'messages');
    
    // Thử query với cả string và ObjectId
    const query: any = { 
      $or: [
        { conversationId: conversationId },
        { conversationId: new Types.ObjectId(conversationId) }
      ]
    };
    
    if (lastMessageId) {
      query._id = { $gt: lastMessageId };
    }
    
    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: 1 })
      .exec();
      
    console.log('📨 Found', messages.length, 'messages');
    return messages;
  }

  async sendMessage(dto: SendMessageDto, userId: string): Promise<ChatMessage> {
    // Lưu tin nhắn của user
    const userMessage = new this.messageModel({
      conversationId: dto.conversationId,
      content: dto.content,
      role: 'user',
      isComplete: true,
      imageUrls: dto.imageUrls || [],
    });
    const saved = await userMessage.save();

    // Cập nhật thời gian tin nhắn cuối
    await this.conversationModel.findByIdAndUpdate(dto.conversationId, {
      lastMessageAt: new Date(),
    });

    return saved;
  }

  async createAssistantMessage(conversationId: string): Promise<ChatMessage> {
    // Tạo tin nhắn assistant rỗng để stream
    const assistantMessage = new this.messageModel({
      conversationId,
      content: '',
      role: 'assistant',
      isStreaming: true,
      isComplete: false,
    });
    return await assistantMessage.save();
  }

  async updateAssistantMessage(messageId: string, content: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(messageId, {
      content,
      isStreaming: false,
      isComplete: true,
    });
  }

  async clearConversation(conversationId: string): Promise<void> {
    console.log('🗑️ Clearing conversation:', conversationId);
    
    // Lấy tất cả messages để thu thập imageUrls
    const messages = await this.messageModel.find({ conversationId }).exec();
    console.log('📋 Found messages:', messages.length);
    
    const allImageUrls: string[] = [];
    
    messages.forEach((msg, index) => {
      console.log(`📄 Message ${index + 1}:`, {
        id: msg._id,
        role: msg.role,
        hasImages: msg.imageUrls && msg.imageUrls.length > 0,
        imageCount: msg.imageUrls ? msg.imageUrls.length : 0,
        imageUrls: msg.imageUrls
      });
      
      if (msg.imageUrls && msg.imageUrls.length > 0) {
        allImageUrls.push(...msg.imageUrls);
      }
    });
    
    console.log('📷 Total images to delete:', allImageUrls.length);
    console.log('📷 Image URLs:', allImageUrls);
    
    // Xóa messages
    await this.messageModel.deleteMany({ conversationId });
    console.log('✅ Messages deleted');
    
    // Xóa ảnh khỏi Cloudinary nếu có
    if (allImageUrls.length > 0) {
      try {
        console.log('🗑️ Starting Cloudinary cleanup...');
        const result = await this.cloudinaryService.deleteFilesByUrls(allImageUrls);
        console.log('🗑️ Cloudinary cleanup result:', result);
      } catch (error) {
        console.error('❌ Failed to delete images from Cloudinary:', error);
      }
    } else {
      console.log('ℹ️ No images to delete from Cloudinary');
    }
  }

  async deleteConversation(userId: string): Promise<void> {
    // Đánh dấu conversation cũ là inactive
    await this.conversationModel.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
    console.log('🗑️ Marked conversation as inactive for user:', userId);
  }

  async streamGeminiResponse(conversationId: string, messageId: string): Promise<void> {
    try {
      // Lấy lịch sử tin nhắn
      const messages = await this.getMessages(conversationId);
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Gọi Gemini API với streaming
      const response = await fetch(`${this.geminiApiUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: history,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const text = data.candidates[0].content.parts[0].text;
                fullResponse += text;
                
                // Cập nhật tin nhắn với nội dung mới
                await this.messageModel.findByIdAndUpdate(messageId, {
                  content: fullResponse,
                });
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      // Đánh dấu tin nhắn hoàn thành
      await this.messageModel.findByIdAndUpdate(messageId, {
        isStreaming: false,
        isComplete: true,
      });

    } catch (error) {
      console.error('Error streaming Gemini response:', error);
      // Cập nhật tin nhắn với lỗi
      await this.messageModel.findByIdAndUpdate(messageId, {
        content: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        isStreaming: false,
        isComplete: true,
      });
    }
  }

  // Admin methods for chat management
  async deleteConversationById(conversationId: string): Promise<void> {
    console.log('🗑️ Admin: Deleting conversation by ID:', conversationId);
    
    // Lấy tất cả messages để thu thập imageUrls
    const messages = await this.messageModel.find({ conversationId }).exec();
    console.log('📋 Found messages:', messages.length);
    
    const allImageUrls: string[] = [];
    
    messages.forEach((msg) => {
      if (msg.imageUrls && msg.imageUrls.length > 0) {
        allImageUrls.push(...msg.imageUrls);
      }
    });
    
    console.log('📷 Total images to delete:', allImageUrls.length);
    
    // Xóa tất cả messages trong conversation
    await this.messageModel.deleteMany({ conversationId });
    console.log('✅ Messages deleted');
    
    // Xóa conversation
    await this.conversationModel.findByIdAndDelete(conversationId);
    console.log('✅ Conversation deleted');
    
    // Xóa ảnh khỏi Cloudinary nếu có
    if (allImageUrls.length > 0) {
      try {
        console.log('🗑️ Starting Cloudinary cleanup...');
        const result = await this.cloudinaryService.deleteFilesByUrls(allImageUrls);
        console.log('🗑️ Cloudinary cleanup result:', result);
      } catch (error) {
        console.error('❌ Failed to delete images from Cloudinary:', error);
      }
    }
  }

  async deleteMessageById(messageId: string): Promise<void> {
    console.log('🗑️ Admin: Deleting message by ID:', messageId);
    
    // Lấy message để kiểm tra imageUrls
    const message = await this.messageModel.findById(messageId);
    
    if (!message) {
      console.log('⚠️ Message not found:', messageId);
      return;
    }
    
    // Xóa message
    await this.messageModel.findByIdAndDelete(messageId);
    console.log('✅ Message deleted');
    
    // Xóa ảnh khỏi Cloudinary nếu có
    if (message.imageUrls && message.imageUrls.length > 0) {
      try {
        console.log('🗑️ Deleting images from Cloudinary:', message.imageUrls);
        const result = await this.cloudinaryService.deleteFilesByUrls(message.imageUrls);
        console.log('🗑️ Cloudinary cleanup result:', result);
      } catch (error) {
        console.error('❌ Failed to delete images from Cloudinary:', error);
      }
    }
  }
}

