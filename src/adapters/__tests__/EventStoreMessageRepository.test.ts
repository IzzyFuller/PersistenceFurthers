import { EventStoreMessageRepository } from '../EventStoreMessageRepository';
import { EventStoreDBClient } from '@eventstore/db-client';
import { MessageEntity } from '../../domain/entities/Message';

// Mock the EventStore client AND jsonEvent
jest.mock('@eventstore/db-client', () => ({
  EventStoreDBClient: jest.fn(),
  jsonEvent: jest.fn((event) => event), // Return the event object as-is for testing
}));

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
    
    // Debug: Log the actual call arguments
    const mockCall = mockEventStoreClient.appendToStream.mock.calls[0];
    console.log('Mock call:', mockCall);
    console.log('Mock call length:', mockCall?.length);
    console.log('Stream name:', mockCall?.[0]);
    console.log('Events param:', mockCall?.[1]);
    
    expect(mockCall).toBeDefined();
    expect(mockCall.length).toBe(2);
    
    const [streamName, eventsParam] = mockCall;
    
    expect(streamName).toBe('message-TestExchange-test-id');
    expect(eventsParam).toBeDefined();
    
    // Handle the fact that eventsParam could be a single event or array
    const events = Array.isArray(eventsParam) ? eventsParam : [eventsParam];
    console.log('Events array:', events);
    console.log('Events length:', events.length);
    console.log('First event:', events[0]);
    
    expect(events.length).toBe(1);
    
    const event = events[0] as any;
    expect(event).toBeDefined();
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
