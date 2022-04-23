import { Test, TestingModule } from '@nestjs/testing';
import { SyncStreamService } from './sync-stream.service';

describe('SyncStreamService', () => {
  let service: SyncStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncStreamService],
    }).compile();

    service = module.get<SyncStreamService>(SyncStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
