import { IsString, IsEmail, MinLength } from "class-validator";

export class SignupDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
