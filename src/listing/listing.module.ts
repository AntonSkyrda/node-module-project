import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { PriceCalculatorService } from './services/price-calculator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarListing } from './entities/listing.entity';
import { AutoModule } from '../auto/auto.module';
import { AuthModule } from '../auth/auth.module';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';
import { ProfanityCheckerModule } from '../profanity-checker/profanity-checker.module';
import { MailerModule } from '../mailer/mailer.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarListing]),
    AutoModule,
    AuthModule,
    ExchangeRateModule,
    ProfanityCheckerModule,
    MailerModule,
    SharedModule,
  ],
  controllers: [ListingController],
  providers: [ListingService, PriceCalculatorService],
})
export class ListingModule {}
