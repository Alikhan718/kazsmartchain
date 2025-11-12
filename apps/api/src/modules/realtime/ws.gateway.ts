import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';

@WebSocketGateway({ path: '/ws' })
export class WsGateway {
  @WebSocketServer()
  server!: Server;

  broadcast(event: string, payload: unknown) {
    const data = JSON.stringify({ event, payload });
    this.server.clients.forEach((client: any) => {
      try {
        client.send(data);
      } catch {
        // ignore
      }
    });
  }
}

