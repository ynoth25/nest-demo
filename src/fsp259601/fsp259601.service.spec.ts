import { Test, TestingModule } from '@nestjs/testing';
import { Fsp259601Service } from './fsp259601.service';

describe('Fsp259601Service', () => {
  let service: Fsp259601Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Fsp259601Service],
    }).compile();

    service = module.get<Fsp259601Service>(Fsp259601Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
