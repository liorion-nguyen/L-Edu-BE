import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from '../gateway/chat.gateway';
import { Conversation, ConversationSchema } from 'src/scheme/conversation.schema';
import { ChatMessage, ChatMessageSchema } from 'src/scheme/chat-message.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { RefreshTokenModule } from '../refresh-token/refrehser-token.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'JWT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
    CloudinaryModule,
    RefreshTokenModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}

