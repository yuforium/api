import { Test, TestingModule } from '@nestjs/testing';
import { ForumsController } from './forums.controller';

describe('Forums Controller', () => {
  let controller: ForumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumsController],
    }).compile();

    controller = module.get<ForumsController>(ForumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
