import { Test, TestingModule } from '@nestjs/testing';
import { ObjectController } from './object.controller';

describe('Object Controller', () => {
  let controller: ObjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectController],
    }).compile();

    controller = module.get<ObjectController>(ObjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
