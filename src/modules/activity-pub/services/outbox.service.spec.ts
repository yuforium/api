import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from './outbox.service';

describe('OutboxService', () => {
  let service: OutboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutboxService],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
