import {
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';
import { CurrencyEnum } from '../../constants/currency.enum';

export class CreateCarListingDto {
  @IsString()
  @Length(5, 55)
  title: string;

  @IsInt()
  @IsPositive()
  autoId: number;

  @IsInt()
  @IsPositive()
  modelId: number;

  @IsInt()
  @Min(1900)
  year: number;

  @IsInt()
  @Min(0)
  mileage: number;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsEnum(CurrencyEnum)
  originalCurrency: CurrencyEnum;

  @IsNumber()
  @Min(0.01)
  originalAmount: number;
}
