import { Injectable } from '@nestjs/common';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
    private pusher: Pusher;

    constructor() {
        this.pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true
        });
    }

    async triggerEvent(channel: string, event: string, data: any) {
        console.log('Triggering event:', { channel, event, data }); 
        const response = await this.pusher.trigger(channel, event, data);
        console.log('Pusher response:', response); 
        return 'Event triggered';
    }    
}