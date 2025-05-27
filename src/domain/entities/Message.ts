
export interface Message {
  readonly id: string;
  readonly exchangeName: string;
  readonly content: unknown;
  readonly timestamp: Date;
  readonly metadata: Record<string, unknown>;
  toEventType(): string;
}

export class MessageEntity implements Message {
  constructor(
    public readonly id: string,
    public readonly exchangeName: string,
    public readonly content: unknown,
    public readonly timestamp: Date,
    public readonly metadata: Record<string, unknown> = {}
  ) {
    if (!id.trim()) {
      throw new Error('Message ID cannot be empty');
    }
    if (!exchangeName.trim()) {
      throw new Error('Exchange name cannot be empty');
    }
  }

  toEventType(): string {
    return `messageReceivedFrom${this.exchangeName}`;
  }
}
