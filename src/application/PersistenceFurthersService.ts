
import { EventStoreDBClient } from '@eventstore/db-client';
import { EventStoreMessageRepository } from '../adapters/EventStoreMessageRepository';
import { ConfigFileExchangeRepository } from '../adapters/ConfigFileExchangeRepository';
import { AMQPMessageListener, MessageListener } from '../adapters/AMQPMessageListener';
import { PersistMessage } from '../usecases/PersistMessageUseCase';
import { MonitorExchanges } from '../usecases/MonitorExchangesUseCase';

export class PersistenceFurthersService {
  private messageListener?: MessageListener;
  private eventStoreClient?: EventStoreDBClient;

  async start(): Promise<void> {
    // Initialize EventStore client
    this.eventStoreClient = EventStoreDBClient.connectionString(
      process.env.EVENTSTORE_CONNECTION_STRING || 'esdb://localhost:2113?tls=false'
    );

    // Setup repositories
    const messageRepository = new EventStoreMessageRepository(this.eventStoreClient);
    const exchangeConfigRepository = new ConfigFileExchangeRepository();

    // Setup use cases
    const persistMessageUseCase = new PersistMessage(messageRepository);
    const monitorExchangesUseCase = new MonitorExchanges(exchangeConfigRepository);

    // Get active exchanges
    const activeExchanges = await monitorExchangesUseCase.getActiveExchanges();
    console.log(`Monitoring ${activeExchanges.length} exchanges`);

    // Start message listener
    this.messageListener = new AMQPMessageListener(activeExchanges, persistMessageUseCase);
    await this.messageListener.start();

    console.log('Persistence Furthers service started successfully');
  }

  async stop(): Promise<void> {
    if (this.messageListener) {
      await this.messageListener.stop();
    }
    console.log('Persistence Furthers service stopped');
  }
}
