
import { ExchangeConfig } from '../domain/entities/ExchangeConfiguration';
import { ExchangeConfigRepository } from '../domain/repositories/ExchangeConfigRepository';

export interface MonitorExchangesUseCase {
  getActiveExchanges(): Promise<ExchangeConfig[]>;
}

export class MonitorExchanges implements MonitorExchangesUseCase {
  constructor(private readonly exchangeConfigRepository: ExchangeConfigRepository) {}

  async getActiveExchanges(): Promise<ExchangeConfig[]> {
    return await this.exchangeConfigRepository.getActiveExchanges();
  }
}
