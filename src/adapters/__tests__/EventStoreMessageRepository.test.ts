
import { EventStoreMessageRepository } from '../EventStoreMessageRepository';
import { EventStoreDBClient } from '@eventstore/db-client';
import { MessageEntity } from '../../domain/entities/Message';

// Mock the EventStore client
jest.mock('@eventstore/db-client');

describe('EventStoreMessageRepository', () => {
  let mockEventStoreClient: jest.Mocked<EventStoreDBClient>;
  let repository: EventStoreMessageRepository;

  beforeEach(() => {
    mockEventStoreClient = {
      appendToStream: jest.fn(),
    } as any;
    repository = new EventStoreMessageRepository(mockEventStoreClient);
  });

  it('should persist message to EventStore', async () => {
    const message = new MessageEntity(
      'test-id',
      'TestExchange',
      { data: 'test content' },
      new Date('2023-01-01T00:00:00Z'),
      { key: 'value' }
    );

    mockEventStoreClient.appendToStream.mockResolvedValue(undefined as any);

    await repository.persistMessage(message);

    expect(mockEventStoreClient.appendToStream).toHaveBeenCalledTimes(1);
    
    const [streamName, event] = mockEventStoreClient.appendToStream.mock.calls[0];
    expect(streamName).toBe('message-TestExchange-test-id');
    expect(event.type).toBe('messageReceivedFromTestExchange');
    expect(event.data).toEqual({
      id: 'test-id',
      exchangeName: 'TestExchange',
      content: { data: 'test content' },
      timestamp: '2023-01-01T00:00:00.000Z',
      metadata: { key: 'value' }
    });
  });

  it('should propagate EventStore errors', async () => {
    const message = new MessageEntity(
      'test-id',
      'TestExchange',
      { data: 'test' },
      new Date()
    );

    mockEventStoreClient.appendToStream.mockRejectedValue(new Error('EventStore error'));

    await expect(repository.persistMessage(message)).rejects.toThrow('EventStore error');
  });
});
