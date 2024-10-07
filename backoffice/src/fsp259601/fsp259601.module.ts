import { Module } from '@nestjs/common';
import { Fsp259601Service } from './fsp259601.service';
import { Fsp259601Controller } from './fsp259601.controller';

@Module({
  controllers: [Fsp259601Controller],
  providers: [Fsp259601Service],
})
export class Fsp259601Module {}
