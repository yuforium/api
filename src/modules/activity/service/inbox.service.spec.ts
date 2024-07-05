import { Test, TestingModule } from '@nestjs/testing';
import { InboxService } from './inbox.service';
import { ActivityService } from './activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { getModelToken } from '@nestjs/mongoose';
import { ActorRecord } from '../../../modules/object/schema/actor.schema';

describe('InboxService', () => {
  let service: InboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxService,
        {
          provide: ActivityService,
          useValue: {}
        },
        {
          provide: ObjectService,
          useValue: {}
        },
        {
          provide: getModelToken(ActorRecord.name),
          useValue: { }
        }
      ],
    }).compile();

    service = module.get<InboxService>(InboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
