import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 55)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @Length(2, 55)
  lastName: string;
}
