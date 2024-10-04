import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Fsp259601Service } from './fsp259601.service';
import { CreateFsp259601Dto } from './dto/create-fsp259601.dto';
import { UpdateFsp259601Dto } from './dto/update-fsp259601.dto';

@Controller('fsp259601')
export class Fsp259601Controller {
  constructor(private readonly fsp259601Service: Fsp259601Service) {}

  @Post()
  create(@Body() createFsp259601Dto: CreateFsp259601Dto) {
    return this.fsp259601Service.create(createFsp259601Dto);
  }

  @Get()
  findAll() {
    return this.fsp259601Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fsp259601Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFsp259601Dto: UpdateFsp259601Dto) {
    return this.fsp259601Service.update(+id, updateFsp259601Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fsp259601Service.remove(+id);
  }
}
