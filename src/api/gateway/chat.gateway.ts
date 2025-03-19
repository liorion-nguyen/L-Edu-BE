import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true }) 
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    // Khi kết nối WebSocket được khởi tạo
    afterInit(server: Server) {
        this.logger.log('WebSocket Initialized');
    }

    // Khi một client kết nối
    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    // Khi một client ngắt kết nối
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Lắng nghe sự kiện "sendMessage" từ client
    @SubscribeMessage('sendMessage')
    handleMessage(client: Socket, payload: { message: string; sender: string }) {
        this.logger.log(`Received message: ${payload.message} from ${payload.sender}`);

        // Phát lại tin nhắn đến tất cả client
        this.server.emit('receiveMessage', payload);
    }
}
