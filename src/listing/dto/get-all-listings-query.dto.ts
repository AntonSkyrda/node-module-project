import { IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { CurrencyEnum } from '../../constants/currency.enum';

export class GetAllListingsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(CurrencyEnum)
  currency?: CurrencyEnum = CurrencyEnum.UAH;

  @IsOptional()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(['createdAt', 'price'])
  sortBy?: 'createdAt' | 'price' = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDir?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsInt()
  autoId?: number;

  @IsOptional()
  @IsInt()
  modelId?: number;
}
