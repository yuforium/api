import { Test, TestingModule } from '@nestjs/testing';
import { ObjectService } from './object.service';
import { ActivityStreams } from '@yuforium/activity-streams';
import { StoredObjectResolver } from './resolver/stored-object.resolver';
import { ObjectType } from './type/object.type';
import { getModelToken } from '@nestjs/mongoose';
import { ObjectRecord } from './schema/object.schema';
import { RelationshipRecord } from './schema/relationship.schema';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { ActorDto } from './dto/actor/actor.dto';
import { ActorType } from './type/actor.type';
import { ObjectDto } from './dto/object.dto';
import { ActorRecord } from './schema/actor.schema';

class TestResolver extends ActivityStreams.Resolver {
  public links = {
    'test': 'https://localhost/forums/test',
    'test1': 'https://localhost/forums/test2',
    'test2': 'https://localhost/forums/test3'
  };

  protected items: {[k: string]: 'forum' | 'person'} = {
    'test-forum': 'forum',
    'another-forum': 'forum',
    'test-user': 'person'
  }

  public objects: {[k: string]: ObjectType | ActorType} = {};

  constructor(protected objectService: ObjectService) {
    super();

    this.objects = this.all;

    Object.entries(this.links).forEach(([k, v]) => {
      this.objects[v] = {
        '@context': [
          'https://www.w3.org/ns/activitystreams',
          'https://yuforium.com/ns/activitystreams'
        ],
        type: ['Service', 'Forum'],
        id: v,
        name: `${k.charAt(0).toUpperCase()}${k.slice(1)} Forum`,
        summary: `A forum with a preferred username of ${k}`,
        preferredUsername: k
      };
    });
  }

  async handle(request: string) {
    if (this.objects[request]) {
      return this.objectService.docToInstance(this.objects[request]);
    }
    return super.handle(request);
  }

  public forum(name: string): ActorDto {
    return Object.assign(new ActorDto(), {
      type: ['Service', 'Forum'],
      id: `https://localhost/forums/${name}`,
      name: `${name.charAt(0).toUpperCase()}${name.slice(1)} Forum`,
      summary: `A Forum Named ${name}`,
      preferredUsername: name
    });
  }

  public person(name: string): ActorDto {
    return Object.assign(new ActorDto(), {
      type: ['Person'],
      id: `https://localhost/person/${name}`,
      name: `A Person Named ${name}`,
      preferredUsername: name
    });
  }

  public get all() {
    const acc: {[k: string]: ObjectDto | ActorDto} = {};

    return Object.entries(this.items).reduce((acc, [name, type]) => {
      const obj: ActorDto | ObjectDto = this[type](name);
      acc[obj.id] = obj;
      return acc;
    }, acc);
  }
}

class TestObjectService extends ObjectService {
  public testIsPublic(obj: ObjectType) {
    return this.isPublic(obj);
  }
}

describe('ObjectService', () => {
  let service: TestObjectService;
  let resolver: TestResolver;

  const pub = 'https://www.w3.org/ns/activitystreams#Public';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ObjectService,
          useClass: TestObjectService
        },
        {
          provide: getModelToken(ObjectRecord.name),
          useValue: {}
        },
        {
          provide: getModelToken(ActorRecord.name),
          useValue: {}
        },
        {
          provide: getModelToken(RelationshipRecord.name),
          useValue: {}
        },
        {
          provide: StoredObjectResolver,
          useFactory: (objectService: ObjectService) => new TestResolver(objectService),
          inject: [ObjectService]
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'service.defaultDomain') {
                return 'localhost';
              }
            }
          }
        }
      ],
    })
    // .useMocker((token) => {
    //   if (token === StoredObjectResolver) {
    //     return new TestResolver();
    //   }
    // })
      .compile();

    service = module.get<TestObjectService>(ObjectService);
    resolver = module.get<TestResolver>(StoredObjectResolver);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should resolve a single link reference', async () => {
  //   const obj = plainToInstance(ActorDto, genForum('resolve'));
  //   obj.audience = new Link('https://localhost/forums/test');
  //   await service.resolveFields(obj, ['audience']);

  //   expect(obj.audience).toBeInstanceOf(ActorDto);
  // });

  // it('should resolve a single string reference', async () => {
  //   const obj = plainToInstance(ActorDto, genForum('resolve'));
  //   obj.audience = 'https://localhost/forums/test';
  //   await service.resolveFields(obj, ['audience']);

  //   expect(obj.audience).toBeInstanceOf(ActorDto);
  // });

  it('should resolve multiple string references', async () => {
    const forum = plainToInstance(ActorDto, resolver.forum('resulve-multiple'));
    const items = resolver.all;

    forum.audience = Object.keys(items);

    await service.resolveFields(forum, ['audience']);

    forum.audience.forEach((a: any) => {
      expect(a).toMatchObject(items[a.id]);
    });
  });

  const baseObj: ObjectType = {
    id: 'https://localhost/objects/note',
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Note'
  }
  const multiAddr = ['https://localhost/users/chris', pub];
  const singleAddrObj = {
    id: pub,
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Person'
  };
  const singleAddrLink = {
    type: 'Link',
    href: pub
  };

  ['to', 'cc', 'bcc'].forEach(field => {
    it(`isPublic() should resolve the public id in "${field}" as true`, async () => {
      expect(service.testIsPublic({ ...baseObj, [field]: pub })).toBe(true);
    });
    it(`isPublic() should resolve the public id in "${field}" as true with multiple values`, async () => {
      expect(service.testIsPublic({ ...baseObj, [field]: multiAddr })).toBe(true);
    });
    it(`isPublic() should resolve the public id in "${field}" as true with an object`, async () => {
      expect(service.testIsPublic({ ...baseObj, [field]: singleAddrObj })).toBe(true);
    });
    it(`isPublic() should resolve the public id in "${field}" as true with a link`, async () => {
      expect(service.testIsPublic({ ...baseObj, [field]: singleAddrLink })).toBe(true);
    });
  });
});
