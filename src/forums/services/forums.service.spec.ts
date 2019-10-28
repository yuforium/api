import { Test, TestingModule } from '@nestjs/testing';
import { ForumsService } from './forums.service';

describe('ForumsService', () => {
  let service: ForumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForumsService],
    }).compile();

    service = module.get<ForumsService>(ForumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
