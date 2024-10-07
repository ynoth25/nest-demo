import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TranslatorService } from './translator.service';
import { TranslatorController } from './translator.controller';
import { TranslatorEntity } from './entities/translator.entity';
import { TranslateUtil } from '../utils/translate.util';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatasourceService } from './datasource.service';
import { TranslatorRepository } from '../repository/translator.repository';
import { join } from 'path';

describe('UserController Integration', () => {
  let app: INestApplication;
  let dataSourceService: DatasourceService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([TranslatorEntity]),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASS'),
            database: configService.get<string>('DATABASE_NAME'),
            entities: [join(__dirname, '../**/*.entity{.ts,.tsx}')],
            synchronize: true,
          }),
        }),
      ],
      controllers: [TranslatorController],
      providers: [
        TranslatorService,
        DatasourceService,
        TranslateUtil,
        ConfigService,
        TranslatorRepository,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should trigger validation', async () => {
    const response = await request(app.getHttpServer())
      .post('/translator')
      .send({
        name: '',
        email: 'jane',
      })
      .expect(400);

    // expect(response.body.id).toBeDefined();
    // expect(response.body.name).toEqual('Jane Doe');
  });

  it('should create a user via POST /users', async () => {
    const response = await request(app.getHttpServer())
      .post('/translator')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toEqual('Jane Doe');
  });

  it('should get users via GET /users', async () => {
    const response = await request(app.getHttpServer())
      .get('/translator')
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  // it('should get user via GET /users/id', async () => {
  //   const id = 1;
  //   const response = await request(app.getHttpServer())
  //     .get(`/translator/${id}`)
  //     .expect(200);
  //
  //   expect(response.body).toBeDefined();
  //   expect(response.body).toHaveProperty('name');
  //   expect(response.body.name).toEqual('Jane Doe');
  //   expect(response.body.email).toEqual('janedoe@gmail.com');
  // });

  it('should return list of table datas', async () => {
    const startTime = Date.now();
    const response = await request(app.getHttpServer())
      .post(`/translator/getDataFromSource`)
      .send({
        client: 'att',
      })
      .expect(201);
    console.log(response.body);
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
