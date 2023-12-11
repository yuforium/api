import { Test, TestingModule } from '@nestjs/testing';
import { ObjectService } from './object.service';

// https://stackoverflow.com/questions/61031760/how-to-test-models-mongoose-in-a-service-nestjs-with-jest

describe('ObjectService', () => {
  let service: ObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectService
      ],
    }).compile();

    service = module.get<ObjectService>(ObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
