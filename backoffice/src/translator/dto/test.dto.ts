import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TestDto {
  @IsNotEmpty()
  @IsString()
  client: string
}
