
import { AMQPMessageListener } from '../AMQPMessageListener';
import { ExchangeConfigurationEntity } from '../../domain/entities/ExchangeConfiguration';
import { PersistMessageUseCase } from '../../usecases/PersistMessageUseCase';
import amqp from 'amqplib';

// Mock amqplib
jest.mock('amqplib');

describe('AMQPMessageListener', () => {
  let mockPersistMessageUseCase: jest.Mocked<PersistMessageUseCase>;
  let mockConnection: jest.Mocked<amqp.Connection>;
  let mockChannel: jest.Mocked<amqp.Channel>;
  let listener: AMQPMessageListener;
  let exchanges: ExchangeConfigurationEntity[];

  beforeEach(() => {
    mockPersistMessageUseCase = {
      execute: jest.fn(),
    };

    mockChannel = {
      assertQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
    } as any;

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
    } as any;

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);

    exchanges = [
      new ExchangeConfigurationEntity('TestExchange', 'amqp://localhost:5672', 'test.queue', true)
    ];

    listener = new AMQPMessageListener(exchanges, mockPersistMessageUseCase);

    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should start and connect to all exchanges', async () => {
    await listener.start();

    expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost:5672');
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('test.queue', { durable: true });
    expect(mockChannel.consume).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Connected to exchange: TestExchange');
  });

  it('should process incoming messages and persist them', async () => {
    const messageContent = { id: 'test-id', data: 'test content' };
    const mockMessage = {
      content: Buffer.from(JSON.stringify(messageContent))
    } as amqp.ConsumeMessage;

    // Setup consume to call the callback immediately
    mockChannel.consume.mockImplementation(async (queue, callback) => {
      if (callback) {
        await callback(mockMessage);
      }
      return { consumerTag: 'test-tag' } as any;
    });

    await listener.start();

    expect(mockPersistMessageUseCase.execute).toHaveBeenCalledTimes(1);
    const persistedMessage = mockPersistMessageUseCase.execute.mock.calls[0][0];
    
    expect(persistedMessage.id).toBe('test-id');
    expect(persistedMessage.exchangeName).toBe('TestExchange');
    expect(persistedMessage.content).toEqual(messageContent);
    expect(persistedMessage.metadata.queue).toBe('test.queue');
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
  });

  it('should generate ID when message has no ID', async () => {
    const messageContent = { data: 'test content' };
    const mockMessage = {
      content: Buffer.from(JSON.stringify(messageContent))
    } as amqp.ConsumeMessage;

    mockChannel.consume.mockImplementation(async (queue, callback) => {
      if (callback) {
        await callback(mockMessage);
      }
      return { consumerTag: 'test-tag' } as any;
    });

    await listener.start();

    const persistedMessage = mockPersistMessageUseCase.execute.mock.calls[0][0];
    expect(persistedMessage.id).toMatch(/^msg-\d+-[a-z0-9]+$/);
  });

  it('should handle null messages gracefully', async () => {
    mockChannel.consume.mockImplementation(async (queue, callback) => {
      if (callback) {
        await callback(null);
      }
      return { consumerTag: 'test-tag' } as any;
    });

    await listener.start();

    expect(mockPersistMessageUseCase.execute).not.toHaveBeenCalled();
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });

  it('should handle connection errors gracefully', async () => {
    (amqp.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    await listener.start();

    expect(console.error).toHaveBeenCalledWith(
      'Failed to connect to exchange TestExchange:',
      expect.any(Error)
    );
  });

  it('should stop and close all connections', async () => {
    await listener.start();
    await listener.stop();

    expect(mockConnection.close).toHaveBeenCalled();
  });

  it('should handle multiple exchanges', async () => {
    const multipleExchanges = [
      new ExchangeConfigurationEntity('Exchange1', 'amqp://localhost:5672', 'queue1', true),
      new ExchangeConfigurationEntity('Exchange2', 'amqp://localhost:5673', 'queue2', true)
    ];

    const multiListener = new AMQPMessageListener(multipleExchanges, mockPersistMessageUseCase);
    await multiListener.start();

    expect(amqp.connect).toHaveBeenCalledTimes(2);
    expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost:5672');
    expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost:5673');
  });
});
