import { Injectable } from '@nestjs/common';
import { CurrencyEnum } from '../../constants/currency.enum';
import { ExchangeRate } from '../../exchange-rate/entities/exchange-rate.entity';

export type RateSide = 'BUY' | 'SALE';

@Injectable()
export class PriceCalculatorService {
  recalcAll(
    originalCurrency: CurrencyEnum,
    originalAmount: string | number,
    rate: ExchangeRate,
    side: RateSide = 'SALE',
  ) {
    const amount =
      typeof originalAmount === 'string'
        ? Number(originalAmount)
        : originalAmount;

    const usdRate = Number(side === 'SALE' ? rate.usdSale : rate.usdBuy);
    const eurRate = Number(side === 'SALE' ? rate.eurSale : rate.eurBuy);

    const round2 = (n: number) => Math.round(n * 100) / 100;

    let uah: number;
    if (originalCurrency === CurrencyEnum.UAH) uah = amount;
    else if (originalCurrency === CurrencyEnum.USD) uah = amount * usdRate;
    else uah = amount * eurRate;

    const usd = originalCurrency === CurrencyEnum.USD ? amount : uah / usdRate;
    const eur = originalCurrency === CurrencyEnum.EUR ? amount : uah / eurRate;

    return {
      priceUah: round2(uah).toFixed(2),
      priceUsd: round2(usd).toFixed(2),
      priceEur: round2(eur).toFixed(2),
    };
  }
}
