import { Test, TestingModule } from '@nestjs/testing';
import { SharedInboxController } from './shared-inbox.controller';

describe('SharedInbox Controller', () => {
  let controller: SharedInboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharedInboxController],
    }).compile();

    controller = module.get<SharedInboxController>(SharedInboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
