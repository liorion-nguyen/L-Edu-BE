import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatRoomController } from "./chat-room.controller";
import { ChatRoomService } from "./chat-room.service";
import { UserModule } from "../users/users.module";
import { ChatRoom, ChatRoomSchema } from "src/scheme/chat-room.schema";
import { MessageModule } from "../message/message.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatRoom.name, schema: ChatRoomSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
  exports: [ChatRoomService, MongooseModule],
})
export class ChatRoomModule {}