import { Test, TestingModule } from '@nestjs/testing';
import { ActivityStreamService } from './activity-stream.service';

describe('ActivityStreamService', () => {
  let service: ActivityStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityStreamService],
    }).compile();

    service = module.get<ActivityStreamService>(ActivityStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
