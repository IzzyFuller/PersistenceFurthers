
import { MonitorExchanges } from '../MonitorExchangesUseCase';
import { ExchangeConfigRepository } from '../../domain/repositories/ExchangeConfigRepository';
import { ExchangeConfigurationEntity } from '../../domain/entities/ExchangeConfiguration';

describe('MonitorExchanges', () => {
  let mockExchangeConfigRepository: jest.Mocked<ExchangeConfigRepository>;
  let monitorExchanges: MonitorExchanges;

  beforeEach(() => {
    mockExchangeConfigRepository = {
      getActiveExchanges: jest.fn(),
    };
    monitorExchanges = new MonitorExchanges(mockExchangeConfigRepository);
  });

  it('should return active exchanges from repository', async () => {
    const expectedExchanges = [
      new ExchangeConfigurationEntity('Exchange1', 'amqp://localhost:5672', 'queue1', true),
      new ExchangeConfigurationEntity('Exchange2', 'amqp://localhost:5672', 'queue2', true)
    ];

    mockExchangeConfigRepository.getActiveExchanges.mockResolvedValue(expectedExchanges);

    const result = await monitorExchanges.getActiveExchanges();

    expect(result).toEqual(expectedExchanges);
    expect(mockExchangeConfigRepository.getActiveExchanges).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no active exchanges', async () => {
    mockExchangeConfigRepository.getActiveExchanges.mockResolvedValue([]);

    const result = await monitorExchanges.getActiveExchanges();

    expect(result).toEqual([]);
    expect(mockExchangeConfigRepository.getActiveExchanges).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    mockExchangeConfigRepository.getActiveExchanges.mockRejectedValue(new Error('Repository error'));

    await expect(monitorExchanges.getActiveExchanges()).rejects.toThrow('Repository error');
  });
});
