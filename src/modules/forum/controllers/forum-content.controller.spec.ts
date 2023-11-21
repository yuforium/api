import { Test, TestingModule } from '@nestjs/testing';
import { ForumContentController } from './forum-content.controller';

describe('ForumContentController', () => {
  let controller: ForumContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumContentController],
    }).compile();

    controller = module.get<ForumContentController>(ForumContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
