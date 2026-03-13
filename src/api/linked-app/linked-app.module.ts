import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinkedAppService } from './linked-app.service';
import { LinkedAppController } from './linked-app.controller';
import { LinkedApp, LinkedAppSchema } from '../../scheme/linked-app.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LinkedApp.name, schema: LinkedAppSchema }]),
  ],
  controllers: [LinkedAppController],
  providers: [LinkedAppService],
  exports: [LinkedAppService],
})
export class LinkedAppModule {}
