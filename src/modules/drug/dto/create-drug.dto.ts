import { Transform } from "class-transformer";
import {
  IsArray,
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

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => value && new Date(value))
  expiryDate: Date;

  @Min(0)
  @IsNumber()
  @Transform(({ value }) => value && parseFloat(value))
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
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

  @IsArray()
  @IsString({ each: true })
  @TransformStringToArray()
  illnessIds: string[];
}
