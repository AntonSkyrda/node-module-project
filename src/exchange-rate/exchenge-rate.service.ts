import { Injectable } from '@nestjs/common';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { PrivatbankRatesClient } from './services/http.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEnum } from '../constants/currency.enum';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
    private readonly privat: PrivatbankRatesClient,
  ) {}

  async fetchAndStoreToday(): Promise<ExchangeRate> {
    const data = await this.privat.fetchCashRates();

    const usd = data.find(
      (x) => x.ccy === CurrencyEnum.USD && x.base_ccy === CurrencyEnum.UAH,
    );
    const eur = data.find(
      (x) => x.ccy === CurrencyEnum.EUR && x.base_ccy === CurrencyEnum.UAH,
    );
    if (!usd || !eur) throw new Error('PrivatBank rates missing USD/EUR');

    const today = new Date();
    const asOfDate = today.toISOString().slice(0, 10);

    const entity = this.exchangeRateRepository.create({
      provider: 'PRIVATBANK',
      asOfDate,
      fetchedAt: today,
      usdBuy: String(usd.buy),
      usdSale: String(usd.sale),
      eurBuy: String(eur.buy),
      eurSale: String(eur.sale),
      raw: data,
    });

    return await this.exchangeRateRepository.save(entity);
  }

  async getLatest(): Promise<ExchangeRate> {
    const rate = await this.exchangeRateRepository.findOne({
      order: { fetchedAt: 'DESC' },
    });
    if (!rate) throw new Error('No exchange rates in DB yet');
    return rate;
  }
}
