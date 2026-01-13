import { Injectable } from '@nestjs/common';
import { ExchangeRatesService } from '../exchenge-rate.service';
import { DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RatesCronService {
  constructor(
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron('0 0 0 * * *', {
    timeZone: 'Europe/Kyiv',
  })
  async refreshRatesAndRecalculatePrices() {
    await this.dataSource.transaction(async (manager) => {
      const rate = await this.exchangeRatesService.fetchAndStoreToday();
      await manager.query('SQL', {
        rateId: rate.id,
        usdSale: rate.usdSale,
        eurSale: rate.eurSale,
      });
    });
  }
}
