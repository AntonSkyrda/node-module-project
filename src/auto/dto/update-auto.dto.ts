import { CreateAutoDto } from './create-auto.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAutoDto extends PartialType(CreateAutoDto) {}
