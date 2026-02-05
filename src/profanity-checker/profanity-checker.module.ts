import { Module } from '@nestjs/common';
import { ProfanityCheckerService } from './profanity-checker.service';

@Module({
  providers: [ProfanityCheckerService],
  exports: [ProfanityCheckerService],
})
export class ProfanityCheckerModule {}
