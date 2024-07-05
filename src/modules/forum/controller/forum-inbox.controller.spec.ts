import { Test, TestingModule } from '@nestjs/testing';
import { ForumInboxController } from './forum-inbox.controller';

describe('InboxController', () => {
  let controller: ForumInboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumInboxController],
    }).compile();

    controller = module.get<ForumInboxController>(ForumInboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
