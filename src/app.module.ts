import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/filters/global-exeptions.filter';
import { TypeormModule } from './type-orm.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AutoModule } from './auto/auto.module';
import { RolesGuard } from './auth/guards/role.guard';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProfanityCheckerModule } from './profanity-checker/profanity-checker.module';
import { ListingModule } from './listing/listing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    SharedModule,
    TypeormModule,
    AuthModule,
    MailerModule,
    AutoModule,
    ExchangeRateModule,
    ListingModule,
    ProfanityCheckerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
