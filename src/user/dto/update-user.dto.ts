import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @Field()
    readonly email: string;

    @Field()
    readonly password: string;
}
