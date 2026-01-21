import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchenge-rate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from '../shared/shared.module';
import { PrivatbankRatesClient } from './services/http.service';
import { RatesCronService } from './services/rates-cron.service';
import { ExchangeRateController } from './exchange-rate.controller';

@Module({
  providers: [ExchangeRateService, PrivatbankRatesClient, RatesCronService],
  imports: [TypeOrmModule.forFeature([ExchangeRate]), HttpModule, SharedModule],
  exports: [ExchangeRateService],
  controllers: [ExchangeRateController],
})
export class ExchangeRateModule {}
