
import { Message } from '../domain/entities/Message';
import { MessageRepository } from '../domain/repositories/MessageRepository';

export interface PersistMessageUseCase {
  execute(message: Message): Promise<void>;
}

export class PersistMessage implements PersistMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(message: Message): Promise<void> {
    await this.messageRepository.persistMessage(message);
  }
}
