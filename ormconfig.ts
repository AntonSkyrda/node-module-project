import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { EnvService } from './src/shared/services/env.service';
import { DataSource } from 'typeorm';

const configService = new ConfigService();
const envService = new EnvService(configService);

export default new DataSource({
  type: envService.dbType as 'mysql',
  host: envService.dbHost,
  port: envService.dbPort,
  username: envService.dbUser,
  password: envService.dbPassword,
  database: envService.dbName,
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
});
