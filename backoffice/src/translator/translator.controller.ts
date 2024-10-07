import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { CreateTranslatorDto } from './dto/create-translator.dto';
import { UpdateTranslatorDto } from './dto/update-translator.dto';
import { TranslatorEntity } from './entities/translator.entity';
import { TranslatorRepository } from '../repository/translator.repository';
import { TranslateUtil } from '../utils/translate.util';
import { TestDto } from './dto/test.dto';

@Controller('translator')
export class TranslatorController {
  constructor(
    private readonly translatorService: TranslatorService,
    private readonly translatorRepository: TranslatorRepository,
  ) {}

  @Post()
  create(@Body() createTranslatorDto: CreateTranslatorDto) {
    return this.translatorService.create(createTranslatorDto);
  }

  @Get()
  findAll() {
    return this.translatorService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTranslatorDto: UpdateTranslatorDto) {
    return this.translatorService.update(+id, updateTranslatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.translatorService.remove(+id);
  }

  @Post('getDataFromSource')
  async getDataFromSource(@Body() testDto: TestDto) {
    try {
      return this.translatorRepository.getTranslateRecords(testDto.client);
    } catch (error) {
      console.error('Error fetching data from source:', error); // Log the error for debugging
      throw new Error('Failed to retrieve data from the data source');
    }
  }
}
