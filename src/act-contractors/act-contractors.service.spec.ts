import { Test, TestingModule } from '@nestjs/testing';
import { ActContractorsService } from './act-contractors.service';

describe('ActContractorsService', () => {
  let service: ActContractorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActContractorsService],
    }).compile();

    service = module.get<ActContractorsService>(ActContractorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
