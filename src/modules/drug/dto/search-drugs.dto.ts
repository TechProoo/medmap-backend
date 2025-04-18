import { Type } from "class-transformer";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class SearchDrugsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  illnessId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minStocks?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxStocks?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;
}
