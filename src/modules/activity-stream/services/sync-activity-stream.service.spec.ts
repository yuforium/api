import { Test, TestingModule } from '@nestjs/testing';
import { SyncActivityStreamService } from './sync-activity-stream.service';

describe('SyncActivityStreamService', () => {
  let service: SyncActivityStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncActivityStreamService],
    }).compile();

    service = module.get<SyncActivityStreamService>(SyncActivityStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
