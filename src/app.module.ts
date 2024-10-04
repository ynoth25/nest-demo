import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslatorModule } from './translator/translator.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from  'path';
import { TranslatorEntity } from './translator/entities/translator.entity';
import { CustomerCaseEntity } from './translator/entities/customer-case.entity';

@Module({
  imports: [
      TranslatorModule,
      TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'inventory-node',
          entities: [join(__dirname, '**', '*.entity{.ts,.tsx}')],
          synchronize: true,
          logging: true,
      }),
      TypeOrmModule.forRoot({
          'name': 'us',
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'demo',
          schema: 'public',
          entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
          synchronize: true,
          logging: true,
      }),
    TypeOrmModule.forFeature([TranslatorEntity, CustomerCaseEntity]),
    TranslatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
