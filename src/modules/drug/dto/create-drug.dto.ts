import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateDrugDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  sideEffects: string[];

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expiryDate: Date;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  @IsOptional()
  inStock: boolean = true;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  illnessIds: string[];
}
