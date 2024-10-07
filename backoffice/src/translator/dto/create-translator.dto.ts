import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTranslatorDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string
}
