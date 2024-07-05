import { Test, TestingModule } from '@nestjs/testing';
import { ActivityPubService } from './activity-pub.service';

describe('ActivityPubService', () => {
  let service: ActivityPubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityPubService],
    }).compile();

    service = module.get<ActivityPubService>(ActivityPubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
