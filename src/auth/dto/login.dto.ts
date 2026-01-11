import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(5, 20)
  password: string;
}
