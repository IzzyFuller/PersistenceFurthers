
import { ExchangeConfigurationEntity } from '../ExchangeConfiguration';

describe('ExchangeConfigurationEntity', () => {
  it('should create a valid exchange configuration', () => {
    const config = new ExchangeConfigurationEntity(
      'TestExchange',
      'amqp://localhost:5672',
      'test.queue',
      true
    );

    expect(config.name).toBe('TestExchange');
    expect(config.connectionString).toBe('amqp://localhost:5672');
    expect(config.queueName).toBe('test.queue');
    expect(config.enabled).toBe(true);
  });

  it('should default enabled to true when not provided', () => {
    const config = new ExchangeConfigurationEntity(
      'TestExchange',
      'amqp://localhost:5672',
      'test.queue'
    );

    expect(config.enabled).toBe(true);
  });

  it('should throw error for empty name', () => {
    expect(() => new ExchangeConfigurationEntity(
      '',
      'amqp://localhost:5672',
      'test.queue'
    )).toThrow('Exchange name cannot be empty');
  });

  it('should throw error for whitespace-only name', () => {
    expect(() => new ExchangeConfigurationEntity(
      '   ',
      'amqp://localhost:5672',
      'test.queue'
    )).toThrow('Exchange name cannot be empty');
  });

  it('should throw error for empty connection string', () => {
    expect(() => new ExchangeConfigurationEntity(
      'TestExchange',
      '',
      'test.queue'
    )).toThrow('Connection string cannot be empty');
  });

  it('should throw error for whitespace-only connection string', () => {
    expect(() => new ExchangeConfigurationEntity(
      'TestExchange',
      '   ',
      'test.queue'
    )).toThrow('Connection string cannot be empty');
  });

  it('should throw error for empty queue name', () => {
    expect(() => new ExchangeConfigurationEntity(
      'TestExchange',
      'amqp://localhost:5672',
      ''
    )).toThrow('Queue name cannot be empty');
  });

  it('should throw error for whitespace-only queue name', () => {
    expect(() => new ExchangeConfigurationEntity(
      'TestExchange',
      'amqp://localhost:5672',
      '   '
    )).toThrow('Queue name cannot be empty');
  });
});
