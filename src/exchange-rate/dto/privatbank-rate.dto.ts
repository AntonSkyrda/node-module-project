import { CurrencyEnum } from '../../constants/currency.enum';

export interface PrivatbankRateDto {
  ccy: Exclude<CurrencyEnum, CurrencyEnum.UAH>;
  base_ccy: CurrencyEnum.UAH;
  buy: string;
  sale: string;
}
