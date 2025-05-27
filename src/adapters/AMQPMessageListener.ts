import * as amqp from 'amqplib';
import { MessageEntity } from '../domain/entities/Message';
import { ExchangeConfigurationEntity } from '../domain/entities/ExchangeConfiguration';
import { PersistMessageUseCase } from '../usecases/PersistMessageUseCase';

export interface MessageListener {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export class AMQPMessageListener implements MessageListener {
  private connections: amqp.ChannelModel[] = [];

  constructor(
    private readonly exchanges: ExchangeConfigurationEntity[],
    private readonly persistMessageUseCase: PersistMessageUseCase
  ) {}

  async start(): Promise<void> {
    for (const exchange of this.exchanges) {
      await this.connectToExchange(exchange);
    }
  }

  async stop(): Promise<void> {
    for (const connection of this.connections) {
      await connection.close();
    }
    this.connections = [];
  }

  private async connectToExchange(exchangeConfig: ExchangeConfigurationEntity): Promise<void> {
    try {
      const connection = await amqp.connect(exchangeConfig.connectionString);
      this.connections.push(connection);

      const channel = await connection.createChannel();
      await channel.assertQueue(exchangeConfig.queueName, { durable: true });

      await channel.consume(exchangeConfig.queueName, async (msg) => {
        if (msg) {
          const messageContent = JSON.parse(msg.content.toString());
          
          const message = new MessageEntity(
            messageContent.id || this.generateId(),
            exchangeConfig.name,
            messageContent,
            new Date(),
            {
              queue: exchangeConfig.queueName,
              receivedAt: new Date().toISOString()
            }
          );

          await this.persistMessageUseCase.execute(message);
          channel.ack(msg);
        }
      });

      console.log(`Connected to exchange: ${exchangeConfig.name}`);
    } catch (error) {
      console.error(`Failed to connect to exchange ${exchangeConfig.name}:`, error);
    }
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
