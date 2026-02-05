import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ExchangeRateService } from '../exchenge-rate.service';
import { RECALC_LISTING_PRICES_SQL } from '../sql/recalculate-listing-prices.sql';

@Injectable()
export class RatesCronService {
  constructor(
    private readonly exchangeRateService: ExchangeRateService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron('0 0 0 * * *', {
    timeZone: 'Europe/Kyiv',
  })
  async refreshRatesAndRecalculatePrices() {
    await this.dataSource.transaction(async (manager) => {
      const rate = await this.exchangeRateService.fetchAndStoreToday();

      const usdSale = Number(rate.usdSale);
      const eurSale = Number(rate.eurSale);

      await manager.query(RECALC_LISTING_PRICES_SQL, [
        rate.id,
        usdSale,
        eurSale,
        eurSale,
        usdSale,
        usdSale,
        eurSale,
      ]);
    });
  }
}
