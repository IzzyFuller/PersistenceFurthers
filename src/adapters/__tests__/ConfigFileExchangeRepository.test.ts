import { ConfigFileExchangeRepository } from '../ConfigFileExchangeRepository';
import fs from 'fs/promises';

// Mock fs to control what the repository reads
jest.mock('fs/promises');

describe('ConfigFileExchangeRepository', () => {
  let repository: ConfigFileExchangeRepository;
  let originalEnv: NodeJS.ProcessEnv;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    originalEnv = process.env;
    mockFs = fs as jest.Mocked<typeof fs>;
    repository = new ConfigFileExchangeRepository();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should return active exchanges with default configuration', async () => {
    // Set up the mock config file that the repository will read
    const mockConfig = {
      exchanges: [
        {
          name: 'AuDHDLifeCoach',
          connectionString: 'amqp://localhost:5672',
          queueName: 'audhd.lifecoach.messages',
          enabled: true
        },
        {
          name: 'CommitmentDiscovery',
          connectionString: 'amqp://localhost:5672',
          queueName: 'audhd.lifecoach.commitments',
          enabled: true
        }
      ]
    };

    mockFs.readFile.mockResolvedValue(JSON.stringify(mockConfig));

    const exchanges = await repository.getActiveExchanges();

    expect(exchanges).toHaveLength(2);
    
    const audhd = exchanges.find(e => e.name === 'AuDHDLifeCoach');
    expect(audhd).toBeDefined();
    expect(audhd!.connectionString).toBe('amqp://localhost:5672');
    expect(audhd!.queueName).toBe('audhd.lifecoach.messages');
    expect(audhd!.enabled).toBe(true); // Change 'active' to 'enabled'

    const commitment = exchanges.find(e => e.name === 'CommitmentDiscovery');
    expect(commitment).toBeDefined();
    expect(commitment!.connectionString).toBe('amqp://localhost:5672');
    expect(commitment!.queueName).toBe('audhd.lifecoach.commitments');
    expect(commitment!.enabled).toBe(true); // Change 'active' to 'enabled'
  });

  it('should use development config in test environment', async () => {
    process.env.NODE_ENV = 'development';
    
    const mockConfig = {
      exchanges: [
        {
          name: 'AuDHDLifeCoach',
          connectionString: 'amqp://localhost:5672',
          queueName: 'audhd.lifecoach.messages.dev',
          enabled: true
        }
      ]
    };

    mockFs.readFile.mockResolvedValue(JSON.stringify(mockConfig));

    const customRepository = new ConfigFileExchangeRepository();
    const exchanges = await customRepository.getActiveExchanges();

    expect(mockFs.readFile).toHaveBeenCalledWith(
      expect.stringContaining('development.json'),
      'utf-8'
    );
    expect(exchanges[0].queueName).toBe('audhd.lifecoach.messages.dev');
  });

  it('should only return enabled exchanges', async () => {
    const mockConfig = {
      exchanges: [
        {
          name: 'EnabledExchange',
          connectionString: 'amqp://localhost:5672',
          queueName: 'enabled.queue',
          enabled: true
        },
        {
          name: 'DisabledExchange',
          connectionString: 'amqp://localhost:5672',
          queueName: 'disabled.queue',
          enabled: false
        }
      ]
    };

    mockFs.readFile.mockResolvedValue(JSON.stringify(mockConfig));

    const exchanges = await repository.getActiveExchanges();
    
    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].name).toBe('EnabledExchange');
    expect(exchanges[0].enabled).toBe(true);
  });

  it('should handle file read errors gracefully', async () => {
    mockFs.readFile.mockRejectedValue(new Error('File not found'));

    const exchanges = await repository.getActiveExchanges();
    
    expect(exchanges).toHaveLength(0);
  });
});
