import { ExchangeConfigurationEntity } from '../domain/entities/ExchangeConfiguration';
import { ExchangeConfigRepository } from '../domain/repositories/ExchangeConfigRepository';
import fs from 'fs/promises';
import path from 'path';

export class ConfigFileExchangeRepository implements ExchangeConfigRepository { 
  private readonly configPath: string;

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    this.configPath = path.join(process.cwd(), 'config', `${env}.json`);
    console.log(`ConfigFileExchangeRepository: Looking for config at ${this.configPath}`);
  }

  async getActiveExchanges(): Promise<ExchangeConfigurationEntity[]> {
    try {
      console.log(`ConfigFileExchangeRepository: Attempting to read ${this.configPath}`);
      const configFile = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configFile);
      
      console.log(`ConfigFileExchangeRepository: Loaded config:`, config);
      
      const activeExchanges = config.exchanges
        .filter((exchange: any) => exchange.enabled)
        .map((exchange: any) => new ExchangeConfigurationEntity(
          exchange.name,
          exchange.connectionString,
          exchange.queueName,
          exchange.enabled
        ));
      
      console.log(`ConfigFileExchangeRepository: Found ${activeExchanges.length} active exchanges`);
      return activeExchanges;
    } catch (error) {
      console.error(`Failed to load exchange configuration from ${this.configPath}:`, error);
      return [];
    }
  }
}
