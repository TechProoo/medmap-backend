import { IsString, IsUUID } from "class-validator";

export class IdDto {
  @IsString({ message: "The Id you provided is not a valid string" })
  @IsUUID(undefined, { message: "The Id you provided is invalid" })
  declare id: string;
}
