import { Test, TestingModule } from '@nestjs/testing';
import { ForumService } from './forum.service';
import { ObjectService } from '../object/object.service';
import { getModelToken } from '@nestjs/mongoose';
import { ActorRecord } from '../object/schema/actor.schema';

describe('ForumService', () => {
  let service: ForumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumService,
        {
          provide: ObjectService,
          useValue: {},
        },
        {
          provide: getModelToken(ActorRecord.name),
          useValue: {},
        }
      ],
    }).compile();

    service = module.get<ForumService>(ForumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
