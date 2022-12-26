import { Test, TestingModule } from '@nestjs/testing';
import { InboxProcessorService } from './inbox-processor.service';

describe('InboxProcessorService', () => {
  let service: InboxProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InboxProcessorService],
    }).compile();

    service = module.get<InboxProcessorService>(InboxProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
