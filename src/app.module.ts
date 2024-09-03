import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslatorModule } from './translator/translator.module';
import {TypeOrmModule} from "@nestjs/typeorm";

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
          entities: [],
          synchronize: false,
      }),
      TypeOrmModule.forRoot({
          name: 'us',
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'demo',
          entities: [],
          synchronize: false,
      }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
