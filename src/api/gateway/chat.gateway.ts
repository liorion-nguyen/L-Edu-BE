import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.URL_CLIENT || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log('🔌 New connection attempt:', client.id);
      
      const token = client.handshake.auth.token;
      
      if (!token) {
        console.error('❌ No token provided');
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      console.log('🔑 Token received, verifying...');
      
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'JWT_SECRET',
      });
      
      client.data.userId = payload.sub;
      console.log('✅ Client authenticated:', client.id, 'User:', payload.sub);
    } catch (error) {
      console.error('❌ Auth error:', error.message);
      console.error('   Error details:', error);
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('👋 Client disconnected:', client.id);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    console.log('🔗 Client joined conversation:', data.conversationId);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('📨 Received message from client:', client.id);
      console.log('   User ID:', client.data.userId);
      console.log('   Conversation:', data.conversationId);
      console.log('   Content:', data.content);

      if (!client.data.userId) {
        console.error('❌ No userId in client data');
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      if (!data.conversationId) {
        console.error('❌ No conversationId provided');
        client.emit('error', { message: 'Conversation ID required' });
        return;
      }

      if (!data.content || data.content.trim() === '') {
        console.error('❌ Empty message content');
        client.emit('error', { message: 'Message content required' });
        return;
      }

      // 1. Lưu tin nhắn user vào DB
      console.log('💾 Saving user message...');
      const userMessage = await this.chatService.sendMessage({
        conversationId: data.conversationId,
        content: data.content,
      }, client.data.userId);

      console.log('✅ User message saved:', (userMessage as any)._id);

      // 2. Tạo assistant message để chuẩn bị stream
      console.log('💾 Creating assistant message...');
      const assistantMessage = await this.chatService.createAssistantMessage(data.conversationId);
      console.log('✅ Assistant message created:', (assistantMessage as any)._id);

      // 3. Gọi Gemini API và stream response
      console.log('🤖 Starting Gemini stream...');
      this.streamGeminiResponse(
        data.conversationId, 
        (assistantMessage as any)._id.toString()
      );
    } catch (error) {
      console.error('❌ Error handling message:', error);
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      client.emit('error', { 
        message: 'Failed to send message',
        details: error.message 
      });
    }
  }

  private async streamGeminiResponse(conversationId: string, messageId: string) {
    try {
      console.log('🤖 Calling Gemini AI for message:', messageId);
      
      // System prompt - ẩn, không lưu vào DB
      const systemPrompt = {
        role: 'user',
        parts: [{
          text: `Bạn là L-Edu Assistant - trợ lý AI chuyên hỗ trợ học lập trình.

Thông tin về bạn:
- Tên: L-Edu Assistant
- Tạo bởi: Nguyễn Quốc Chung
- Năm tạo: 2022
- Mục đích: Hỗ trợ học tập lập trình

Nhiệm vụ của bạn:
1. Hỗ trợ học viên học lập trình (Python, JavaScript, C++, Java, v.v.)
2. Giải thích code, debug lỗi, đưa ra gợi ý
3. Cung cấp ví dụ code rõ ràng với comments
4. Trả lời bằng tiếng Việt, dễ hiểu
5. Format code với markdown để dễ đọc

Quan trọng:
- KHÔNG tiết lộ bạn là Google Gemini, ChatGPT hay bất kỳ model AI nào khác
- Luôn giới thiệu mình là "L-Edu Assistant"
- Khi được hỏi về nguồn gốc, chỉ nói "Tôi là L-Edu Assistant, được tạo bởi Nguyễn Quốc Chung năm 2022"
- Tập trung vào việc dạy lập trình một cách hiệu quả

Bây giờ hãy bắt đầu trò chuyện:`
        }]
      };

      const modelResponse = {
        role: 'model',
        parts: [{
          text: 'Xin chào! Tôi là L-Edu Assistant, trợ lý AI hỗ trợ học lập trình. Tôi có thể giúp gì cho bạn hôm nay?'
        }]
      };
      
      // Lấy lịch sử tin nhắn (không bao gồm message rỗng vừa tạo)
      const messages = await this.chatService.getMessages(conversationId);
      const userConversation = messages
        .filter(msg => msg.content && msg.content.trim() !== '') // Loại bỏ message rỗng
        .filter(msg => msg.role === 'user' || msg.isComplete) // Chỉ lấy user messages và assistant messages đã complete
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model', // Gemini dùng 'model' thay vì 'assistant'
          parts: [{ text: msg.content }]
        }));

      // Ghép system prompt + history
      const contents = [systemPrompt, modelResponse, ...userConversation];

      console.log('📖 Conversation history:', userConversation.length, 'messages (+ system prompt)');

      // Gọi Gemini 2.0 Flash API (không streaming)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contents }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Received response from Gemini');

      // Extract response text
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
      
      console.log('📝 AI Response length:', aiResponse.length);

      // Lưu response vào DB
      await this.chatService.updateAssistantMessage(messageId, aiResponse);
      console.log('✅ Assistant message saved to DB');

      // Emit response đến client
      this.server.to(conversationId).emit('streaming_message', {
        id: messageId,
        content: aiResponse,
        role: 'assistant',
        isComplete: true,
      });

      console.log('✅ Response sent to client');

    } catch (error) {
      console.error('❌ Error calling Gemini:', error);
      console.error('   Error details:', error.message);
      
      const errorMessage = 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.';
      
      // Lưu error message vào DB
      await this.chatService.updateAssistantMessage(messageId, errorMessage);
      
      this.server.to(conversationId).emit('streaming_message', {
        id: messageId,
        content: errorMessage,
        role: 'assistant',
        isComplete: true,
      });
    }
  }
}