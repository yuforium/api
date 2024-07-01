import { Test, TestingModule } from '@nestjs/testing';
import { InboxProcessorService } from './inbox-processor.service';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { ActivityPubService } from './activity-pub.service';
import { getModelToken } from '@nestjs/mongoose';
import { ActorRecord } from '../../../modules/object/schema/content.schema';

describe('InboxProcessorService', () => {
  let service: InboxProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxProcessorService,
        {
          provide: ActivityService,
          useValue: {},
        },
        {
          provide: ObjectService,
          useValue: {},
        },
        {
          provide: ActivityPubService,
          useValue: {}
        },
        {
          provide: getModelToken(ActorRecord.name),
          useValue: {}
        }
      ],
    }).compile();

    service = module.get<InboxProcessorService>(InboxProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
