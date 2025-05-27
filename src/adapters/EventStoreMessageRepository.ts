import { EventStoreDBClient, jsonEvent } from '@eventstore/db-client';
import { Message } from '../domain/entities/Message';
import { MessageRepository } from '../domain/repositories/MessageRepository';

export class EventStoreMessageRepository implements MessageRepository {
  constructor(private readonly client: EventStoreDBClient) {}

  async persistMessage(message: Message): Promise<void> {
    const event = jsonEvent({
      type: message.toEventType(),
      data: {
        id: message.id,
        exchangeName: message.exchangeName,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata
      }
    });

    const streamName = `message-${message.exchangeName}-${message.id}`;
    
    // Pass an array of events, not a single event
    await this.client.appendToStream(streamName, [event]);
  }
}
