import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateIllnessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  symptoms: string[][]; // Array of symptom groups

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  precautions: string[];
}
