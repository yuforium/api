import { Test, TestingModule } from '@nestjs/testing';
import { ObjectService } from './object.service';

describe('ObjectService', () => {
  let service: ObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectService],
    }).compile();

    service = module.get<ObjectService>(ObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
