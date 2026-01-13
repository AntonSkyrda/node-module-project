import { Module } from '@nestjs/common';
import { ExchengeRateService } from './exchenge-rate.service';
import { ExchengeRateController } from './exchange-rate.controller';

@Module({
  controllers: [ExchengeRateController],
  providers: [ExchengeRateService],
})
export class ExchangeRateModule {}
