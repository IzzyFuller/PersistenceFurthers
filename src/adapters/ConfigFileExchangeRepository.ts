
import { ExchangeConfig, ExchangeConfigurationEntity } from '../domain/entities/ExchangeConfiguration';
import { ExchangeConfigRepository } from '../domain/repositories/ExchangeConfigRepository';

export class ConfigFileExchangeRepository implements ExchangeConfigRepository {
  private exchanges: ExchangeConfig[] = [
    new ExchangeConfigurationEntity(
      'AuDHDLifeCoach',
      process.env.AUDHD_LIFECOACH_CONNECTION || 'amqp://localhost:5672',
      process.env.AUDHD_LIFECOACH_QUEUE || 'audhd.lifecoach.messages',
      true
    ),
    new ExchangeConfigurationEntity(
      'CommitmentDiscovery',
      process.env.COMMITMENT_DISCOVERY_CONNECTION || 'amqp://localhost:5672',
      process.env.COMMITMENT_DISCOVERY_QUEUE || 'audhd.lifecoach.commitments',
      true
    )
  ];

  async getActiveExchanges(): Promise<ExchangeConfig[]> {
    return this.exchanges.filter(exchange => exchange.enabled);
  }
}
