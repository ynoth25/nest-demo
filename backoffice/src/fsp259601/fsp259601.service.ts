import { Injectable } from '@nestjs/common';
import { CreateFsp259601Dto } from './dto/create-fsp259601.dto';
import { UpdateFsp259601Dto } from './dto/update-fsp259601.dto';

@Injectable()
export class Fsp259601Service {
  create(createFsp259601Dto: CreateFsp259601Dto) {
    return 'This action adds a new fsp259601';
  }

  findAll() {
    return `This action returns all fsp259601`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fsp259601`;
  }

  update(id: number, updateFsp259601Dto: UpdateFsp259601Dto) {
    return `This action updates a #${id} fsp259601`;
  }

  remove(id: number) {
    return `This action removes a #${id} fsp259601`;
  }
}
