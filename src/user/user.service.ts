import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from "typeorm";
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class UserService {
    constructor( @InjectRepository(User) private readonly userRepository: Repository<User>, ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find()
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({id:id});
  }

  async findOneBy(query): Promise<User> {
        return this.userRepository.findOne({ where: query });
    }

  async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOneBy({id:id});
        Object.assign(user, updateUserDto);

        return this.userRepository.save(user);
  }

  async remove(id: number) {
    await this.userRepository.delete(id);
  }
}
