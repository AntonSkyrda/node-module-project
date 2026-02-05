import { Module } from '@nestjs/common';
import { EnvService } from './services/env.service';

@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class SharedModule {}
