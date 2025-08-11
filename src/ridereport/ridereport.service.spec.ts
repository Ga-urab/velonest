import { Test, TestingModule } from '@nestjs/testing';
import { RidereportService } from './ridereport.service';

describe('RidereportService', () => {
  let service: RidereportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RidereportService],
    }).compile();

    service = module.get<RidereportService>(RidereportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
