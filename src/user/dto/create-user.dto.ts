import {IsString, IsNotEmpty, IsEmail} from 'class-validator';
import {Unique} from "typeorm";
import {User} from "../entities/user.entity";
import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    @Field()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    readonly password: string;
}
