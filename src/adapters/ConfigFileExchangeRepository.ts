import { ExchangeConfigurationEntity } from '../domain/entities/ExchangeConfiguration';
import { ExchangeConfigRepository } from '../domain/repositories/ExchangeConfigRepository';
import fs from 'fs/promises';
import path from 'path';

export class ConfigFileExchangeRepository implements ExchangeConfigRepository { 
  private readonly configPath: string;

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    this.configPath = path.join(process.cwd(), 'config', `${env}.json`);
  }

  async getActiveExchanges(): Promise<ExchangeConfigurationEntity[]> {
    try {
      const configFile = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configFile);
      
      return config.exchanges
        .filter((exchange: any) => exchange.enabled) // This reads from JSON
        .map((exchange: any) => new ExchangeConfigurationEntity(
          exchange.name,
          exchange.connectionString,
          exchange.queueName,
          exchange.enabled  // This maps to the entity constructor
        ));
    } catch (error) {
      console.error(`Failed to load exchange configuration from ${this.configPath}:`, error);
      return [];
    }
  }
}
