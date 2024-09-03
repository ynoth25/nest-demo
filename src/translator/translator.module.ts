import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslatorController } from './translator.controller';
import { TranslateUtil } from "../utils/translate.util";
import {DatasourceService } from "./datasource.service";

@Module({
  controllers: [TranslatorController],
  providers: [TranslatorService, TranslateUtil, DatasourceService],
    exports: [TranslateUtil]
})
export class TranslatorModule {}
