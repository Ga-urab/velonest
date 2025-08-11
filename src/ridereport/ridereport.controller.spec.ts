import { Test, TestingModule } from '@nestjs/testing';
import { RidereportController } from './ridereport.controller';
import { RidereportService } from './ridereport.service';

describe('RidereportController', () => {
  let controller: RidereportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RidereportController],
      providers: [RidereportService],
    }).compile();

    controller = module.get<RidereportController>(RidereportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
