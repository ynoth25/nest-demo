import { Injectable } from '@nestjs/common';
import { CreateTranslatorDto } from './dto/create-translator.dto';
import { UpdateTranslatorDto } from './dto/update-translator.dto';
import { TranslateUtil } from "../utils/translate.util";
import { TranslatorEntity } from "./entities/translator.entity";

@Injectable()
export class TranslatorService {
    constructor(
        private translateUtil: TranslateUtil,
    ) {
    }
  create(createTranslatorDto: CreateTranslatorDto) {
    return 'This action adds a new translator';
  }

  findAll() {
    // return this.translateUtil.translate('test', 'us');
  }

  findOne(id: number) {
    return `This action returns a #${id} translator`;
  }

  update(id: number, updateTranslatorDto: UpdateTranslatorDto) {
    return `This action updates a #${id} translator`;
  }

  remove(id: number) {
    return `This action removes a #${id} translator`;
  }

  translate(language: string, language2: any, entity: any, updateValues: object, parameters: string[]) {
      return this.translateUtil.translate('test', language, entity, updateValues, parameters);
    }
}
