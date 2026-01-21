import { Controller, Post } from '@nestjs/common';
import { ExchangeRateService } from './exchenge-rate.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../constants/user-role.enum';

@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Roles(UserRoleEnum.ADMIN)
  @Post('seed-today')
  seedToday() {
    return this.exchangeRateService.fetchAndStoreToday();
  }
}
