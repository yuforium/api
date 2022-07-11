import { Test, TestingModule } from '@nestjs/testing';
import { ForumService } from './forum.service';

describe('ForumService', () => {
  let service: ForumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForumService],
    }).compile();

    service = module.get<ForumService>(ForumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
