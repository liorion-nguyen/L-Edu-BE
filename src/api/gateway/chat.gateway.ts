import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../refresh-token/refrehser-token.service';
import { JWT_CONFIG } from 'src/config/jwt.config';

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
    private refreshTokenService: RefreshTokenService,
  ) {}

  private getMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'heif': 'image/heif',
    };
    return mimeTypes[extension || ''] || 'image/jpeg';
  }

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
        secret: JWT_CONFIG.SECRET,
      });
      
      client.data.userId = payload.sub;
      console.log('✅ Client authenticated:', client.id, 'User:', payload.sub);
    } catch (error) {
      console.error('❌ Auth error:', error.message);
      console.error('   Error details:', error);
      
      // Handle different types of JWT errors
      if (error.name === 'TokenExpiredError') {
        console.log('🔄 Token expired, requesting refresh...');
        client.emit('token_expired', { 
          message: 'Token expired. Please refresh your token.',
          expiredAt: error.expiredAt 
        });
      } else if (error.name === 'JsonWebTokenError') {
        console.log('❌ Invalid token format');
        client.emit('error', { message: 'Invalid token format' });
      } else {
        console.log('❌ Token verification failed');
        client.emit('error', { message: 'Token verification failed' });
      }
      
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('👋 Client disconnected:', client.id);
  }

  @SubscribeMessage('refresh_token')
  async handleRefreshToken(
    @MessageBody() data: { refresh_token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('🔄 Token refresh request from client:', client.id);
      
      if (!data.refresh_token) {
        client.emit('refresh_error', { message: 'Refresh token required' });
        return;
      }

      const refreshResult = await this.refreshTokenService.refreshToken({
        refresh_token: data.refresh_token
      });

      console.log('✅ Token refreshed successfully for client:', client.id);
      
      // Verify the new token and update client data
      const payload = this.jwtService.verify(refreshResult.access_token, {
        secret: JWT_CONFIG.SECRET,
      });
      
      client.data.userId = payload.sub;
      
      client.emit('token_refreshed', {
        access_token: refreshResult.access_token,
        message: 'Token refreshed successfully'
      });
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      client.emit('refresh_error', { 
        message: 'Token refresh failed',
        details: error.message 
      });
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    console.log('🔗 Client joined conversation:', data.conversationId);
    console.log('🔗 Client ID:', client.id);
    console.log('🔗 Room members:', this.server.sockets.adapter.rooms.get(data.conversationId)?.size || 0);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { 
      conversationId: string; 
      content: string; 
      imageUrls?: string[];
    },
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
      if (data.imageUrls && data.imageUrls.length > 0) {
        console.log('   Images:', data.imageUrls.length, 'files');
      }
      
      const userMessage = await this.chatService.sendMessage({
        conversationId: data.conversationId,
        content: data.content,
        imageUrls: data.imageUrls,
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
      const userConversation = await Promise.all(
        messages
          .filter(msg => msg.content && msg.content.trim() !== '') // Loại bỏ message rỗng
          .filter(msg => msg.role === 'user' || msg.isComplete) // Chỉ lấy user messages và assistant messages đã complete
          .map(async msg => {
            const parts: any[] = [{ text: msg.content || '' }];
            
            // Thêm ảnh nếu có (chỉ cho user messages)
            if (msg.role === 'user' && msg.imageUrls && msg.imageUrls.length > 0) {
              console.log('📷 Processing', msg.imageUrls.length, 'images for message');
              
              // Giới hạn số lượng ảnh để tránh timeout
              const maxImages = 3;
              const imagesToProcess = msg.imageUrls.slice(0, maxImages);
              
              if (msg.imageUrls.length > maxImages) {
                console.warn(`⚠️ Too many images (${msg.imageUrls.length}), only processing first ${maxImages}`);
              }
              
              for (const imageUrl of imagesToProcess) {
                try {
                  console.log('📷 Downloading image:', imageUrl.substring(0, 50) + '...');
                  
                  // Download ảnh từ Cloudinary với timeout
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
                  
                  const imageResponse = await fetch(imageUrl, { 
                    signal: controller.signal,
                    headers: {
                      'User-Agent': 'L-Edu-Chatbot/1.0'
                    }
                  });
                  
                  clearTimeout(timeoutId);
                  
                  if (!imageResponse.ok) {
                    throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
                  }
                  
                  const arrayBuffer = await imageResponse.arrayBuffer();
                  
                  // Check file size (Gemini có giới hạn 20MB)
                  if (arrayBuffer.byteLength > 20 * 1024 * 1024) {
                    console.error('❌ Image too large:', `${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`);
                    continue;
                  }
                  
                  // Nếu ảnh quá lớn (>5MB), cảnh báo nhưng vẫn gửi
                  if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
                    console.warn('⚠️ Large image detected:', `${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB - may cause slow response`);
                  }
                  
                  const base64 = Buffer.from(arrayBuffer).toString('base64');
                  
                  // Detect mime type từ URL
                  const mimeType = this.getMimeTypeFromUrl(imageUrl);
                  
                  parts.push({
                    inlineData: {
                      mimeType,
                      data: base64
                    }
                  });
                  console.log('✅ Added image to request:', imageUrl.substring(0, 50) + '...', `${(arrayBuffer.byteLength / 1024).toFixed(2)}KB`);
                } catch (error) {
                  console.error('❌ Failed to fetch image:', imageUrl, error.message);
                  // Continue với các ảnh khác thay vì fail toàn bộ
                }
              }
            }
            
            return {
              role: msg.role === 'user' ? 'user' : 'model',
              parts
            };
          })
      );

      // Ghép system prompt + history
      const contents = [systemPrompt, modelResponse, ...userConversation];

      console.log('📖 Conversation history:', userConversation.length, 'messages (+ system prompt)');
      
      // Debug: Log request payload
      const requestPayload = {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      };
      
      console.log('📤 Request payload:', JSON.stringify(requestPayload, null, 2));

      // Gọi Gemini 2.5 Flash Lite API với STREAMING và timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('⏰ Gemini API timeout after 60 seconds');
      }, 60000); // 60s timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      console.log('📡 Streaming response from Gemini...');

      // Thêm timeout cho streaming
      const streamTimeoutId = setTimeout(() => {
        console.log('⏰ Streaming timeout after 120 seconds');
        reader.cancel();
      }, 120000); // 120s timeout cho streaming

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('✅ Stream complete');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') continue;
                
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (text) {
                  fullResponse += text;
                  
                  // Emit streaming chunk đến client
                  console.log('📤 Emitting streaming chunk to conversationId:', conversationId);
                  this.server.to(conversationId).emit('streaming_message', {
                    id: messageId,
                    content: fullResponse,
                    role: 'assistant',
                    isComplete: false,
                  });
                  
                  console.log('📤 Streamed chunk, total length:', fullResponse.length);
                }
              } catch (e) {
                // Ignore JSON parse errors
                console.log('⚠️ Failed to parse chunk:', e.message);
              }
            }
          }
        }
      } finally {
        clearTimeout(streamTimeoutId);
      }

      console.log('📝 Full AI Response length:', fullResponse.length);

      // Lưu response vào DB
      await this.chatService.updateAssistantMessage(messageId, fullResponse);
      console.log('✅ Assistant message saved to DB');

      // Emit final message
      console.log('📤 Emitting final message with isComplete: true');
      console.log('📤 Emitting to conversationId:', conversationId);
      console.log('📤 MessageId:', messageId);
      console.log('📤 Available rooms:', Array.from(this.server.sockets.adapter.rooms.keys()));
      console.log('📤 Room members for', conversationId, ':', this.server.sockets.adapter.rooms.get(conversationId)?.size || 0);
      
      this.server.to(conversationId).emit('streaming_message', {
        id: messageId,
        content: fullResponse,
        role: 'assistant',
        isComplete: true,
      });

      console.log('✅ Final response sent to client');

    } catch (error) {
      console.error('❌ Error calling Gemini:', error);
      this.server.to(conversationId).emit('error', {
        message: 'Lỗi khi gọi AI',
        details: error.message,
      });
    }
    }
  }