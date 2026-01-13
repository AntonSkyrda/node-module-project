import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvService } from '../../shared/services/env.service';
import { PrivatbankRateDto } from '../dto/privatbank-rate.dto';

@Injectable()
export class PrivatbankRatesClient {
  private readonly bankFetchUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly envService: EnvService,
  ) {
    this.bankFetchUrl = this.envService.bankFetchUrl;
  }

  async fetchCashRates(): Promise<PrivatbankRateDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<PrivatbankRateDto[]>(this.bankFetchUrl, {
        timeout: 10_000,
      }),
    );
    return data;
  }
}
