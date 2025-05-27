import { PersistenceFurthersService } from '../PersistenceFurthersService';
import { EventStoreDBClient } from '@eventstore/db-client';

// Mock all dependencies
jest.mock('@eventstore/db-client');
jest.mock('../../adapters/EventStoreMessageRepository');
jest.mock('../../adapters/ConfigFileExchangeRepository');
jest.mock('../../adapters/AMQPMessageListener');
jest.mock('../../usecases/PersistMessageUseCase');
jest.mock('../../usecases/MonitorExchangesUseCase');

// Import mocked classes
import { EventStoreMessageRepository } from '../../adapters/EventStoreMessageRepository';
import { ConfigFileExchangeRepository } from '../../adapters/ConfigFileExchangeRepository';
import { AMQPMessageListener } from '../../adapters/AMQPMessageListener';
import { PersistMessage } from '../../usecases/PersistMessageUseCase';
import { MonitorExchanges } from '../../usecases/MonitorExchangesUseCase';
import { ExchangeConfigurationEntity } from '../../domain/entities/ExchangeConfiguration';

describe('PersistenceFurthersService', () => {
  let service: PersistenceFurthersService;
  let mockEventStoreClient: jest.Mocked<EventStoreDBClient>;
  let mockMessageListener: jest.Mocked<AMQPMessageListener>;
  let mockMonitorExchanges: jest.Mocked<MonitorExchanges>;

  beforeEach(() => {
    // Mock EventStore client
    mockEventStoreClient = {} as any;
    (EventStoreDBClient.connectionString as jest.Mock).mockReturnValue(mockEventStoreClient);

    // Mock message listener
    mockMessageListener = {
      start: jest.fn(),
      stop: jest.fn(),
    } as any;
    (AMQPMessageListener as jest.Mock).mockImplementation(() => mockMessageListener);

    // Mock monitor exchanges use case
    const mockExchanges = [
      new ExchangeConfigurationEntity('TestExchange', 'amqp://localhost:5672', 'test.queue', true)
    ];
    mockMonitorExchanges = {
      getActiveExchanges: jest.fn().mockResolvedValue(mockExchanges),
    } as any;
    (MonitorExchanges as jest.Mock).mockImplementation(() => mockMonitorExchanges);

    service = new PersistenceFurthersService();

    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should start service successfully', async () => {
    await service.start();

    expect(EventStoreDBClient.connectionString).toHaveBeenCalledWith(
      'esdb://localhost:2113?tls=false'
    );
    expect(EventStoreMessageRepository).toHaveBeenCalledWith(mockEventStoreClient);
    expect(ConfigFileExchangeRepository).toHaveBeenCalled();
    expect(PersistMessage).toHaveBeenCalled();
    expect(MonitorExchanges).toHaveBeenCalled();
    expect(mockMonitorExchanges.getActiveExchanges).toHaveBeenCalled();
    expect(AMQPMessageListener).toHaveBeenCalled();
    expect(mockMessageListener.start).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Monitoring 1 exchanges');
    expect(console.log).toHaveBeenCalledWith('Persistence Furthers service started successfully');
  });

  it('should use custom EventStore connection string from environment', async () => {
    const originalEnv = process.env.EVENTSTORE_CONNECTION_STRING;
    process.env.EVENTSTORE_CONNECTION_STRING = 'esdb://custom:2113?tls=true';

    await service.start();

    expect(EventStoreDBClient.connectionString).toHaveBeenCalledWith(
      'esdb://custom:2113?tls=true'
    );

    // Restore original env
    if (originalEnv) {
      process.env.EVENTSTORE_CONNECTION_STRING = originalEnv;
    } else {
      delete process.env.EVENTSTORE_CONNECTION_STRING;
    }
  });

  it('should stop service and message listener', async () => {
    await service.start();
    await service.stop();

    expect(mockMessageListener.stop).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Persistence Furthers service stopped');
  });

  it('should handle stop gracefully when message listener is not initialized', async () => {
    await service.stop();

    expect(console.log).toHaveBeenCalledWith('Persistence Furthers service stopped');
  });

  it('should handle errors during startup', async () => {
    mockMonitorExchanges.getActiveExchanges.mockRejectedValue(new Error('Config error'));

    await expect(service.start()).rejects.toThrow('Config error');
  });
});
