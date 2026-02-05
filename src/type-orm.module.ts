import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvService } from './shared/services/env.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (envService: EnvService) => ({
        type: envService.dbType as 'mysql',
        host: envService.dbHost,
        port: envService.dbPort,
        username: envService.dbUser,
        password: envService.dbPassword,
        database: envService.dbName,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [EnvService],
    }),
  ],
})
export class TypeormModule {}
