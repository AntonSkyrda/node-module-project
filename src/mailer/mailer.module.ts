import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MailerService } from './mailer.service';

@Module({
  imports: [SharedModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
