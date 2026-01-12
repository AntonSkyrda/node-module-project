import { IsNotEmpty, Length } from 'class-validator';

export class CreateAutoDto {
  @IsNotEmpty()
  @Length(2, 55)
  mark: string;
}
