import { Test, TestingModule } from '@nestjs/testing';
import { Fsp259601Controller } from './fsp259601.controller';
import { Fsp259601Service } from './fsp259601.service';

describe('Fsp259601Controller', () => {
  let controller: Fsp259601Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Fsp259601Controller],
      providers: [Fsp259601Service],
    }).compile();

    controller = module.get<Fsp259601Controller>(Fsp259601Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
