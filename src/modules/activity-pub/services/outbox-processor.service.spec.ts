import { Test, TestingModule } from '@nestjs/testing';
import { OutboxProcessorService } from './outbox-processor.service';

describe('OutboxProcessorService', () => {
  let service: OutboxProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutboxProcessorService],
    }).compile();

    service = module.get<OutboxProcessorService>(OutboxProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
