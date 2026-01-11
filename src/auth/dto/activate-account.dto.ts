import { IsString, Length } from 'class-validator';

export class ActivateAccountDto {
  @IsString()
  @Length(8, 20)
  password: string;

  @IsString()
  @Length(8, 20)
  confirmPassword: string;
}
