
import { ExchangeConfig } from '../entities/ExchangeConfiguration';

export interface ExchangeConfigRepository {
  getActiveExchanges(): Promise<ExchangeConfig[]>;
}
