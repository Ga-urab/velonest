import { Test, TestingModule } from '@nestjs/testing';
import { ActContractorsController } from './act-contractors.controller';
import { ActContractorsService } from './act-contractors.service';

describe('ActContractorsController', () => {
  let controller: ActContractorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActContractorsController],
      providers: [ActContractorsService],
    }).compile();

    controller = module.get<ActContractorsController>(ActContractorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
