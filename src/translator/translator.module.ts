import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslatorController } from './translator.controller';
import { TranslateUtil } from "../utils/translate.util";
import { DatasourceService } from "./datasource.service";
import { ConfigService } from '@nestjs/config';
import { TranslatorEntity } from './entities/translator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCaseEntity } from './entities/customer-case.entity';
import { TranslatorRepository } from '../repository/translator.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TranslatorEntity, CustomerCaseEntity]),
  ],
  controllers: [TranslatorController],
  providers: [TranslatorService, TranslateUtil, DatasourceService, ConfigService, TranslatorRepository],
    // exports: [TranslateUtil]
})
export class TranslatorModule {}
