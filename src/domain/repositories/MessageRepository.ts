
import { Message } from '../entities/Message';

export interface MessageRepository {
  persistMessage(message: Message): Promise<void>;
}
