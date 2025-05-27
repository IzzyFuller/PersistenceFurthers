
import { PersistMessage } from '../PersistMessageUseCase';
import { MessageRepository } from '../../domain/repositories/MessageRepository';
import { MessageEntity } from '../../domain/entities/Message';

describe('PersistMessage', () => {
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let persistMessage: PersistMessage;

  beforeEach(() => {
    mockMessageRepository = {
      persistMessage: jest.fn(),
    };
    persistMessage = new PersistMessage(mockMessageRepository);
  });

  it('should persist a message through the repository', async () => {
    const message = new MessageEntity(
      'test-id',
      'TestExchange',
      { data: 'test' },
      new Date()
    );

    await persistMessage.execute(message);

    expect(mockMessageRepository.persistMessage).toHaveBeenCalledWith(message);
    expect(mockMessageRepository.persistMessage).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const message = new MessageEntity(
      'test-id',
      'TestExchange',
      { data: 'test' },
      new Date()
    );

    mockMessageRepository.persistMessage.mockRejectedValue(new Error('Repository error'));

    await expect(persistMessage.execute(message)).rejects.toThrow('Repository error');
  });
});
