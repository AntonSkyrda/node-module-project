import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  public readonly dbType: string;
  public readonly dbHost: string;
  public readonly dbPort: number;
  public readonly dbName: string;
  public readonly dbUser: string;
  public readonly dbPassword: string;

  constructor(private configService: ConfigService) {
    this.dbType = configService.get<string>('DB_TYPE') || '';
    this.dbHost = configService.get<string>('DB_HOST') || '';
    this.dbPort = configService.get<number>('DB_PORT') || 3306;
    this.dbName = configService.get<string>('DB_NAME') || '';
    this.dbUser = configService.get<string>('DB_USER') || '';
    this.dbPassword = configService.get<string>('DB_PASSWORD') || '';
  }
}
