import { Test, TestingModule } from '@nestjs/testing';
import { ForumOutboxController } from './forum-outbox.controller';

describe('ForumOutboxController', () => {
  let controller: ForumOutboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumOutboxController],
    }).compile();

    controller = module.get<ForumOutboxController>(ForumOutboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
