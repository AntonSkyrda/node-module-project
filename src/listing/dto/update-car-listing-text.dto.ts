import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateListingTextDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;
}
