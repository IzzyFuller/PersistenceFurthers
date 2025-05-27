
import { MessageEntity } from '../Message';

describe('MessageEntity', () => {
  it('should create a valid message entity', () => {
    const message = new MessageEntity(
      'test-id',
      'TestExchange',
      { data: 'test' },
      new Date(),
      { key: 'value' }
    );

    expect(message.id).toBe('test-id');
    expect(message.exchangeName).toBe('TestExchange');
    expect(message.content).toEqual({ data: 'test' });
    expect(message.metadata).toEqual({ key: 'value' });
  });

  it('should throw error for empty id', () => {
    expect(() => new MessageEntity(
      '',
      'TestExchange',
      {},
      new Date()
    )).toThrow('Message ID cannot be empty');
  });

  it('should throw error for empty exchange name', () => {
    expect(() => new MessageEntity(
      'test-id',
      '',
      {},
      new Date()
    )).toThrow('Exchange name cannot be empty');
  });

  it('should generate correct event type', () => {
    const message = new MessageEntity(
      'test-id',
      'AuDHDLifeCoach',
      {},
      new Date()
    );

    expect(message.toEventType()).toBe('messageReceivedFromAuDHDLifeCoach');
  });
});
