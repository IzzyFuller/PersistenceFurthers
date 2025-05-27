
export interface ExchangeConfig {
  readonly name: string;
  readonly connectionString: string;
  readonly queueName: string;
  readonly enabled: boolean;
}

export class ExchangeConfigurationEntity implements ExchangeConfig {
  constructor(
    public readonly name: string,
    public readonly connectionString: string,
    public readonly queueName: string,
    public readonly enabled: boolean = true
  ) {
    if (!name.trim()) {
      throw new Error('Exchange name cannot be empty');
    }
    if (!connectionString.trim()) {
      throw new Error('Connection string cannot be empty');
    }
    if (!queueName.trim()) {
      throw new Error('Queue name cannot be empty');
    }
  }
}
