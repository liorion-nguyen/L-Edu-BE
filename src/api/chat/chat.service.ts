import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from 'src/scheme/conversation.schema';
import { ChatMessage, ChatMessageDocument } from 'src/scheme/chat-message.schema';
import { SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly geminiApiKey: string;
  private readonly geminiApiUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(ChatMessage.name) private messageModel: Model<ChatMessageDocument>,
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

  async getMessages(conversationId: string, lastMessageId?: string): Promise<ChatMessage[]> {
    const query: any = { conversationId };
    if (lastMessageId) {
      query._id = { $gt: lastMessageId };
    }
    return await this.messageModel
      .find(query)
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendMessage(dto: SendMessageDto, userId: string): Promise<ChatMessage> {
    // Lưu tin nhắn của user
    const userMessage = new this.messageModel({
      conversationId: dto.conversationId,
      content: dto.content,
      role: 'user',
      isComplete: true,
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
    // Xóa tất cả tin nhắn trong conversation
    await this.messageModel.deleteMany({ conversationId });
    console.log('🗑️ Cleared all messages in conversation:', conversationId);
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
}

