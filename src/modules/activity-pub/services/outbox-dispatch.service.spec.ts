import { Test, TestingModule } from '@nestjs/testing';
import { OutboxDispatchService } from './outbox-dispatch.service';

describe('OutboxService', () => {
  let service: OutboxDispatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutboxDispatchService],
    }).compile();

    service = module.get<OutboxDispatchService>(OutboxDispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
