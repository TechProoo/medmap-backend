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
import { TransformStringToArray } from "../../../utils/transformers/TransformStringToArray";

export class CreateDrugDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @TransformStringToArray()
  sideEffects: string[];

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expiryDate: Date;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stocks: number = 1;

  @IsString()
  @IsOptional()
  composition: string;

  @IsString()
  @IsOptional()
  manufacturer: string;

  @IsString()
  @IsOptional()
  uses: string;

  @IsString()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @TransformStringToArray()
  @IsNotEmpty()
  illnessIds: string[];
}
