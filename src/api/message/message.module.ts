import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { UserModule } from "../users/users.module";
import { Message, MessageSchema } from "src/scheme/message.schema";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => CloudinaryModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService, MongooseModule],
})
export class MessageModule {}