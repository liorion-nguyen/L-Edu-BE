import { Controller, Post, Body } from '@nestjs/common';
import { PusherService } from './pusher.service';

@Controller('pusher')
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @Post()
  async triggerEvent(
    @Body() body: { channel: string; event: string; data: any }
  ) {
    const { channel, event, data } = body;
    await this.pusherService.triggerEvent(channel, event, data);
  }
}