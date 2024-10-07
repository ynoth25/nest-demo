import { DatasourceService } from '../translator/datasource.service';
import { Injectable } from '@nestjs/common';
import { TranslatorEntity } from '../translator/entities/translator.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TranslatorRepository {
  constructor(private readonly dataSourceService: DatasourceService,) {
  }

  async getTranslateRecords(client): Promise<TranslatorEntity[]> {
    return await this.dataSourceService.getDataSource(client)
      .getRepository(TranslatorEntity)
      .createQueryBuilder('translator')
      // .where('translator.id = :id', {id:1})
      .getMany();
  }
}