
import { ConfigFileExchangeRepository } from '../ConfigFileExchangeRepository';

describe('ConfigFileExchangeRepository', () => {
  let repository: ConfigFileExchangeRepository;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    repository = new ConfigFileExchangeRepository();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return active exchanges with default configuration', async () => {
    const exchanges = await repository.getActiveExchanges();

    expect(exchanges).toHaveLength(2);
    
    const audhd = exchanges.find(e => e.name === 'AuDHDLifeCoach');
    expect(audhd).toBeDefined();
    expect(audhd!.connectionString).toBe('amqp://localhost:5672');
    expect(audhd!.queueName).toBe('audhd.lifecoach.messages');
    expect(audhd!.enabled).toBe(true);

    const commitment = exchanges.find(e => e.name === 'CommitmentDiscovery');
    expect(commitment).toBeDefined();
    expect(commitment!.connectionString).toBe('amqp://localhost:5672');
    expect(commitment!.queueName).toBe('audhd.lifecoach.commitments');
    expect(commitment!.enabled).toBe(true);
  });

  it('should use environment variables when provided', async () => {
    process.env.AUDHD_LIFECOACH_CONNECTION = 'amqp://custom:5672';
    process.env.AUDHD_LIFECOACH_QUEUE = 'custom.queue';
    process.env.COMMITMENT_DISCOVERY_CONNECTION = 'amqp://custom2:5672';
    process.env.COMMITMENT_DISCOVERY_QUEUE = 'custom2.queue';

    // Create new instance to pick up env vars
    const customRepository = new ConfigFileExchangeRepository();
    const exchanges = await customRepository.getActiveExchanges();

    const audhd = exchanges.find(e => e.name === 'AuDHDLifeCoach');
    expect(audhd!.connectionString).toBe('amqp://custom:5672');
    expect(audhd!.queueName).toBe('custom.queue');

    const commitment = exchanges.find(e => e.name === 'CommitmentDiscovery');
    expect(commitment!.connectionString).toBe('amqp://custom2:5672');
    expect(commitment!.queueName).toBe('custom2.queue');
  });

  it('should only return enabled exchanges', async () => {
    const exchanges = await repository.getActiveExchanges();
    
    exchanges.forEach(exchange => {
      expect(exchange.enabled).toBe(true);
    });
  });
});
