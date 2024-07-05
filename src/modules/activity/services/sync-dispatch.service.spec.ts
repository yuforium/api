import { Test, TestingModule } from '@nestjs/testing';
import { SyncDispatchService } from './sync-dispatch.service';

describe('OutboxService', () => {
  let service: SyncDispatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncDispatchService],
    }).compile();

    service = module.get<SyncDispatchService>(SyncDispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
