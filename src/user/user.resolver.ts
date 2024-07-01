import {Args, Query, Resolver, Int, Mutation} from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";


@Resolver(of => User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @Query((returns) => [User])
    async users(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Query((returns) => User, { nullable: true })
    async user(@Args('id', { type: () => Int }) id: number): Promise<User> {
        return this.userService.findOne(id);
    }

    @Mutation((returns) => User)
    async create(@Args('createUserDto') createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Mutation((returns) => User)
    async update(
        @Args('updateUserDto') updateUserDto: UpdateUserDto,
        @Args('id') id: number
    ) {
        return this.userService.update(id, updateUserDto);
    }

    @Mutation((returns) => User)
    async remove(@Args('id') id: number) {
        const user = await this.userService.findOne(id);
        await this.userService.remove(id);

        return user;
    }
}
